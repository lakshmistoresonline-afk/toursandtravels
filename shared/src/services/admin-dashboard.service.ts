import { Service } from "@workspace/shared/services/service.base";
import { UseClassMiddleware } from "@workspace/shared/decorators/useClassMiddleware";
import { loggerMiddleware } from "@workspace/shared/middlewares/logger.middleware";
import { ApiError } from "@workspace/shared/utils/ApiError";
import type { BookingForExport, MainBarChartData } from "@workspace/shared/types/admin-dashboard";
import { format, startOfDay, subDays } from "date-fns";
import type { DashboardMainStats } from "@workspace/shared/types/stats";

@UseClassMiddleware(loggerMiddleware)
export class AdminDashboardService extends Service {
	/** Get stats for admin panel home */
	async getDashboardMainStats(): Promise<DashboardMainStats> {
		let payload: DashboardMainStats = {
			total_tours: 0,
			total_bookings: 0,
			total_categories: 0,
			total_revenue: 0,
		};

		// Total tours
		const { count: total_tours } = await this.supabase
			.from(this.TOURS_TABLE)
			.select("*", { count: "exact", head: true });
		payload.total_tours = total_tours ?? 0;

		// Total registrations (formerly bookings)
		const { count: total_bookings } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("*", { count: "exact", head: true });
		payload.total_bookings = total_bookings ?? 0;

		// Total Customers
		const { count: total_customers } = await this.supabase
			.from(this.USERS_TABLE)
			.select("*", { count: "exact", head: true });
		payload.total_categories = total_customers ?? 0; // REUSING total_categories field for total_customers to avoid changing types too much

		// Estimated Revenue
		const { data: regs } = await this.supabase
			.from(this.TOUR_REGISTRATIONS_TABLE)
			.select("travellers_count, tours(price)");

		const totalRevenue = (regs || []).reduce((sum, reg: any) => {
			return sum + ((reg.tours?.price || 0) * (reg.travellers_count || 1));
		}, 0);

		payload.total_revenue = totalRevenue;

		return payload;
	}

	/** Get registrations data for main dashboard chart */
	async getBookingsDataForChart(): Promise<MainBarChartData> {
		try {
			const now = new Date();
			const thirtyDaysAgo = subDays(startOfDay(now), 30);

			const { data, error } = await this.supabase
				.from(this.TOUR_REGISTRATIONS_TABLE)
				.select("created_at")
				.gte("created_at", thirtyDaysAgo.toISOString())
				.lte("created_at", now.toISOString());

			if (error || !data || data.length === 0) {
				console.error("Error fetching bookings data:", error);
				return {
					data: [],
					error: new ApiError("Failed to fetch bookings data", Number(error?.code) ?? 500, [error]),
				};
			}

			// Group by date (truncate to day)
			const grouped = new Map<string, { bookings: number }>();

			data.forEach((order: any) => {
				const dateKey = format(new Date(order.created_at || ""), "yyyy-MM-dd");
				const existing = grouped.get(dateKey) || { bookings: 0 };
				existing.bookings += 1;
				grouped.set(dateKey, existing);
			});

			// Generate full date range and fill missing days with 0
			const result: { date: string; bookings: number }[] = [];
			let currentDate = thirtyDaysAgo;

			while (currentDate <= now) {
				const dateStr = format(currentDate, "yyyy-MM-dd");
				const dayData = grouped.get(dateStr) || { bookings: 0 };

				result.push({
					date: dateStr,
					bookings: dayData.bookings,
				});

				currentDate = new Date(currentDate);
				currentDate.setDate(currentDate.getDate() + 1);
			}

			return {
				data: result,
				error: null,
			};
		} catch (err: any) {
			if (err instanceof ApiError) {
				return { data: [], error: err };
			}

			return {
				data: [],
				error: new ApiError("Unknown error", 500, [err]),
			};
		}
	}

	/** Fetch bookings for exports */
	async fetchBookingsForExport(startDate: string, endDate: string): Promise<BookingForExport[]> {
		const { data, error } = await this.supabase
			.from(this.BOOKINGS_TABLE)
			.select(
				`*, ${this.BOOKING_ITEMS_TABLE} (*, ${this.TOUR_OPTIONS_TABLE} (name)), payment:${this.PAYMENTS_TABLE}!inner (payment_status, paid_at, paid_amount)`,
			)
			.gte("created_at", `${startDate}T00:00:00`)
			.lte("created_at", `${endDate}T23:59:59`)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Export fetch error:", error);
			throw new Error(error.message);
		}

		return (data as any) || [];
	}
}
