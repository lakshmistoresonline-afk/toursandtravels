import { DestinationSpot } from "./spots";

export type Circuit = {
	id: string;
	name: string;
	religion?: string;
	domain: "PILGRIMAGE" | "TOURIST";
	spotIds: string[]; // Ordered list of destination IDs
	defaultDurationDays: number;
	description?: string;
	createdAt: string;
	updatedAt: string;
	status: "active" | "archived" | "draft";
};

export type GetCircuitsResponse = {
	circuits: Circuit[];
	total: number;
};
