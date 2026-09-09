import { Service } from "@workspace/shared/services/service.base";
import { UseClassMiddleware } from "@workspace/shared/decorators/useClassMiddleware";
import { loggerMiddleware } from "@workspace/shared/middlewares/logger.middleware";
import { ApiError } from "@workspace/shared/utils/ApiError";
import { Database } from "@workspace/shared/types/supabase";
import type {
	GetTourRegistrationsResponse,
} from "@workspace/shared/types/booking";
import { UseMiddleware } from "@workspace/shared/decorators/useMiddleware";
import { verifyUser } from "@workspace/shared/middlewares/auth.middleware";
import { AuthService } from "@workspace/shared/services/auth.service";

@UseClassMiddleware(loggerMiddleware)
export class BookingService extends Service {
	/**
	 * Create simple tour registration
	 * REFACTORED: Replaces complex cart/checkout with direct registration
	 */
	@UseMiddleware(verifyUser)
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUser) throw new ApiError("Unauthorized", 401);

		// 1. Load customer profile
		const authSvc = await this.createSubService(AuthService);
		const { user: profile } = await authSvc.getFullCurrentUser();
		if (!profile) throw new ApiError("Profile not found", 404);

		// 2. Create profile snapshot (JSON) for historical integrity
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

		// 4. Create registration record
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

	/**
	 * Get registrations for current user
	 */
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

	/**
	 * Get all registrations (Admin View)
	 */
	@UseMiddleware(verifyUser)
	async getAllRegistrations(_q = "", pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
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

		// Search logic can be added here if needed (e.g. by tour name or customer name)

		const { data, error, count } = await query;

		if (error) throw new ApiError(error.message, 500);

		return {
			registrations: data || [],
			total: count || 0
		};
	}

	/**
	 * Update registration status (Admin)
	 */
	@UseMiddleware(verifyUser)
	async updateRegistrationStatus(id: string, status: Database["public"]["Enums"]["registration_status"]): Promise<void> {
		const { error } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.update({ status })
			.eq("id", id);

		if (error) throw new ApiError(error.message, 500);
	}
}
