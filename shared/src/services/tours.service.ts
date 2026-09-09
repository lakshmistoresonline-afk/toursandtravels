// @ts-nocheck
import { ApiError } from "@workspace/shared/utils/ApiError";
import { MediaService } from "@workspace/shared/services/media.service";
import { Service } from "@workspace/shared/services/service.base";
import { UseClassMiddleware } from "@workspace/shared/decorators/useClassMiddleware";
import { loggerMiddleware } from "@workspace/shared/middlewares/logger.middleware";
import { verifyUser } from "@workspace/shared/middlewares/auth.middleware";
import { asServiceMiddleware } from "@workspace/shared/middlewares/utils";
import { MetaDetailsService } from "@workspace/shared/services/meta-details.service";
import type { AddTourActionDate } from "@workspace/shared/schemas/tour.schema";
import type { Database, Tables, TablesInsert } from "@workspace/shared/types/supabase";
import type {
	GetHighLevelToursResponse,
	GetTourDetails,
	GetTourDetailsForUpdate,
	HighLevelTour,
	TourOptionsListResp,
	ToursListResp,
} from "@workspace/shared/types/tours";
import { type TourFilters } from "@workspace/shared/schemas/tours-filter.schema";
import { type FPTourFilters } from "@workspace/shared/schemas/fp-tours-filter.schema";
import type { FP_HighLevelTour, GetFPHighLevelToursResponse } from "@workspace/shared/types/fp-tours";
import { UseMiddleware } from "@workspace/shared/decorators/useMiddleware";

@UseClassMiddleware(loggerMiddleware)
export class ToursService extends Service {
	/** Add tour details */
	@UseMiddleware(asServiceMiddleware<ToursService>(verifyUser))
	async addTour(input: AddTourActionDate): Promise<string | null> {
		if (this.currentUser == null || this.currentUser.id == null) {
			throw new ApiError("Unauthorized", 401, []);
		}

		const mediaSvc = await this.createSubService(MediaService);

		let uploadedCoverPath = "";
		let uploadedImagePaths: string[] = [];
		let metaId: string | null = null;
		let tourId: string | null = null;

		try {
			// Upload cover image
			if (input.cover_image && input.cover_image.size > 0) {
				const { data } = await mediaSvc.uploadImage(input.cover_image);
				uploadedCoverPath = data?.path ?? "";
			}

			// Upload secondary images
			if (input.images && input.images.length > 0) {
				for (const img of input.images) {
					if (img && img.size > 0) {
						const { data } = await mediaSvc.uploadImage(img);
						if (data?.path) uploadedImagePaths.push(data.path);
					}
				}
			}

			// Create meta details
			const metaDetailsService = await this.createSubService(MetaDetailsService);
			metaId = await metaDetailsService.createMetaDetails(input.meta_details);
			if (!metaId) {
				throw new ApiError("Failed to create meta details", 500, []);
			}

			// Preparing tour data
			const tourData: TablesInsert<"tours"> = {
				tour_code: input.tour_code,
				name: input.name,
				overview: input.overview,
				highlights: input.highlights || null,
				city_id: Number(input.city_id),
				tour_category_id: Number(input.tour_category_id),
				cover_image: uploadedCoverPath,
				images: uploadedImagePaths,
				meta_details_id: metaId,
				isActive: input.isActive === "true",
				isFeatured: input.isFeatured === "true",
				added_by: this.currentUser.id as string,
				start_date: input.start_date || null,
				end_date: input.end_date || null,
				registration_open_date: input.registration_open_date || null,
				registration_close_date: input.registration_close_date || null,
				max_participants: input.max_participants || 0,
				price: input.price || 0,
				status: input.status || "DRAFT",
				departure_location: input.departure_location || null,
				return_location: input.return_location || null,
			};

			// Insert tour
			const { data: tourInsertData, error: tourError } = await this.supabase
				.from(this.TOURS_TABLE)
				.insert(tourData)
				.select("id")
				.single();

			if (tourError) {
				throw new ApiError(tourError.message, 500, [tourError.details || []]);
			}

			tourId = tourInsertData.id;

			// Insert itinerary if provided
			if (tourId && input.itinerary && input.itinerary.length > 0) {
				const itineraryData = input.itinerary.map((day) => ({
					tour_id: tourId as string,
					day_number: day.day_number,
					title: day.title,
					description: day.description || null,
					departure_time: day.departure_time || null,
					activities: day.activities || null,
					meals: day.meals || null,
					overnight_location: day.overnight_location || null,
					notes: day.notes || null,
				}));

				await this.supabase.from(this.TOUR_ITINERARIES_TABLE).insert(itineraryData);
			}

			// Insert tags if provided
			if (tourId != null && input.tags && input.tags.length > 0) {
				const tagsData = input.tags.map((tagId) => ({
					tour_id: tourId as string,
					tour_tag_id: Number(tagId),
				}));
				await this.supabase.from(this.TOURS_TAGS_LINK_TABLE).insert(tagsData);
			}

			return tourId ?? null;
		} catch (error) {
			console.error(error);
			throw error instanceof ApiError ? error : new ApiError("Failed to add tour", 500, []);
		}
	}

