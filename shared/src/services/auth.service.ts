import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	onAuthStateChanged,
	User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Service } from "@workspace/shared/services/service.base";
import { ApiError } from "@workspace/shared/utils/ApiError";
import type { AppUser } from "@workspace/shared/types/user.d";
import { SignupFormData } from "@workspace/shared/schemas/signup.schema";
import { ProfileUpdateForm } from "@workspace/shared/schemas/profile-update.schema";

export class AuthService extends Service {
	/**
	 * Get full profile for current user
	 */
	async getFullCurrentUser(): Promise<{ user: AppUser | null; error: ApiError | null }> {
		const firebaseUser = this.auth.currentUser;
		if (!firebaseUser) return { user: null, error: new ApiError("Not authenticated", 401) };

		try {
			const userDoc = await getDoc(doc(this.db, this.USERS_COLLECTION, firebaseUser.uid));
			if (!userDoc.exists()) {
				return { user: null, error: new ApiError("User profile not found", 404) };
			}
			return { user: userDoc.data() as AppUser, error: null };
		} catch (err: any) {
			return { user: null, error: new ApiError(err.message, 500) };
		}
	}

	/**
	 * Login with Email and Password
	 */
	async loginWithPassword({ email, password }: { email: string; password: string }) {
		try {
			const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
			const { user: profile } = await this.getFullCurrentUser();
			return { user: userCredential.user, profile, error: null };
		} catch (err: any) {
			return { user: null, profile: null, error: new ApiError(err.message, 401) };
		}
	}

	/**
	 * Register a new user
	 */
	async signUpWithPasswordAndProfile(data: Omit<SignupFormData, "confirmPassword">) {
		try {
			const userCredential = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
			const uid = userCredential.user.uid;

			const profile: AppUser = {
				uid,
				email: data.email,
				role: "user", // Default role
				status: "active",
				first_name: data.firstName,
				last_name: data.lastName,
				phone_number: data.phone ?? null,
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
				avatar_url: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			await setDoc(doc(this.db, this.USERS_COLLECTION, uid), {
				...profile,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});

			return { success: true, user: userCredential.user, profile };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}

	/**
	 * Update Profile
	 */
	async updateUserProfile(data: ProfileUpdateForm & { uid: string }) {
		try {
			const userRef = doc(this.db, this.USERS_COLLECTION, data.uid);
			await updateDoc(userRef, {
				...data,
				updatedAt: serverTimestamp()
			});
			return { success: true };
		} catch (err: any) {
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
	async sendResetPasswordRequest(email: string) {
		try {
			await sendPasswordResetEmail(this.auth, email);
			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}

	/**
	 * Listen for auth state changes
	 */
	onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
		return onAuthStateChanged(this.auth, callback);
	}
}
