import { BookingService } from "@workspace/shared/services/booking.service";
import type { GetTourRegistrationsResponse } from "@workspace/shared/types/booking";

export const myRegistrationsQuery = async ({
	pageIndex = 0,
	pageSize = 10,
	request
}: {
	pageIndex?: number;
	pageSize?: number;
	request: Request;
}): Promise<GetTourRegistrationsResponse> => {
	const bookingSvc = new BookingService(request);
	return await bookingSvc.getMyRegistrations(pageIndex, pageSize);
};
