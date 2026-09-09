import { BookingService } from "@workspace/shared/services/booking.service";

/**
 * REFACTORED: Legacy bookings query now redirects to registrations
 */
export const highLevelBookingsQuery = async ({
	request,
	q,
	pageIndex,
	pageSize,
}: {
	request: Request;
	q?: string;
	pageIndex?: number;
	pageSize?: number;
}) => {
	const svc = new BookingService(request);
	const resp = await svc.getAllRegistrations(q, pageIndex, pageSize);
	// Transform to match HighLevelBooking interface if needed, or update components
	return {
		bookings: resp.registrations,
		total: resp.total
	} as any;
};

export const getBookingDetailById = async ({ request, id }: { request: Request; id: string }) => {
	console.warn("getBookingDetailById called - this is legacy. ID:", id);
	return { booking: null, error: null };
};

export const getBookingForConfirmation = async ({ request, id }: { request: Request; id: string }) => {
	console.warn("getBookingForConfirmation called - this is legacy. ID:", id);
	return { booking: null, error: null };
};
