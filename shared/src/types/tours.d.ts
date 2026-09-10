export type HighLevelTour = {
	id: string;
	tour_code: string;
	name: string;
	cover_image: string | null;
	status: string;
	price: number;
	destination: string;
	start_date: string | null;
	start_time: string | null;
	end_date: string | null;
	end_time: string | null;
	createdAt: any;
	updatedAt: any;
};

export type GetTourDetails = HighLevelTour & {
	overview: string;
	itinerary: Array<{
		id: string;
		day_number: number;
		title: string;
		description: string;
	}>;
	images: string[];
};

export type GetHighLevelToursResponse = {
	tours: HighLevelTour[];
	total: number;
};
