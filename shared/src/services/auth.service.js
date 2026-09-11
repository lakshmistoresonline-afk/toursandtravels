import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	onAuthStateChanged,
	getAuth,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	collection,
	getDocs,
	query,
	orderBy,
} from "firebase/firestore";
import { Service } from "@workspace/shared/services/service.base";
import { ApiError } from "@workspace/shared/utils/ApiError";
import { waitForAuth } from "@workspace/shared/utils/auth-helper";
export class AuthService extends Service {
	/**
	 * Get full profile for current user
	 */
	async getFullCurrentUser() {
		const firebaseUser = await waitForAuth();
		if (!firebaseUser) return { user: null, error: new ApiError("Not authenticated", 401) };
		try {
			const userDoc = await getDoc(doc(this.db, this.USERS_COLLECTION, firebaseUser.uid));
			if (!userDoc.exists()) {
				return { user: null, error: new ApiError("User profile not found", 404) };
			}
			return { user: userDoc.data(), error: null };
		} catch (err) {
			return { user: null, error: new ApiError(err.message, 500) };
		}
	}
	/**
	 * Get all users (Admin)
	 */
	async getAllUsers() {
		try {
			const q = query(collection(this.db, this.USERS_COLLECTION), orderBy("first_name", "asc"));
			const snap = await getDocs(q);
			return snap.docs.map((d) => d.data());
		} catch (err) {
			throw new ApiError(err.message, 500);
		}
	}
	/**
	 * Login with Email and Password
	 */
	async loginWithPassword({ email, password }) {
		try {
			const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
			const { user: profile } = await this.getFullCurrentUser();
			return { user: userCredential.user, profile, error: null };
		} catch (err) {
			return { user: null, profile: null, error: new ApiError(err.message, 401) };
		}
	}
	/**
	 * Register a new user
	 */
	async signUpWithPasswordAndProfile(data) {
		try {
			const userCredential = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
			const uid = userCredential.user.uid;
			const profile = {
				uid,
				email: data.email,
				role: "user",
				status: "active",
				first_name: data.firstName,
				last_name: data.lastName,
				phone_number: data.phone,
				whatsapp_number: null,
				gender: data.gender,
				date_of_birth: data.dateOfBirth,
				address_house: null,
				address_street: null,
				address_locality: null,
				address_district: null,
				address_state: null,
				address_pin_code: null,
				country: null,
				emergency_contact_name: null,
				emergency_contact_number: null,
				aadhar_number: data.aadharNumber,
				avatar_url: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			await setDoc(doc(this.db, this.USERS_COLLECTION, uid), {
				...profile,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			return { success: true, user: userCredential.user, profile };
		} catch (err) {
			return { success: false, error: err.message };
		}
	}
	/**
	 * Update Profile
	 */
	async updateUserProfile(data) {
		try {
			const userRef = doc(this.db, this.USERS_COLLECTION, data.uid);
			// Allow-list of updateable fields
			const updateData = {};
			const allowedFields = [
				"first_name",
				"last_name",
				"phone_number",
				"whatsapp_number",
				"gender",
				"date_of_birth",
				"address_house",
				"address_street",
				"address_locality",
				"address_district",
				"address_state",
				"address_pin_code",
				"country",
				"emergency_contact_name",
				"emergency_contact_number",
				"aadhar_number",
				"avatar_url",
			];
			allowedFields.forEach((field) => {
				if (data[field] !== undefined) {
					updateData[field] = data[field];
				}
			});
			await updateDoc(userRef, {
				...updateData,
				updatedAt: serverTimestamp(),
			});
			return { success: true };
		} catch (err) {
			return { success: false, error: err.message };
		}
	}
	/**
	 * Logout
	 */
	async logout() {
		await signOut(this.auth);
		return { success: true };
	}
	/**
	 * Reset Password
	 */
	async sendResetPasswordRequest(email) {
		try {
			await sendPasswordResetEmail(this.auth, email);
			return { success: true };
		} catch (err) {
			return { success: false, error: err.message };
		}
	}
	/**
	 * Admin: Create a new user without signing out current user
	 */
	async adminCreateUserAndProfile(data) {
		try {
			// This is a hack to create a user in Firebase Auth without signing out the current admin.
			// We initialize a secondary app.
			const secondaryApp =
				getApps().find((app) => app.name === "Secondary") ||
				initializeApp(this.auth.app.options, "Secondary");
			const secondaryAuth = getAuth(secondaryApp);
			const userCredential = await createUserWithEmailAndPassword(
				secondaryAuth,
				data.email,
				"Password123",
			);
			const uid = userCredential.user.uid;
			const profile = {
				uid,
				email: data.email,
				role: "user",
				status: "active",
				first_name: data.firstName,
				last_name: data.lastName,
				phone_number: data.phone,
				whatsapp_number: null,
				gender: null,
				date_of_birth: null,
				address_house: null,
				address_street: null,
				address_locality: null,
				address_district: null,
				address_state: null,
				address_pin_code: null,
				country: null,
				emergency_contact_name: null,
				emergency_contact_number: null,
				aadhar_number: data.aadharNumber,
				avatar_url: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			await setDoc(doc(this.db, this.USERS_COLLECTION, uid), {
				...profile,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			// Sign out the secondary app immediately to be safe
			await signOut(secondaryAuth);
			return { success: true, uid };
		} catch (err) {
			return { success: false, error: err.message };
		}
	}
	/**
	 * Listen for auth state changes
	 */
	onAuthStateChanged(callback) {
		return onAuthStateChanged(this.auth, callback);
	}
}
