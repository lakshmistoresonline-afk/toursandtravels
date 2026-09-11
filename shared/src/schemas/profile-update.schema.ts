import z from "zod";

export const profileUpdateSchema = z.object({
	first_name: z.string().min(1, "First name is required").max(50),
	last_name: z.string().min(1, "Last name is required").max(50),
	gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
	date_of_birth: z.string().optional().nullable(),
	phone_number: z.string().optional().nullable(),
	whatsapp_number: z.string().optional().nullable(),
	address_house: z.string().optional().nullable(),
	address_street: z.string().optional().nullable(),
	address_locality: z.string().optional().nullable(),
	address_post_office: z.string().optional().nullable(),
	address_district: z.string().optional().nullable(),
	address_state: z.string().optional().nullable(),
	address_pin_code: z.string().optional().nullable(),
	country: z.string().optional().nullable(),
	aadhar_number: z.string().optional().nullable(),
	identity_type: z.string().optional().nullable(),
	identity_number: z.string().optional().nullable(),
	emergency_contact_name: z.string().optional().nullable(),
	emergency_contact_number: z.string().optional().nullable(),
	emergency_contact_relationship: z.string().optional().nullable(),
	avatar_url: z.string().optional().nullable(),
});

export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
