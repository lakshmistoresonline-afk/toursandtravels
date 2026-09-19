import { DestinationSpot } from "../types/spots";

export function normalizeAliases(aliases: string | string[]): string[] {
	if (Array.isArray(aliases)) {
		return Array.from(new Set(aliases.map(a => a.trim()).filter(Boolean)));
	}
	if (typeof aliases === "string") {
		return Array.from(new Set(aliases.split("|").map(a => a.trim()).filter(Boolean)));
	}
	return [];
}

export function validateSpot(spot: Partial<DestinationSpot>): string[] {
	const errors: string[] = [];
	if (!spot.canonicalName) errors.push("Canonical Name is required");
	if (!spot.geography?.stateUT) errors.push("State/UT is required");
	if (!spot.domains || spot.domains.length === 0) errors.push("At least one domain (PILGRIMAGE/TOURIST) is required");
	return errors;
}

export function generateSearchKeywords(spot: Partial<DestinationSpot>): string[] {
	const words = new Set<string>();

	const addPhrase = (text: string) => {
		if (!text) return;
		const parts = text.toLowerCase().split(/[\s,/-]+/).filter(p => p.length > 1);
		parts.forEach(p => words.add(p));
	};

	addPhrase(spot.canonicalName || "");
	spot.aliases?.forEach(addPhrase);
	spot.alternateNames?.forEach(addPhrase);
	addPhrase(spot.geography?.cityLocality || "");
	addPhrase(spot.geography?.district || "");
	addPhrase(spot.geography?.stateUT || "");

	return Array.from(words);
}

export function normalizeSpotData(input: any): Partial<DestinationSpot> {
	const aliases = normalizeAliases(input.aliases || []);
	const alternateNames = normalizeAliases(input.alternateNames || []);
	const domains = input.domains || (input.topCategory ? [input.topCategory] : []);

	const data: Partial<DestinationSpot> = {
		spotId: input.spotId,
		canonicalName: input.canonicalName?.trim(),
		aliases: aliases,
		alternateNames: alternateNames,
		domains: domains,
		category: input.category || input.topCategory,
		subcategory: Array.isArray(input.subcategory) ? input.subcategory : (input.subcategory ? [input.subcategory] : []),
		geography: {
			region: input.region || input.geography?.region,
			stateUT: input.stateUT || input.geography?.stateUT,
			district: input.district || input.geography?.district,
			cityLocality: input.cityLocality || input.geography?.cityLocality,
			locality: input.locality || input.geography?.locality,
			address: input.address || input.geography?.address,
		},
		religion: Array.isArray(input.religion) ? input.religion : (input.religion ? [input.religion] : []),
		deity: Array.isArray(input.deity) ? input.deity : (input.deity ? [input.deity] : []),
		description: input.description,
		significance: input.significance,
		latitude: input.latitude,
		longitude: input.longitude,
		importance: input.importance || "UNRANKED",
		verification: {
			status: input.verification?.status || input.verificationStatus || "DISCOVERED",
			notes: input.verification?.notes,
		},
		status: input.status || "draft"
	};

	data.searchKeywords = generateSearchKeywords(data);
	return data;
}
