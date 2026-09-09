import { BookingService } from "@workspace/shared/services/booking.service";

export const allRegistrationsQuery = async ({
	request,
	pageSize = 10,
	pageIndex = 0,
	q = "",
}: {
	request: Request;
	pageSize?: number;
	pageIndex?: number;
	q?: string;
}) => {
	const svc = new BookingService(request);
	return await svc.getAllRegistrations(q, pageIndex, pageSize);
};
