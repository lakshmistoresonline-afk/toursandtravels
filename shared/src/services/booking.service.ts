import {
	collection,
	doc,
	getDocs,
	updateDoc,
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
import { emailService } from "./emails.service";

export class BookingService extends Service {
	/**
	 * Create a tour registration
	 */
	async createRegistration(
		tourId: string,
		travellersCount: number,
		notes?: string,
		paymentMode?: string,
		additionalTravellers?: Array<{ name: string; age: number }>,
	): Promise<string> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		return this.performRegistration(
			tourId,
			this.currentUid,
			travellersCount,
			notes,
			paymentMode,
			additionalTravellers,
		);
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
		additionalTravellers?: Array<{ name: string; age: number }>,
	): Promise<string> {
		return this.performRegistration(
			tourId,
			customerId,
			travellersCount,
			notes,
			paymentMode,
			additionalTravellers,
		);
	}

	/**
	 * Update payment status
	 */
	async updatePaymentStatus(registrationId: string, status: string): Promise<void> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		try {
			const regRef = doc(this.db, this.REGISTRATIONS_COLLECTION, registrationId);
			await updateDoc(regRef, {
				paymentStatus: status,
				updatedAt: serverTimestamp(),
			});
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	/**
	 * Update registration status
	 */
	async updateRegistrationStatus(registrationId: string, status: string): Promise<void> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		try {
			const regRef = doc(this.db, this.REGISTRATIONS_COLLECTION, registrationId);
			await updateDoc(regRef, {
				status,
				updatedAt: serverTimestamp(),
			});
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	/**
	 * Cancel a registration and auto-promote from waitlist
	 */
	async cancelRegistration(registrationId: string): Promise<void> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);

		try {
			await runTransaction(this.db, async (transaction) => {
				const regRef = doc(this.db, this.REGISTRATIONS_COLLECTION, registrationId);
				const regDoc = await transaction.get(regRef);

				if (!regDoc.exists()) throw new Error("Registration not found");
				const regData = regDoc.data();

				if (regData.status === "CANCELLED") return;

				const tourRef = doc(this.db, this.TOURS_COLLECTION, regData.tourId);
				const tourDoc = await transaction.get(tourRef);

				// 1. Mark as cancelled
				transaction.update(regRef, {
					status: "CANCELLED",
					updatedAt: serverTimestamp(),
				});

				// 2. If it was active, decrement count and check waitlist
				if (regData.status !== "WAITLISTED") {
					let newCount = Math.max(0, (tourDoc.data()?.currentParticipants || 0) - regData.travellersCount);
					transaction.update(tourRef, { currentParticipants: newCount });

					// 3. Iteratively promote from waitlist to fill available seats
					const maxParticipants = tourDoc.data()?.max_participants || 100;
					const waitlistQuery = query(
						collection(this.db, this.REGISTRATIONS_COLLECTION),
						where("tourId", "==", regData.tourId),
						where("status", "==", "WAITLISTED"),
						orderBy("createdAt", "asc")
					);
					const waitlistSnap = await getDocs(waitlistQuery);

					for (const nextReg of waitlistSnap.docs) {
						const nextRegData = nextReg.data();
						if (newCount + nextRegData.travellersCount <= maxParticipants) {
							transaction.update(nextReg.ref, {
								status: "PENDING",
								updatedAt: serverTimestamp(),
							});
							newCount += nextRegData.travellersCount;
							transaction.update(tourRef, { currentParticipants: newCount });

							// Trigger Email (Async)
							emailService.sendBookingConfirmation({
								booking_ref: nextReg.id,
								customer_name: `${nextRegData.profileSnapshot.first_name} ${nextRegData.profileSnapshot.last_name}`,
								customer_email: nextRegData.profileSnapshot.email,
								tour_name: nextRegData.tourSnapshot.name,
								travellersCount: nextRegData.travellersCount,
								isPromotion: true,
							}).catch(console.error);
						}
					}
				}
			});
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	/**
	 * Update logistics assignments (Bus/Room)
	 */
	async updateLogisticsAssignments(registrationId: string, data: { busNumber?: string; roomNumber?: string }): Promise<void> {
		if (!this.currentUid) throw new ApiError("Unauthorized", 401);
		try {
			const regRef = doc(this.db, this.REGISTRATIONS_COLLECTION, registrationId);
			await updateDoc(regRef, {
				...data,
				updatedAt: serverTimestamp(),
			});
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
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
		additionalTravellers?: Array<{ name: string; age: number }>,
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
				const isFull =
					tourData.max_participants &&
					currentParticipants + travellersCount > tourData.max_participants;

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

				const status = isFull
					? "WAITLISTED"
					: customerId === this.currentUid
						? "PENDING"
						: "CONFIRMED";

				transaction.set(newRegDoc, {
					tourId,
					customerId,
					travellersCount,
					additionalTravellers: additionalTravellers || [],
					paymentMode: paymentMode || "CASH",
					paymentStatus: "PENDING",
					notes: notes || null,
					status,
					profileSnapshot: {
						first_name: userData.first_name,
						last_name: userData.last_name,
						email: userData.email,
						phone_number: userData.phone_number,
						aadhar_number: userData.aadhar_number,
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

				if (!isFull) {
					transaction.update(tourRef, {
						currentParticipants: currentParticipants + travellersCount,
					});
				}

				// Queue emails after transaction is finalized (but we'll trigger them now for simplicity)
				// In a real app, this would be a background job
				const payload = {
					booking_ref: newRegDoc.id,
					customer_name: `${userData.first_name} ${userData.last_name}`,
					customer_email: userData.email,
					tour_name: tourData.name,
					travellersCount,
				};

				emailService.sendBookingConfirmation(payload).catch(console.error);
				emailService.sendAdminNewRegistrationAlert(payload).catch(console.error);

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

