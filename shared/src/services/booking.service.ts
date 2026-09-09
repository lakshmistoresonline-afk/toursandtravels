import { Service } from "@workspace/shared/services/service.base";
import { UseClassMiddleware } from "@workspace/shared/decorators/useClassMiddleware";
import { loggerMiddleware } from "@workspace/shared/middlewares/logger.middleware";
import { ApiError } from "@workspace/shared/utils/ApiError";
import {
	CreateBookingFromCartInput,
	UpdateBookingActionData,
} from "@workspace/shared/schemas/booking.schema";
import { Database } from "@workspace/shared/types/supabase";
import type {
	BookingDetailById,
	FPBookingByRefDetail,
	FrontPanelBooking,
	FrontPanelBookings,
	GetBookingDetailByID,
	GetBookingDetailsForConfirm,
	GetHighLevelBookings,
	HighLevelBooking,
} from "@workspace/shared/types/booking";
import { UseMiddleware } from "@workspace/shared/decorators/useMiddleware";
import { verifyUser } from "@workspace/shared/middlewares/auth.middleware";
import { CouponsService } from "@workspace/shared/services/coupons.service";

@UseClassMiddleware(loggerMiddleware)
export class BookingService extends Service {
	private BOOKING_REF_LENGTH = 10;

	private async generateUniqueBookingRef(): Promise<string> {
		const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

		while (true) {
			let ref = "";

			for (let i = 0; i < this.BOOKING_REF_LENGTH; i++) {
				ref += chars[Math.floor(Math.random() * chars.length)];
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			let current_yr = new Date().getFullYear();
			current_yr = current_yr % 100;
			ref = `${current_yr}${ref}`;

			const { count } = await this.supabase
				.from(this.BOOKINGS_TABLE)
				.select("id", { count: "exact", head: true })
				.eq("booking_ref", ref);

			if ((count ?? 0) === 0) {
				return ref;
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/** Get booking by ref */
	async getBookingByRef(bookingRef: string): Promise<FPBookingByRefDetail> {
		try {
			if (!bookingRef || bookingRef === "") {
				throw new ApiError("Missing booking reference", 400, []);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			const { data, error } = await this.supabase
				.from(this.BOOKINGS_TABLE)
				.select(
					`
						*,
						${this.BOOKING_ITEMS_TABLE} (
							*,
							tour_option:${this.TOUR_OPTIONS_TABLE}!inner (
								name,
								tour:${this.TOURS_TABLE}(name)
							),
							${this.BOOKING_PARTICIPANTS_TABLE} (
								*,
								${this.PARTICIPANT_TYPES_TABLE} (
									name,
									age_min,
									age_max
								)
							)
						),
						payment:${this.PAYMENTS_TABLE}!inner (
							payment_status
						)
					`,
				)
				.eq("booking_ref", bookingRef)
				.limit(1)
				.maybeSingle();

			if (error) {
				throw new ApiError(error.message, 500, []);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			if (!data) {
				return null;
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// Transform into clean structure
			const booking: FPBookingByRefDetail = {
				id: data.id,
				booking_ref: data.booking_ref,
				booking_status: data.booking_status,
				customer_name: data.customer_name,
				customer_email: data.customer_email,
				customer_phone: data.customer_phone,
				created_at: data.created_at,
				updated_at: data.updated_at,
				cancelled_at: data.cancelled_at,
				subtotal_amount: data.subtotal_amount,
				discount: data.discount,
				taxes: data.taxes,
				total: data.total,
				payment_status: data.payment.payment_status,
				payment_id: data.payment_id,
				booking_items: (data.booking_items || []).map((item) => ({
					id: item.id,
					tour_option_id: item.tour_option_id,
					preffered_date: item.preffered_date,
					preffered_timeslot: item.preffered_timeslot,
					confirmed_date: item.confirmed_date,
					confirmed_timeslot: item.confirmed_timeslot,
					tour_option_name: item.tour_option.name || null,
					tour_name: item.tour_option.tour.name || null,
					participants: (item.booking_participants_new || []).map((p) => ({
						participant_type_id: p.participant_type_id,
						quantity: p.quantity,
						unit_price: p.unit_price,
						participant_name: p.participant_types?.name || "Participant",
						age_min: p.participant_types?.age_min,
						age_max: p.participant_types?.age_max,
					})),
				})),
			};

			if (booking) {
				(booking as any).admin_note = null;
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			return booking;
		} catch (error) {
			throw error instanceof ApiError ? error : new ApiError("Failed to get booking data", 500, []);
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/** Get high level bookings for admin page */
	@UseMiddleware(verifyUser)
	async getHighLevelBookings(q = "", pageIndex = 0, pageSize = 10): Promise<GetHighLevelBookings> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		try {
			let query = this.supabase
				.from(this.BOOKINGS_TABLE)
				.select(
					`
					id,
					booking_ref,
					booking_status,
					payment:${this.PAYMENTS_TABLE}!inner (
						payment_status
					),
					created_at,
					customer_name,
					customer_phone,
					customer_email,
					total,
					${this.BOOKING_ITEMS_TABLE} (
						preffered_date,
						preffered_timeslot,
						confirmed_date,
						confirmed_timeslot,
						${this.TOUR_OPTIONS_TABLE}!inner (
							name,
							${this.TOURS_TABLE}!inner (
								name
							)
						)
					)
					`,
					{ count: "exact" },
				)
				.range(from, to)
				.order("created_at", { ascending: false });

			if (q.length > 0) {
				query = query.like("booking_ref", `%${q}%`);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			const { data, error, count } = await query;

			if (error) {
				console.error("High-level bookings error:", error);
				return { bookings: [], total: 0 };
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			const bookings: HighLevelBooking[] = (data ?? []).map((b) => {
				return {
					id: b.id,
					booking_ref: b.booking_ref,
					booking_status: b.booking_status,
					payment_status: b.payment?.payment_status || "PENDING",
					created_at: b.created_at,
					customer_name: b.customer_name,
					customer_phone: b.customer_phone,
					customer_email: b.customer_email,
					total: b.total,
					tours: b.booking_items.map((item) => ({
						tour_name: item.tour_options?.tours?.name || "Untitled Tour",
						tour_option_name: item.tour_options?.name || null,
						preffered_date: item.preffered_date || null,
						preffered_timeslot: item.preffered_timeslot || null,
						confirmed_date: item.confirmed_date || null,
						confirmed_timeslot: item.confirmed_timeslot || null,
					})),
				};
			});

			return {
				bookings,
				total: Number(count ?? 0),
			};
		} catch (err: any) {
			console.error("getHighLevelBookings error:", err);
			return {
				bookings: [],
				total: 0,
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/** Get booking detail for admin page */
	@UseMiddleware(verifyUser)
	async getBookingById(booking_id: string): Promise<GetBookingDetailByID> {
		if (!booking_id || booking_id === "") {
			throw new ApiError("Missing booking id", 400, []);
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		const { data, error } = await this.supabase
			.from(this.BOOKINGS_TABLE)
			.select(
				`
				*,
				${this.BOOKING_ITEMS_TABLE} (
					*,
					${this.BOOKING_PARTICIPANTS_TABLE} (
						*,
						${this.PARTICIPANT_TYPES_TABLE} (*)
					),
					${this.TOUR_OPTIONS_TABLE}!inner (
						name,
						${this.TOURS_TABLE}!inner (
							name
						)
					)
				),
				payment:${this.PAYMENTS_TABLE}!inner (payment_status)
			`,
			)
			.eq("id", booking_id)
			.limit(1)
			.maybeSingle();

		if (error) {
			return {
				booking: null,
				error: new ApiError(error.message, 500, [error]),
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		if (!data) {
			return {
				booking: null,
				error: new ApiError("Booking not found", 404, []),
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		// Clean transformation (same style as your old function)
		const payload: BookingDetailById = {
			...data,
			payment: {
				payment_status: data.payment.payment_status,
			},
			booking_items: (data.booking_items || []).map((item) => ({
				...item,
				booking_participants_new: (item.booking_participants_new || []).map((p) => ({
					...p,
					participant_type: p.participant_types,
				})),
				tour_option_name: item.tour_options.name || "N/A",
				tour_name: item.tour_options.tours.name || "N/A",
			})),
		};

		return {
			booking: payload,
			error: null,
		};
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/** update booking detail for admin page */
	@UseMiddleware(verifyUser)
	async updateBooking(id: string, input: UpdateBookingActionData): Promise<void> {
		try {
			// 1. Fetch current booking + items + payment
			const { data: booking, error: fetchError } = await this.supabase
				.from(this.BOOKINGS_TABLE)
				.select(
					`
					id,
					booking_ref,
					booking_status,
					subtotal_amount,
					discount,
					taxes,
					total,
					admin_note,
					cancelled_at,
					payment_id,
					${this.BOOKING_ITEMS_TABLE} (
						id,
						preffered_date,
						preffered_timeslot,
						confirmed_date,
						confirmed_timeslot
					),
					${this.PAYMENTS_TABLE} (*)
				`,
				)
				.eq("id", id)
				.single();

			if (fetchError || !booking) {
				throw new ApiError("Booking not found", 404, []);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			const bookingPayload: Partial<Database["public"]["Tables"]["bookings_new"]["Update"]> = {};
			const paymentPayload: Partial<Database["public"]["Tables"]["payments"]["Update"]> = {};

			// 2. Booking-level fields
			if (input.booking_status !== undefined) bookingPayload.booking_status = input.booking_status;
			if (input.customer_name !== undefined) bookingPayload.customer_name = input.customer_name;
			if (input.customer_email !== undefined) bookingPayload.customer_email = input.customer_email;
			if (input.customer_phone !== undefined) bookingPayload.customer_phone = input.customer_phone;
			if (input.admin_note !== undefined) bookingPayload.admin_note = input.admin_note;
			if (input.discount !== undefined) bookingPayload.discount = input.discount;
			if (input.taxes !== undefined) bookingPayload.taxes = input.taxes;

			// 3. Status logic
			if (input.booking_status === "CANCELLED") {
				bookingPayload.cancelled_at = new Date().toISOString();
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// 4. Payment status → update payments table
			if (input.payment_status !== undefined && booking.payment_id) {
				paymentPayload.payment_status = input.payment_status;
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// 5. NEW: Per-item dates & timeslots (multi-tour support)
			if (input.item_dates && input.item_dates.length > 0) {
				for (const itemUpdate of input.item_dates) {
					const updateData: any = {};

					if (itemUpdate.preffered_date !== undefined) {
						updateData.preffered_date = itemUpdate.preffered_date;
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
					if (itemUpdate.preffered_time !== undefined) {
						updateData.preffered_timeslot = itemUpdate.preffered_time;
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
					if (itemUpdate.confirmed_date !== undefined) {
						updateData.confirmed_date = itemUpdate.confirmed_date;
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
					if (itemUpdate.confirmed_time !== undefined) {
						updateData.confirmed_timeslot = itemUpdate.confirmed_time;
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

					// Only update if there are changes
					if (Object.keys(updateData).length > 0) {
						const { error: itemErr } = await this.supabase
							.from(this.BOOKING_ITEMS_TABLE)
							.update(updateData)
							.eq("id", itemUpdate.booking_item_id)
							.eq("booking_id", id);

						if (itemErr) {
							console.error(itemErr);

							throw new ApiError(
								`Failed to update item dates for ${itemUpdate.booking_item_id}`,
								500,
								[],
							);
							/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
					/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// 6. Participants pricing updates
			if (input.participants_unit_prices && input.participants_unit_prices.length > 0) {
				for (const p of input.participants_unit_prices) {
					const { error: partErr } = await this.supabase
						.from(this.BOOKING_PARTICIPANTS_TABLE)
						.update({
							quantity: p.quantity,
							unit_price: p.unit_price,
						})
						.eq("id", p.booking_participant_id);

					if (partErr) {
						throw new ApiError("Failed to update participant", 500, []);
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
					/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

				// Recalculate subtotal from all participants
				const { data: allParts } = await this.supabase
					.from(this.BOOKING_PARTICIPANTS_TABLE)
					.select("quantity, unit_price")
					.in(
						"booking_item_id",
						booking.booking_items.map((i: any) => i.id),
					);

				const newSubtotal = (allParts || []).reduce(
					(sum: number, p: any) => sum + p.quantity * p.unit_price,
					0,
				);

				bookingPayload.subtotal_amount = newSubtotal;
				bookingPayload.total =
					newSubtotal - (input.discount ?? booking.discount) + (input.taxes ?? booking.taxes);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// 7. Update bookings_new if anything changed
			if (Object.keys(bookingPayload).length > 0) {
				const { error: updateErr } = await this.supabase
					.from(this.BOOKINGS_TABLE)
					.update(bookingPayload)
					.eq("id", id);

				if (updateErr) throw new ApiError("Failed to update booking", 500, []);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// 8. Update payments table if payment status changed
			if (Object.keys(paymentPayload).length > 0 && booking.payment_id) {
				await this.supabase.from("payments").update(paymentPayload).eq("id", booking.payment_id);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		} catch (error) {
			throw error instanceof ApiError ? error : new ApiError("Failed to update booking", 500, []);
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/** Update booking checkout session id */
	async updateBookingCheckoutSessionId(
		bookingRef: string,
		checkout_session_id: string,
	): Promise<{ error: ApiError | null }> {
		const { error, data } = await this.supabase
			.from(this.BOOKINGS_TABLE)
			.select("payment_id")
			.eq("booking_ref", bookingRef)
			.single();

		if (error || !data) {
			return {
				error: error ? new ApiError("Failed to update checkout session id", 500, [error]) : null,
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		const { error: updateError } = await this.supabase
			.from(this.PAYMENTS_TABLE)
			.update({
				checkout_session_id: checkout_session_id.trim(),
			})
			.eq("id", data.payment_id!);

		return {
			error: updateError
				? new ApiError("Failed to update checkout session id", 500, [updateError])
				: null,
		};
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/**
	 * Get booking details for confirmation email / front-end confirmation page
	 * Fully multi-tour aware — no root-level confirmed_date/timeslot anymore
	 */
	async getBookingForConfirmation(booking_id: string): Promise<GetBookingDetailsForConfirm> {
		if (!booking_id || booking_id === "") {
			throw new ApiError("Missing booking id", 400, []);
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		const { data, error } = await this.supabase
			.from(this.BOOKINGS_TABLE)
			.select(
				`
				booking_ref,
				customer_name,
				customer_email,
				customer_phone,
				total,
				subtotal_amount,
				discount,
				taxes,
				${this.BOOKING_ITEMS_TABLE} (
					preffered_date,
					preffered_timeslot,
					confirmed_date,
					confirmed_timeslot,
					${this.TOUR_OPTIONS_TABLE}!inner (
						name,
						${this.TOURS_TABLE}!inner (
							name
						)
					),
					${this.BOOKING_PARTICIPANTS_TABLE} (
						quantity,
						unit_price
					)
				)
			`,
			)
			.eq("id", booking_id)
			.single();

		if (error) {
			return {
				booking: null,
				error: new ApiError(error.message, 500, []),
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		if (!data) {
			return {
				booking: null,
				error: new ApiError("Booking not found", 404, []),
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

		// Build tours array with per-tour calculations
		const tours = (data.booking_items || []).map((item) => {
			const participants = item.booking_participants_new || [];

			const participantCount = participants.reduce((sum: number, p) => sum + (p.quantity || 0), 0);

			return {
				tour_name: item.tour_options?.tours?.name || "Untitled Tour",
				tour_option_name: item.tour_options?.name || null,
				preffered_date: item.preffered_date || null,
				preffered_timeslot: item.preffered_timeslot || null,
				confirmed_date: item.confirmed_date || null,
				confirmed_timeslot: item.confirmed_timeslot || null,
				participant_count: participantCount,
			};
		});

		const payload = {
			booking_ref: data.booking_ref ?? "N/A",
			customer_name: data.customer_name ?? null,
			customer_email: data.customer_email ?? null,
			customer_phone: data.customer_phone ?? null,
			total_amount: data.total?.toFixed(2) ?? "0.00",
			tours,
			subtotal: data.subtotal_amount ?? 0,
			discount: data.discount ?? 0,
			taxes: data.taxes ?? 0,
			total: data.total ?? 0,
		};

		return {
			booking: payload,
			error: null,
		};
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/**
	 * Get minimal booking list for the current authenticated user
	 */
	async getMyBookings(userId: string, pageIndex = 0, pageSize = 10): Promise<FrontPanelBookings> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		try {
			if (!userId) {
				throw new ApiError("User ID required", 401, []);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			const { data, error, count } = await this.supabase
				.from(this.BOOKINGS_TABLE)
				.select(
					`
						id,
						booking_ref,
						booking_status,
						payment:${this.PAYMENTS_TABLE}!inner (
							payment_status
						),
						total,
						created_at,
						customer_name,
						${this.BOOKING_ITEMS_TABLE} (
							preffered_date,
							preffered_timeslot,
							confirmed_date,
							confirmed_timeslot,
							${this.TOUR_OPTIONS_TABLE}!inner (
								name,
								${this.TOURS_TABLE}!inner (
									name
								)
							)
						)
					`,
					{ count: "exact" },
				)
				.eq("added_by", userId)
				.order("created_at", { ascending: false })
				.range(from, to);

			if (error) {
				throw new ApiError("Failed to fetch your bookings", 500, [error.message]);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			const bookings: FrontPanelBooking[] = (data ?? []).map((b) => ({
				id: b.id,
				booking_ref: b.booking_ref,
				booking_status: b.booking_status,
				payment_status: b.payment.payment_status,
				total: b.total,
				created_at: b.created_at,
				customer_name: b.customer_name ?? undefined,
				items: (b.booking_items || []).map((item) => ({
					tour_name: item.tour_options?.tours?.name || "Untitled Tour",
					tour_option_name: item.tour_options?.name || null,
					preffered_date: item.preffered_date || null,
					preffered_timeslot: item.preffered_timeslot || null,
					confirmed_date: item.confirmed_date || null,
					confirmed_timeslot: item.confirmed_timeslot || null,
				})),
			}));

			return {
				bookings,
				total: Number(count ?? 0),
				error: null,
			};
		} catch (err) {
			const apiErr =
				err instanceof ApiError ? err : new ApiError("Unexpected error fetching bookings", 500);
			return {
				bookings: [],
				total: 0,
				error: apiErr,
			};
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

	/**
	 * Create booking from entire cart (multi-item support)
	 */
	async createBookingFromCart(input: CreateBookingFromCartInput): Promise<string> {
		let bookingRef: string | null = null;
		let bookingId: string | null = null;

		try {
			// 1. Fetch cart with all details
			const { data: cartData, error: cartError } = await this.supabase
				.from(this.CARTS_TABLE)
				.select(
					`
					id,
					${this.CART_ITEMS_TABLE} (
						id,
						tour_option_id,
						preferred_date,
						preferred_timeslot,
						${this.CART_ITEMS_QUANTITIES_TABLE} (
							participant_type_id,
							quantity
						)
					)
				`,
				)
				.eq("id", input.cart_id!)
				.single();

			if (cartError || !cartData?.cart_items?.length) {
				throw new ApiError("Cart is empty or not found", 404);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// 2. Fetch all active AUTOMATIC coupons (same as frontend)
			const couponsSvc = await this.createSubService(CouponsService);
			const couponsData = await couponsSvc.getCouponsForFrontPanel(input.added_by);

			const coupons = couponsData.coupons || [];

			bookingRef = await this.generateUniqueBookingRef();

			const { data: booking, error: bookingError } = await this.supabase
				.from(this.BOOKINGS_TABLE)
				.insert({
					booking_ref: bookingRef,
					booking_status: "PENDING",
					customer_name: input.customer_name,
					customer_email: input.customer_email,
					customer_phone: input.customer_phone,
					added_by: input.added_by,
					subtotal_amount: 0,
					discount: input.discount || 0,
					taxes: 0,
					total: 0,
				})
				.select("id")
				.single();

			if (bookingError || !booking) {
				throw new ApiError("Failed to create booking record", 500);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			bookingId = booking.id;
			let subtotal = 0;

			for (const cartItem of cartData.cart_items) {
				const { tour_option_id, preferred_date, preferred_timeslot, cart_items_quantities } =
					cartItem;

				// --- Find applicable coupon for this tour_option ---
				const applicableCoupon = coupons.find((coupon) => {
					if (coupon.tours.length === 0) return true;
					return coupon.tours.some((t) => t.tour_options.some((opt) => opt.id === tour_option_id));
				});

				// --- Get real original prices ---
				const { data: prices } = await this.supabase
					.from(this.TOUR_OPTION_PRICES_TABLE)
					.select("participant_type_id, price")
					.eq("tour_option_id", tour_option_id);

				const priceMap = new Map(prices?.map((p) => [p.participant_type_id, p.price]) || []);

				// --- Insert booking item ---
				const { data: bookingItem, error: itemError } = await this.supabase
					.from(this.BOOKING_ITEMS_TABLE)
					.insert({
						booking_id: bookingId,
						tour_option_id,
						preffered_date: preferred_date,
						preffered_timeslot: preferred_timeslot,
						price_overriden: false,
						pricing_note: applicableCoupon ? "Discount applied" : null,
					})
					.select("id")
					.single();

				if (itemError || !bookingItem) {
					throw new ApiError("Failed to create booking item", 500);
					/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

				// --- Insert participants with discounted price ---
				const participantsData = cart_items_quantities.map((q) => {
					const originalPrice = priceMap.get(q.participant_type_id) || 0;
					let finalUnitPrice = originalPrice;

					if (applicableCoupon) {
						if (applicableCoupon.discount_type === "PERCENTAGE") {
							finalUnitPrice = originalPrice * (1 - applicableCoupon.discount_value / 100);
						} else {
							finalUnitPrice = Math.max(0, originalPrice - applicableCoupon.discount_value);
							/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
						/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

					return {
						booking_item_id: bookingItem.id,
						participant_type_id: q.participant_type_id,
						quantity: q.quantity,
						unit_price: finalUnitPrice,
					};
				});

				subtotal += participantsData.reduce((sum, p) => {
					const originalPrice = priceMap.get(p.participant_type_id) || 0;
					return sum + originalPrice * p.quantity;
				}, 0);

				const { error: participantsError } = await this.supabase
					.from(this.BOOKING_PARTICIPANTS_TABLE)
					.insert(participantsData);

				if (participantsError) {
					throw new ApiError("Failed to insert participants", 500);
					/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			// Final update with accurate numbers
			await this.supabase
				.from(this.BOOKINGS_TABLE)
				.update({
					subtotal_amount: subtotal,
					discount: input.discount || 0,
					total: subtotal - (input.discount || 0),
				})
				.eq("id", bookingId);

			const { data: paymentInsert } = await this.supabase
				.from(this.PAYMENTS_TABLE)
				.insert({
					checkout_session_id: null,
					payment_intent_id: null,
					paid_at: null,
					currency: "aed",
					paid_amount: 0.0,
					payment_status: "PENDING",
				})
				.select("id")
				.single();

			if (paymentInsert) {
				await this.supabase
					.from(this.BOOKINGS_TABLE)
					.update({
						payment_id: paymentInsert.id,
					})
					.eq("id", bookingId);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			return bookingRef;
		} catch (error: any) {
			if (bookingId) {
				console.warn(`[ROLLBACK] Deleting incomplete booking ${bookingId}`);
				const { data: booking_item_ids } = await this.supabase
					.from(this.BOOKING_ITEMS_TABLE)
					.delete()
					.eq("booking_id", bookingId)
					.select("id");
				if (booking_item_ids) {
					await this.supabase
						.from(this.BOOKING_PARTICIPANTS_TABLE)
						.delete()
						.in(
							"booking_item_id",
							booking_item_ids.map((b) => b.id),
						);
					/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
				await this.supabase.from(this.BOOKINGS_TABLE).delete().eq("id", bookingId);
				/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}

			throw error instanceof ApiError
				? error
				: new ApiError(error.message || "Failed to create booking from cart", 500);
			/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
		/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
	/** Create simple tour registration */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON)
		const profileSnapshot = { ...profile };

		// 3. Check for duplicate registration
		const { count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("customer_id", this.currentUser.id)
			.eq("tour_id", tourId);

		if (count && count > 0) {
			throw new ApiError("You have already registered for this tour", 400);
		}

		// 4. Create registration
		const { data, error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.insert({
				customer_id: this.currentUser.id,
				tour_id: tourId,
				travellers_count: travellersCount,
				notes: notes || null,
				profile_snapshot: profileSnapshot,
				status: 'PENDING'
			})
			.select("id")
			.single();

		if (error) {
			throw new ApiError(error.message, 500);
		}

		return data.id;
	}

	/** Get registrations for current user */
	@UseMiddleware(verifyUser)
	async getMyRegistrations(pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		const { data, error, count } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.eq("customer_id", this.currentUser.id)
			.range(from, to)
			.order("created_at", { ascending: false });

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Get all registrations (Admin) */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		const from = pageIndex * pageSize;
		const to = from + pageSize - 1;

		let query = this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select(`
				*,
				tours: ${this.TOURS_TABLE} (*),
				app_users: ${this.USERS_TABLE} (*)
			`, { count: "exact" })
			.range(from, to)
			.order("created_at", { ascending: false });

		// if (q) {
		// 	// search by customer name in snapshot or linked user
		// }

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/** Update registration status (Admin) */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
