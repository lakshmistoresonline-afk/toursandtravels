import {
	collection,
	doc,
	getDoc,
	getDocs,
	updateDoc,
	query,
	where,
	orderBy,
	serverTimestamp,
	limit,
	setDoc,
	startAfter,
	getCountFromServer,
} from "firebase/firestore";
import { Service } from "./service.base";
import { ApiError } from "../utils/ApiError";
import type { DestinationSpot, GetSpotsResponse } from "../types/spots";

export class SpotsService extends Service {
	async createSpot(input: Partial<DestinationSpot>): Promise<string> {
		try {
			const spotId = input.spotId || `SPOT-${Date.now()}`;
			const spotRef = doc(this.db, this.SPOTS_COLLECTION, spotId);

			const data = {
				...input,
				spotId,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				status: input.status || "draft",
				verification: {
					status: "DISCOVERED",
					...input.verification,
				},
			};

			await setDoc(spotRef, data);
			return spotId;
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async getSpotById(spotId: string): Promise<DestinationSpot | null> {
		try {
			const spotDoc = await getDoc(doc(this.db, this.SPOTS_COLLECTION, spotId));
			if (!spotDoc.exists()) return null;
			return { id: spotDoc.id, ...spotDoc.data() } as any;
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async updateSpot(spotId: string, data: Partial<DestinationSpot>): Promise<void> {
		try {
			const spotRef = doc(this.db, this.SPOTS_COLLECTION, spotId);

			// Sync operational status if verification status changes
			let statusUpdate = {};
			if (data.verification?.status === "PUBLISHED") {
				statusUpdate = { status: "active" };
			} else if (data.verification?.status === "ARCHIVED") {
				statusUpdate = { status: "archived" };
			}

			await updateDoc(spotRef, {
				...data,
				...statusUpdate,
				updatedAt: serverTimestamp(),
			});
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async verifySpot(spotId: string, verifiedBy: string): Promise<void> {
		const spot = await this.getSpotById(spotId);
		if (!spot) throw new ApiError("Spot not found", 404);

		// Transition Rule: Can only verify if DISCOVERED or PENDING
		const allowed = ["DISCOVERED", "DATA_COLLECTED", "PENDING_ADMIN_VERIFICATION"];
		if (!allowed.includes(spot.verification.status)) {
			throw new ApiError(`Invalid transition from ${spot.verification.status} to VERIFIED`, 400);
		}

		return this.updateSpot(spotId, {
			verification: {
				...spot.verification,
				status: "VERIFIED",
				verifiedBy,
				verifiedAt: new Date().toISOString(),
			},
		} as any);
	}

	async publishSpot(spotId: string): Promise<void> {
		const spot = await this.getSpotById(spotId);
		if (!spot) throw new ApiError("Spot not found", 404);

		// Transition Rule: Can only publish if VERIFIED or JOURNEY_READY
		const allowed = ["VERIFIED", "JOURNEY_READY", "PUBLISHED"];
		if (!allowed.includes(spot.verification.status)) {
			throw new ApiError(`Invalid transition from ${spot.verification.status} to PUBLISHED. Spot must be VERIFIED first.`, 400);
		}

		return this.updateSpot(spotId, {
			status: "active",
			verification: { ...spot.verification, status: "PUBLISHED" }
		} as any);
	}

	async archiveSpot(spotId: string): Promise<void> {
		const spot = await this.getSpotById(spotId);
		if (!spot) throw new ApiError("Spot not found", 404);

		return this.updateSpot(spotId, {
			status: "archived",
			verification: { ...spot.verification, status: "ARCHIVED" }
		} as any);
	}

	async searchSpots(queryText: string, domain?: "PILGRIMAGE" | "TOURIST"): Promise<DestinationSpot[]> {
		try {
			const lowerQuery = queryText.toLowerCase().trim();
			if (!lowerQuery) return [];

			const spotsRef = collection(this.db, this.SPOTS_COLLECTION);

			// Scalable Strategy: Search by keywords array
			// Firestore "array-contains" is limited to 1 value.
			// We'll take the first word of the query.
			const searchWord = lowerQuery.split(" ")[0];

			let q = query(
				spotsRef,
				where("searchKeywords", "array-contains", searchWord),
				limit(100)
			);

			const snap = await getDocs(q);
			let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

			// Fine-grained filtering in memory for multi-word queries
			const queryWords = lowerQuery.split(" ");
			if (queryWords.length > 1) {
				results = results.filter((spot: DestinationSpot) =>
					queryWords.every(word =>
						spot.canonicalName.toLowerCase().includes(word) ||
						spot.aliases.some(a => a.toLowerCase().includes(word)) ||
						spot.geography.cityLocality.toLowerCase().includes(word)
					)
				);
			}

			if (domain) {
				results = results.filter((s: DestinationSpot) => s.domains?.includes(domain));
			}

			return results;
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async listSpots(pageSize = 20, lastVisible?: any): Promise<GetSpotsResponse> {
		try {
			const spotsRef = collection(this.db, this.SPOTS_COLLECTION);

			// Get total count (server-side aggregation is fast/cheap)
			const countSnap = await getCountFromServer(spotsRef);
			const total = countSnap.data().count;

			let q = query(spotsRef, orderBy("canonicalName"), limit(pageSize));

			if (lastVisible) {
				q = query(q, startAfter(lastVisible));
			}

			const snap = await getDocs(q);
			return {
				spots: snap.docs.map(d => ({ id: d.id, ...d.data() } as any)),
				total: total
			};
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async findDuplicateCandidates(spot: Partial<DestinationSpot>): Promise<DestinationSpot[]> {
		if (!spot.canonicalName) return [];

		try {
			const spotsRef = collection(this.db, this.SPOTS_COLLECTION);

			// 1. Exact canonical name match
			const q1 = query(spotsRef, where("canonicalName", "==", spot.canonicalName));
			const snap1 = await getDocs(q1);

			// 2. City + first word of name match
			const searchWord = spot.canonicalName.toLowerCase().split(" ")[0];
			let q2 = query(spotsRef, where("searchKeywords", "array-contains", searchWord));
			if (spot.geography?.cityLocality) {
				q2 = query(q2, where("geography.cityLocality", "==", spot.geography.cityLocality));
			}
			const snap2 = await getDocs(q2);

			const results = [...snap1.docs, ...snap2.docs].map(d => ({ id: d.id, ...d.data() } as any));

			// De-duplicate results and exclude the current spot
			const uniqueResults = Array.from(new Map(results.map(r => [r.spotId, r])).values());
			return uniqueResults.filter(r => r.spotId !== spot.spotId);
		} catch (err: any) {
			console.error("Duplicate check failed", err);
			return [];
		}
	}
}
