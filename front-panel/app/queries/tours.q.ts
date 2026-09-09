import { ToursService } from "@workspace/shared/services/tours.service";
import type { FPTourFilters } from "@workspace/shared/schemas/fp-tours-filter.schema";

export const tourDetailsQuery = async ({ request, tour_id }: { request: Request; tour_id: string }) => {
	const svc = new ToursService(request);
	return await svc.getFPTourDetails(tour_id);
};

export const toursQuery = async ({
	request,
	q,
	pageIndex,
	pageSize,
	filters,
}: {
	request: Request;
	q?: string;
	pageIndex?: number;
	pageSize?: number;
	filters?: FPTourFilters;
}) => {
	const svc = new ToursService(request);
	return await svc.getFPHighLevelTours(q, pageIndex, pageSize, filters);
};

export const availabilityQuery = async (
	_request: Request,
	_optionId: number | null,
	_dateStr: string | null,
	_tourId: string | null,
) => {
	// REFACTORED: Legacy availability query disabled in Simple mode
	return [];
};
