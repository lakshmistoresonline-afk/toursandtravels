export type TourRegistration = {
	id: string;
	tourId: string;
	customerId: string;
	travellersCount: number;
	status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
	notes: string | null;
	profileSnapshot: {
		first_name: string | null;
		last_name: string | null;
		email: string;
		phone_number: string | null;
	};
	createdAt: string | Date;
	updatedAt: string | Date;
	tours?: any;
};

export type GetTourRegistrationsResponse = {
	registrations: TourRegistration[];
	total: number;
};
