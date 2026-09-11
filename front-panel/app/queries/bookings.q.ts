import { BookingService } from "@workspace/shared/services/booking.service";

/**
 * REFACTORED: Legacy bookings query now redirects to registrations
 */
export const getMyBookingsQuery = async ({
	pageIndex = 0,
	pageSize = 10,
}: {
	pageIndex?: number;
	pageSize?: number;
	request: Request;
}) => {
	const svc = new BookingService();
	return await svc.getMyRegistrations(pageIndex, pageSize);
};

export const bookingByRefQuery = async ({
	ref,
}: {
	ref: string;
	request: Request;
}) => {
	console.warn("bookingByRefQuery called - this is a legacy method. Ref:", ref);
	// In Simple mode, we might just return null or try to find a registration by ID
	return null;
};
