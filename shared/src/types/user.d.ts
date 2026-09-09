export enum UserRole {
	ADMIN = "admin",
	CONSUMER = "consumer",
}

export type AdminUser = {
	id: string;
	email: string;
	is_email_verified: boolean;
	created_at: string;
	first_name: string | null;
	last_name: string | null;
	phone_number: string | null;
	role: {
		role_id: number;
		role_name: string;
	};
};

export type FullCurrentUser = {
	id: string;
	email: string;
	is_email_verified: boolean;
	created_at: string;
	first_name: string | null;
	last_name: string | null;
	avatar_url?: string | null;
	phone_number: string | null;
	whatsapp_number: string | null;
	gender: string | null;
	date_of_birth: string | null;
	address_house: string | null;
	address_street: string | null;
	address_locality: string | null;
	address_post_office: string | null;
	address_district: string | null;
	address_state: string | null;
	address_pin_code: string | null;
	country: string | null;
	identity_type: string | null;
	identity_number: string | null;
	emergency_contact_name: string | null;
	emergency_contact_number: string | null;
	emergency_contact_relationship: string | null;
	role: {
		role_id: number;
		role_name: string;
	};
};
