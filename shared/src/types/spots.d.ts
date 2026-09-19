export type DestinationSpot = {
	spotId: string;

	canonicalName: string;
	alternateNames: string[];
	aliases: string[];
	searchKeywords: string[];

	domains: Array<"PILGRIMAGE" | "TOURIST">;

	category: string;
	subcategory?: string[];

	geography: {
		region: string;
		stateUT: string;
		district: string;
		cityLocality: string;
		locality?: string;
		address?: string;
	};

	religion?: string[];
	deity?: string[];
	traditions?: string[];

	description?: string;
	significance?: string;

	latitude?: number;
	longitude?: number;

	recommendedVisitDuration?: string;

	openingTime?: string;
	closingTime?: string;

	bestSeason?: string[];

	festivals?: string[];

	entryFee?: string;

	accessibility?: string;

	nearestAirport?: string;
	nearestRailway?: string;
	roadAccess?: string;

	nearbySpotIds?: string[];

	recommendedJourneyIds?: string[];

	sourceIds?: string[];

	importance?: "MAJOR" | "REGIONAL" | "LOCAL" | "UNRANKED";

	verification: {
		status:
			| "DISCOVERED"
			| "DATA_COLLECTED"
			| "PENDING_ADMIN_VERIFICATION"
			| "VERIFIED"
			| "JOURNEY_READY"
			| "PUBLISHED"
			| "ARCHIVED";

		verifiedBy?: string;
		verifiedAt?: string;
		notes?: string;
	};

	createdAt: string;
	updatedAt: string;
	status: "active" | "archived" | "draft";
};

export type GetSpotsResponse = {
	spots: DestinationSpot[];
	total: number;
};
