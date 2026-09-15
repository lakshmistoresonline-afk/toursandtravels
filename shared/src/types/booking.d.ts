export type TourRegistration = {
	id: string;
	tourId: string;
	customerId: string;
	travellersCount: number;
	additionalTravellers?: Array<{ name: string; age: number }>;
	paymentMode?: "CASH" | "GPAY" | "OTHER_UPI";
	paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
	status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "WAITLISTED";
	notes: string | null;
	profileSnapshot: {
		first_name: string | null;
		last_name: string | null;
		email: string;
		phone_number: string | null;
		aadhar_number?: string | null;
	};
	tourSnapshot?: {
		name: string;
		tour_code: string;
		destination: string;
		start_date: string | null;
		price: number;
		cover_image: string | null;
	};
	createdAt: string | Date;
	updatedAt: string | Date;
	tours?: any;
};

export type GetTourRegistrationsResponse = {
	registrations: TourRegistration[];
	total: number;
};