	/** Update tour details */
	@UseMiddleware(asServiceMiddleware<ToursService>(verifyUser))
	async updateTour(data: any, tour_id: string) {
		const {
			tour_update,
			added_tags,
			removed_tags,
			itinerary,
			cover_image,
			images = [],
			removed_images = [],
			meta_details,
		} = data;

		const { data: currentTour, error: fetchError } = await this.supabase
			.from(this.TOURS_TABLE)
			.select("id, meta_details_id, images, cover_image")
			.eq("id", tour_id)
			.single();

		if (fetchError || !currentTour) throw new ApiError("Failed to fetch tour", 500);

		const mediaSvc = await this.createSubService(MediaService);

		try {
			if (tour_update && Object.keys(tour_update).length > 0) {
				await this.supabase.from(this.TOURS_TABLE).update(tour_update).eq("id", tour_id);
			}

			if (added_tags?.length > 0) {
				const tagInserts = added_tags.map((tag_id: number) => ({ tour_id, tour_tag_id: tag_id }));
				await this.supabase.from(this.TOURS_TAGS_LINK_TABLE).insert(tagInserts);
			}

			if (removed_tags?.length > 0) {
				await this.supabase.from(this.TOURS_TAGS_LINK_TABLE).delete().eq("tour_id", tour_id).in("tour_tag_id", removed_tags);
			}

			if (itinerary) {
				await this.updateItinerary(tour_id, itinerary);
			}

			let finalCoverPath = currentTour.cover_image;
			if (cover_image instanceof File && cover_image.size > 0) {
				const { data } = await mediaSvc.uploadImage(cover_image);
				if (data?.path) {
					finalCoverPath = data.path;
					if (currentTour.cover_image) await mediaSvc.deleteImage(currentTour.cover_image);
				}
			}

			const newImages: string[] = [];
			for (const file of (images || [])) {
				if (file instanceof File && file.size > 0) {
					const { data } = await mediaSvc.uploadImage(file);
					if (data?.path) newImages.push(data.path);
				}
			}

			const currentImages = currentTour.images || [];
			const keptImages = currentImages.filter((img: string) => !removed_images.includes(img));
			const finalImages = [...keptImages, ...newImages];

			await this.supabase.from(this.TOURS_TABLE).update({ cover_image: finalCoverPath, images: finalImages }).eq("id", tour_id);

			if (meta_details) {
				const metaDetailsService = await this.createSubService(MetaDetailsService);
				await metaDetailsService.updateMetaDetails({ meta_details, metaDetailsId: currentTour.meta_details_id });
			}
		} catch (error: any) {
			console.error(error);
			throw new ApiError(error.message || "Tour update failed", 500);
		}
	}

	/** Update tour itinerary */
	@UseMiddleware(asServiceMiddleware<ToursService>(verifyUser))
	async updateItinerary(tourId: string, itinerary: any[]) {
		await this.supabase.from(this.TOUR_ITINERARIES_TABLE).delete().eq("tour_id", tourId);
		const itineraryData = itinerary.map((day) => ({
			tour_id: tourId,
			day_number: Number(day.day_number),
			title: day.title,
			description: day.description || null,
			departure_time: day.departure_time || null,
			activities: day.activities || null,
			meals: day.meals || null,
			overnight_location: day.overnight_location || null,
			notes: day.notes || null,
		}));
		await this.supabase.from(this.TOUR_ITINERARIES_TABLE).insert(itineraryData);
	}

