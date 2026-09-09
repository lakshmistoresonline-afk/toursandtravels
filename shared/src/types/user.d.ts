export enum UserRole {
	ADMIN = "admin",
	USER = "user",
}

export type AppUser = {
	uid: string;
	email: string;
	role: "admin" | "user";
	status: "active" | "inactive";
	first_name: string | null;
	last_name: string | null;
	phone_number: string | null;
	whatsapp_number: string | null;
	gender: string | null;
	date_of_birth: string | null;
	address_house: string | null;
	address_street: string | null;
	address_locality: string | null;
	address_district: string | null;
	address_state: string | null;
	address_pin_code: string | null;
	country: string | null;
	emergency_contact_name: string | null;
	emergency_contact_number: string | null;
	avatar_url?: string | null;
	createdAt: string;
	updatedAt: string;
};

// Compatibility types
export type AdminUser = AppUser;
export type FullCurrentUser = AppUser;
