export type TourRegistration = {
	id: string;
	tourId: string;
	customerId: string;
	travellersCount: number;
	status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
	notes: string | null;
	profileSnapshot: any;
	createdAt: any;
	updatedAt: any;
	tours?: any; // Joined tour details
};

export type GetTourRegistrationsResponse = {
	registrations: TourRegistration[];
	total: number;
};
