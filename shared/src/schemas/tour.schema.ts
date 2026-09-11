import { z } from "zod";

/**
 * Tour Schema
 * REFACTORED: Simplified for Firebase-only mode.
 */
export const TourSchema = z.object({
	tour_code: z.string().min(1, "Tour code is required"),
	name: z.string().min(1, "Name is required"),
	overview: z.string().min(1, "Overview is required"),
	destination: z.string().min(1, "Destination is required"),
	price: z.number().nonnegative("Price must be a positive number"),
	max_participants: z.number().int().positive("Max participants must be at least 1"),
	status: z
		.enum(["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "CANCELLED", "COMPLETED"])
		.default("DRAFT"),
	start_date: z.string().min(1, "Start date is required"),
	start_time: z.string().min(1, "Start time is required"),
	end_date: z.string().min(1, "End date is required"),
	end_time: z.string().min(1, "End time is required"),
	cover_image: z.string().optional().nullable(),
	images: z.array(z.string()).optional().default([]),
	itinerary: z
		.array(
			z.object({
				day_number: z.number().int().positive(),
				title: z.string().min(1, "Title is required"),
				description: z.string().min(1, "Description is required"),
			}),
		)
		.optional()
		.default([]),
});

export const AddTourActionSchema = TourSchema;
export type AddTourActionDate = z.infer<typeof AddTourActionSchema>;
export type AddTourInput = AddTourActionDate;
