import { z } from "zod";
export const FPTourFilterFormSchema = z.object({
	sortBy: z.string().optional(),
	sortType: z.string().optional(),
	sortCombined: z.string().optional(),
});
