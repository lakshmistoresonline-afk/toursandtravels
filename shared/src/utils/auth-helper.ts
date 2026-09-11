import { auth } from "@workspace/shared/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

/**
 * Wait for Firebase Auth to initialize and return the current user
 */
export const waitForAuth = (): Promise<FirebaseUser | null> => {
	return new Promise((resolve) => {
		// If already initialized, resolve immediately
		if (auth.currentUser) {
			resolve(auth.currentUser);
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			unsubscribe();
			resolve(user);
		});

		// Timeout as fallback to prevent hanging loaders
		setTimeout(() => {
			unsubscribe();
			resolve(auth.currentUser);
		}, 2000);
	});
};
