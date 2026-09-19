import { z } from "zod";

export const CircuitSchema = z.object({
	name: z.string().min(1, "Circuit Name is required"),
	domain: z.enum(["PILGRIMAGE", "TOURIST"]),
	religion: z.string().optional(),
	spotIds: z.array(z.string()).min(1, "At least one destination is required"),
	defaultDurationDays: z.number().int().positive("Duration must be at least 1 day"),
	description: z.string().optional(),
	status: z.enum(["active", "archived", "draft"]).default("draft"),
});
