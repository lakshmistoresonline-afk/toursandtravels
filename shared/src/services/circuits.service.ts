import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	query,
	orderBy,
	serverTimestamp,
	limit,
} from "firebase/firestore";
import { Service } from "./service.base";
import { ApiError } from "../utils/ApiError";
import type { Circuit, GetCircuitsResponse } from "../types/circuits";

export class CircuitsService extends Service {
	async createCircuit(input: Partial<Circuit>): Promise<string> {
		try {
			const circuitRef = collection(this.db, this.CIRCUITS_COLLECTION);
			const docRef = await addDoc(circuitRef, {
				...input,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				status: input.status || "draft",
			});
			return docRef.id;
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async getCircuitById(id: string): Promise<Circuit | null> {
		try {
			const circuitDoc = await getDoc(doc(this.db, this.CIRCUITS_COLLECTION, id));
			if (!circuitDoc.exists()) return null;
			return { id: circuitDoc.id, ...circuitDoc.data() } as any;
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async updateCircuit(id: string, data: Partial<Circuit>): Promise<void> {
		try {
			const circuitRef = doc(this.db, this.CIRCUITS_COLLECTION, id);
			await updateDoc(circuitRef, {
				...data,
				updatedAt: serverTimestamp(),
			});
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}

	async archiveCircuit(id: string): Promise<void> {
		return this.updateCircuit(id, { status: "archived" });
	}

	async listCircuits(pageSize = 20): Promise<GetCircuitsResponse> {
		try {
			const circuitRef = collection(this.db, this.CIRCUITS_COLLECTION);
			const q = query(circuitRef, orderBy("name"), limit(pageSize));
			const snap = await getDocs(q);
			return {
				circuits: snap.docs.map(d => ({ id: d.id, ...d.data() } as any)),
				total: snap.size
			};
		} catch (err: any) {
			throw new ApiError(err.message, 500);
		}
	}
}
