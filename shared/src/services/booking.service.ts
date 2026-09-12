import {
	collection,
	doc,
	getDocs,
	query,
	where,
	orderBy,
	limit,
	serverTimestamp,
	runTransaction,
} from "firebase/firestore";
import { Service } from "@workspace/shared/services/service.base";
import { ApiError } from "@workspace/shared/utils/ApiError";
import type { GetTourRegistrationsResponse } from "@workspace/shared/types/booking";

export class BookingService extends Service {
	/**
	 * Create a tour registration
	 */
	async createRegistration(
		tourId: string,
		travellersCount: number,
		notes?: string,
		paymentMode?: string,
	): Promise<string> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		return this.performRegistration(tourId, this.currentUid, travellersCount, notes, paymentMode);
	}

	/**
	 * Create registration on behalf of a user (Admin)
	 */
	async adminCreateRegistration(
		tourId: string,
		customerId: string,
		travellersCount: number,
		notes?: string,
		paymentMode?: string,
	): Promise<string> {
		return this.performRegistration(tourId, customerId, travellersCount, notes, paymentMode);
	}

	/**
	 * Shared registration logic
	 */
	private async performRegistration(
		tourId: string,
		customerId: string,
		travellersCount: number,
		notes?: string,
		paymentMode?: string,
	): Promise<string> {
		try {
			// Check for existing registration before starting transaction
			const existingRegQuery = query(
				collection(this.db, this.REGISTRATIONS_COLLECTION),
				where("tourId", "==", tourId),
				where("customerId", "==", customerId),
			);
			const existingRegSnap = await getDocs(existingRegQuery);
			if (!existingRegSnap.empty) {
				throw new ApiError("This pilgrim is already registered for this journey.", 400);
			}

			return await runTransaction(this.db, async (transaction) => {
				const tourRef = doc(this.db, this.TOURS_COLLECTION, tourId);
				const tourDoc = await transaction.get(tourRef);

				if (!tourDoc.exists()) throw new ApiError("Pilgrimage journey not found", 404);
				const tourData = tourDoc.data();

				const currentParticipants = tourData.currentParticipants || 0;
				if (
					tourData.max_participants &&
					currentParticipants + travellersCount > tourData.max_participants
				) {
					throw new ApiError("Pilgrimage journey is full", 400);
				}

				const userRef = doc(this.db, this.USERS_COLLECTION, customerId);
				const userDoc = await transaction.get(userRef);
				if (!userDoc.exists()) throw new ApiError("User profile not found", 404);

				const userData = userDoc.data();
				if (userData.role === "admin") {
					throw new ApiError("Administrators cannot be registered as pilgrims for a journey", 403);
				}

				// Check for existing registration
				const existingRegQuery = query(
					collection(this.db, this.REGISTRATIONS_COLLECTION),
					where("tourId", "==", tourId),
					where("customerId", "==", customerId),
				);
				const existingRegSnap = await getDocs(existingRegQuery);
				if (!existingRegSnap.empty) {
					throw new ApiError("This pilgrim is already registered for this journey.", 400);
				}

				const regRef = collection(this.db, this.REGISTRATIONS_COLLECTION);
				const newRegDoc = doc(regRef);
				transaction.set(newRegDoc, {
					tourId,
					customerId,
					travellersCount,
					paymentMode: paymentMode || "CASH",
					notes: notes || null,
					status: customerId === this.currentUid ? "PENDING" : "CONFIRMED",
					profileSnapshot: {
						first_name: userData.first_name,
						last_name: userData.last_name,
						email: userData.email,
						phone_number: userData.phone_number,
					},
					tourSnapshot: {
						name: tourData.name,
						tour_code: tourData.tour_code,
						destination: tourData.destination,
						start_date: tourData.start_date,
						price: tourData.price,
						cover_image: tourData.cover_image,
					},
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				});

				transaction.update(tourRef, {
					currentParticipants: currentParticipants + travellersCount,
				});

				return newRegDoc.id;
			});
		} catch (err: any) {
			throw err instanceof ApiError ? err : new ApiError(err.message, 500);
		}
	}

	async getMyRegistrations(_pageIndex = 0, pageSize = 10): Promise<GetTourRegistrationsResponse> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);

		// Use simple query to avoid composite index requirement
		const q = query(
			collection(this.db, this.REGISTRATIONS_COLLECTION),
			where("customerId", "==", this.currentUid),
		);

		const snap = await getDocs(q);
		let registrations = snap.docs.map((d) => {
			const data = d.data();
			return {
				id: d.id,
				...data,
				tours: data.tourSnapshot || null,
			};
		}) as any[];

		// Sort in-memory to avoid index requirement
		registrations.sort((a, b) => {
			const dateA = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt).getTime();
			const dateB = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		// Apply limit manually
		registrations = registrations.slice(0, pageSize);

		return { registrations, total: registrations.length } as any;
	}

	async getAllRegistrations(_pageIndex = 0, pageSize = 20): Promise<GetTourRegistrationsResponse> {
		// getAllRegistrations already used a simple query (just orderBy), which is fine.
		// But to be consistent and safe on Spark plan:
		const q = query(
			collection(this.db, this.REGISTRATIONS_COLLECTION),
			orderBy("createdAt", "desc"),
			limit(pageSize),
		);
		const snap = await getDocs(q);
		const registrations = snap.docs.map((d) => {
			const data = d.data();
			return {
				id: d.id,
				...data,
				tours: data.tourSnapshot || null,
			};
		});
		return { registrations, total: registrations.length } as any;
	}

	async getTourRegistrations(tourId: string): Promise<GetTourRegistrationsResponse> {
		const q = query(
			collection(this.db, this.REGISTRATIONS_COLLECTION),
			where("tourId", "==", tourId),
		);
		const snap = await getDocs(q);
		let registrations = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

		// Sort in-memory to avoid mandatory composite index
		registrations.sort((a, b) => {
			const dateA = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt).getTime();
			const dateB = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		return { registrations, total: registrations.length } as any;
	}

	async getRegistrationsByTour(tourId: string): Promise<any[]> {
		const q = query(
			collection(this.db, this.REGISTRATIONS_COLLECTION),
			where("tourId", "==", tourId),
		);
		const snap = await getDocs(q);
		let registrations = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

		// Sort in-memory to avoid mandatory composite index
		registrations.sort((a, b) => {
			const dateA = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt).getTime();
			const dateB = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		return registrations;
	}
}