	/** Get tour details for preview page */
	@UseMiddleware(asServiceMiddleware<ToursService>(verifyUser))
	async getTourDetails(tourId: string): Promise<GetTourDetails | null> {
		const { data: tour, error } = await this.supabase
			.from(this.TOURS_TABLE)
			.select(`*, ${this.META_DETAILS_TABLE} (*), city: ${this.CITIES_TABLE} (id, name, ${this.META_DETAILS_TABLE} (url_key)), tour_category: ${this.CATEGORIES_TABLE} (id, name, ${this.META_DETAILS_TABLE} (url_key)), provider: ${this.PROVIDERS_TABLE} (*), cancellation_policy_detail: ${this.CANCELLATION_POLICIES_TABLE} (*), tags: ${this.TOURS_TAGS_LINK_TABLE} (${this.TOUR_TAGS_TABLE} (*)), itinerary: ${this.TOUR_ITINERARIES_TABLE} (*)`)
			.eq("id", tourId)
			.single();

		if (error || !tour) throw new ApiError("Tour not found", 404);

		return {
			...tour,
			tags: tour.tags.map((tag) => tag.tour_tags),
			city: { id: tour.city.id, name: tour.city.name, url_key: tour.city.meta_details.url_key },
			tour_category: { id: tour.tour_category.id, name: tour.tour_category.name, url_key: tour.tour_category.meta_details.url_key },
			itinerary: tour.itinerary || [],
		};
	}

	/** Get tours for main tours page in the admin panel */
	@UseMiddleware(asServiceMiddleware<ToursService>(verifyUser))
	async getHighLevelTours(q = "", pageIndex = 0, pageSize = 10, filters: TourFilters = {}): Promise<GetHighLevelToursResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOURS_TABLE)
			.select(`id, tour_code, name, cover_image, updated_at, isFeatured, isActive, status, price, start_date, end_date, ${this.META_DETAILS_TABLE}(url_key), ${this.CITIES_TABLE}(id, name, ${this.META_DETAILS_TABLE}(url_key)), ${this.CATEGORIES_TABLE}(id, name, ${this.META_DETAILS_TABLE}(url_key))`, { count: "exact" })
			.range(from, to);

		if (q.trim().length > 0) query = query.ilike("name", `%${q}%`);
		if (filters.status) query = query.eq("status", filters.status);

		const { data, error, count } = await query.order("created_at", { ascending: false });
		if (error) throw new ApiError(error.message, 500);

		const tours: HighLevelTour[] = (data || []).map((tour) => ({
			id: tour.id,
			tour_code: tour.tour_code,
			name: tour.name,
			cover_image: tour.cover_image,
			updated_at: tour.updated_at ?? "",
			url_key: tour.meta_details.url_key,
			isFeatured: tour.isFeatured,
			isActive: tour.isActive,
			status: tour.status,
			price: tour.price,
			start_date: tour.start_date,
			end_date: tour.end_date,
			city: { id: tour.cities.id, name: tour.cities.name, url_key: tour.cities.meta_details.url_key },
			category: { id: tour.tours_categories.id, name: tour.tours_categories.name, url_key: tour.tours_categories.meta_details.url_key },
		}));

		return { tours, total: count ?? 0 };
	}

	/** Get tours for front panel */
	async getFPHighLevelTours(q = "", pageIndex = 0, pageSize = 10, filters: FPTourFilters = {}): Promise<GetFPHighLevelToursResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOURS_TABLE)
			.select(`id, tour_code, name, cover_image, updated_at, status, price, start_date, end_date, destination, ${this.META_DETAILS_TABLE}(url_key), ${this.CITIES_TABLE}(id, name, ${this.META_DETAILS_TABLE}(url_key)), ${this.CATEGORIES_TABLE}(id, name, ${this.META_DETAILS_TABLE}(url_key))`, { count: "exact" })
			.range(from, to)
			.eq("isActive", true);

		if (q.trim().length > 0) query = query.ilike("name", `%${q}%`);

		const { data, error, count } = await query.order("created_at", { ascending: false });
		if (error) throw new ApiError(error.message, 500);

		const tours: FP_HighLevelTour[] = (data || []).map((tour) => ({
			id: tour.id,
			name: tour.name,
			cover_image: tour.cover_image,
			url_key: tour.meta_details.url_key,
			updated_at: tour.updated_at,
			price: tour.price,
			destination: tour.destination,
			city: { id: tour.cities.id, name: tour.cities.name, url_key: tour.cities.meta_details.url_key },
			category: { id: tour.tours_categories.id, name: tour.tours_categories.name, url_key: tour.tours_categories.meta_details.url_key },
		}));

		return { tours, total: count ?? 0 };
	}

	async getFPTourDetails(tourId: string): Promise<GetTourDetails | null> {
		return await this.getTourDetails(tourId);
	}

	async getTourDetailsForUpdate(tourId: string): Promise<any | null> {
		return await this.getTourDetails(tourId);
	}
}
