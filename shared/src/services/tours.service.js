import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	query,
	where,
	orderBy,
	serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Service } from "@workspace/shared/services/service.base";
import { ApiError } from "@workspace/shared/utils/ApiError";
export class ToursService extends Service {
	async addTour(input) {
		try {
			const tourRef = collection(this.db, this.TOURS_COLLECTION);
			const docRef = await addDoc(tourRef, {
				...input,
				currentParticipants: 0,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				added_by: this.currentUid,
			});
			return docRef.id;
		} catch (err) {
			throw new ApiError(err.message, 500);
		}
	}
	async updateTour(tourId, data) {
		try {
			const tourRef = doc(this.db, this.TOURS_COLLECTION, tourId);
			await updateDoc(tourRef, {
				...data,
				updatedAt: serverTimestamp(),
			});
			return { success: true };
		} catch (err) {
			throw new ApiError(err.message, 500);
		}
	}
	async getTourDetails(tourId) {
		try {
			const tourDoc = await getDoc(doc(this.db, this.TOURS_COLLECTION, tourId));
			if (!tourDoc.exists()) throw new ApiError("Pilgrimage journey not found", 404);
			const tourData = tourDoc.data();
			// Support both legacy subcollection and new field-based itinerary
			let itinerary = tourData.itinerary || [];
			if (itinerary.length === 0) {
				const itineraryRef = collection(this.db, this.TOURS_COLLECTION, tourId, "itineraries");
				const itinerarySnap = await getDocs(query(itineraryRef, orderBy("day_number", "asc")));
				itinerary = itinerarySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
			}
			return { id: tourDoc.id, ...tourData, itinerary };
		} catch (err) {
			throw new ApiError(err.message, 500);
		}
	}
	/**
	 * Get tours for front panel
	 * Uses status filter to avoid fetching drafts/closed journeys
	 */
	async getFPHighLevelTours(qText = "") {
		try {
			const toursRef = collection(this.db, this.TOURS_COLLECTION);
			// Use combined query for status
			const q = query(
				toursRef,
				where("status", "in", ["PUBLISHED", "REGISTRATION_OPEN"]),
				orderBy("createdAt", "desc"),
			);
			const snap = await getDocs(q);
			let tours = snap.docs.map((d) => ({
				id: d.id,
				...d.data(),
				createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
			}));
			if (qText) {
				tours = tours.filter((t) => t.name.toLowerCase().includes(qText.toLowerCase()));
			}
			return { tours, total: tours.length };
		} catch (err) {
			console.error("Firestore getFPHighLevelTours error:", err);
			// Fallback to simpler query if index is missing
			return this.getHighLevelTours(qText);
		}
	}
	async getHighLevelTours(qText = "") {
		try {
			const toursRef = collection(this.db, this.TOURS_COLLECTION);
			const q = query(toursRef, orderBy("createdAt", "desc"));
			const snap = await getDocs(q);
			let tours = snap.docs.map((d) => ({
				id: d.id,
				...d.data(),
				createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
			}));
			if (qText) {
				tours = tours.filter((t) => t.name.toLowerCase().includes(qText.toLowerCase()));
			}
			return { tours, total: tours.length };
		} catch (err) {
			throw new ApiError(err.message, 500);
		}
	}
	async uploadTourImage(file, path) {
		const storageRef = ref(this.storage, `tours/${path}/${file.name}`);
		await uploadBytes(storageRef, file);
		return await getDownloadURL(storageRef);
	}
	async deleteTourImage(url) {
		const storageRef = ref(this.storage, url);
		await deleteObject(storageRef);
	}
}
