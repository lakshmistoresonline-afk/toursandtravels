import { ToursService } from "@workspace/shared/services/tours.service";

export const tourDetailsQuery = async ({ tour_id }: { request: Request; tour_id: string }) => {
	const svc = new ToursService();
	return await svc.getTourDetails(tour_id);
};

export const toursQuery = async ({
	q,
}: {
	request: Request;
	q?: string;
	pageIndex?: number;
	pageSize?: number;
	filters?: any;
}) => {
	const svc = new ToursService();
	return await svc.getFPHighLevelTours(q);
};

export const availabilityQuery = async () => {
	return [];
};
