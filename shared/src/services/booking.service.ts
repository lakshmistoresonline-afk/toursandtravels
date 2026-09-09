import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
	runTransaction
} from "firebase/firestore";
import { Service } from "@workspace/shared/services/service.base";
import { ApiError } from "@workspace/shared/utils/ApiError";
import type {
	GetTourRegistrationsResponse
} from "@workspace/shared/types/booking";

export class BookingService extends Service {
	/**
	 * Create a tour registration
	 */
	async createRegistration(tourId: string, travellersCount: number, notes?: string): Promise<string> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		return this.performRegistration(tourId, this.currentUid, travellersCount, notes);
	}

	/**
	 * Create registration on behalf of a user (Admin)
	 */
	async adminCreateRegistration(tourId: string, customerId: string, travellersCount: number, notes?: string): Promise<string> {
		return this.performRegistration(tourId, customerId, travellersCount, notes);
	}

	/**
	 * Shared registration logic
	 */
	private async performRegistration(tourId: string, customerId: string, travellersCount: number, notes?: string): Promise<string> {
		try {
			return await runTransaction(this.db, async (transaction) => {
				const tourRef = doc(this.db, this.TOURS_COLLECTION, tourId);
				const tourDoc = await transaction.get(tourRef);

				if (!tourDoc.exists()) throw new ApiError("Tour not found", 404);
				const tourData = tourDoc.data();

				const currentParticipants = tourData.currentParticipants || 0;
				if (tourData.max_participants && (currentParticipants + travellersCount > tourData.max_participants)) {
					throw new ApiError("Tour is full", 400);
				}

				const userRef = doc(this.db, this.USERS_COLLECTION, customerId);
				const userDoc = await transaction.get(userRef);
				if (!userDoc.exists()) throw new ApiError("User profile not found", 404);

				const regRef = collection(this.db, this.REGISTRATIONS_COLLECTION);
				const newRegDoc = doc(regRef);
				transaction.set(newRegDoc, {
					tourId,
					customerId,
					travellersCount,
					notes: notes || null,
					status: "CONFIRMED", // Admin registrations are confirmed by default
					profileSnapshot: userDoc.data(),
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});

				transaction.update(tourRef, {
					currentParticipants: currentParticipants + travellersCount
				});

				return newRegDoc.id;
			});
		} catch (err: any) {
			throw err instanceof ApiError ? err : new ApiError(err.message, 500);
		}
	}

	async getMyRegistrations(): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		const q = query(collection(this.db, this.REGISTRATIONS_COLLECTION), where("customerId", "==", this.currentUid), orderBy("createdAt", "desc"));
		const snap = await getDocs(q);
		const registrations = await Promise.all(snap.docs.map(async (d) => {
			const data = d.data();
			const tourSnap = await getDoc(doc(this.db, this.TOURS_COLLECTION, data.tourId));
			return { id: d.id, ...data, tours: tourSnap.exists() ? { id: tourSnap.id, ...tourSnap.data() } : null };
		}));
		return { registrations, total: registrations.length } as any;
	}

	async getAllRegistrations(): Promise<GetTourRegistrationsResponse> {
		const q = query(collection(this.db, this.REGISTRATIONS_COLLECTION), orderBy("createdAt", "desc"));
		const snap = await getDocs(q);
		const registrations = await Promise.all(snap.docs.map(async (d) => {
			const data = d.data();
			const tourSnap = await getDoc(doc(this.db, this.TOURS_COLLECTION, data.tourId));
			return { id: d.id, ...data, tours: tourSnap.exists() ? { id: tourSnap.id, ...tourSnap.data() } : null };
		}));
		return { registrations, total: registrations.length } as any;
	}
}
