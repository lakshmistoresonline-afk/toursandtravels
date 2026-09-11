import { z } from "zod";

export const contactSchema = z.object({
	full_name: z
		.string()
		.min(1, "Full name is required")
		.max(100, "Full name cannot exceed 100 characters"),
	email: z
		.string()
		.min(1, "Email is required")
		.email("Invalid email address"),
	subject: z
		.string()
		.min(1, "Subject is required")
		.max(200, "Subject cannot exceed 200 characters"),
	message: z
		.string()
		.min(1, "Message is required")
		.max(2000, "Message cannot exceed 2000 characters"),
});

export type contactFormData = z.infer<typeof contactSchema>;
