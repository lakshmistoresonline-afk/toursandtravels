import { z } from "zod";

export const SpotGeographySchema = z.object({
	region: z.string().min(1, "Region is required"),
	stateUT: z.string().min(1, "State/UT is required"),
	district: z.string().min(1, "District is required"),
	cityLocality: z.string().min(1, "City/Locality is required"),
	locality: z.string().optional(),
	address: z.string().optional(),
});

export const SpotVerificationSchema = z.object({
	status: z.enum([
		"DISCOVERED",
		"DATA_COLLECTED",
		"PENDING_ADMIN_VERIFICATION",
		"VERIFIED",
		"JOURNEY_READY",
		"PUBLISHED",
		"ARCHIVED",
	]),
	verifiedBy: z.string().optional(),
	verifiedAt: z.string().optional(),
	notes: z.string().optional(),
});

export const DestinationSpotSchema = z.object({
	spotId: z.string().min(1, "Spot ID is required"),
	canonicalName: z.string().min(1, "Canonical Name is required"),
	alternateNames: z.array(z.string()).default([]),
	aliases: z.array(z.string()).default([]),
	searchKeywords: z.array(z.string()).default([]),
	domains: z.array(z.enum(["PILGRIMAGE", "TOURIST"])).min(1, "At least one domain is required"),
	category: z.string().min(1, "Category is required"),
	subcategory: z.array(z.string()).default([]),
	geography: SpotGeographySchema,
	religion: z.array(z.string()).default([]),
	deity: z.array(z.string()).default([]),
	traditions: z.array(z.string()).default([]),
	description: z.string().optional(),
	significance: z.string().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	importance: z.enum(["MAJOR", "REGIONAL", "LOCAL", "UNRANKED"]).default("UNRANKED"),
	verification: SpotVerificationSchema,
	status: z.enum(["active", "archived", "draft"]).default("draft"),
});
