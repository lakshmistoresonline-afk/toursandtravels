import { auth } from "@workspace/shared/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
/**
 * Wait for Firebase Auth to initialize and return the current user
 */
export const waitForAuth = () => {
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
/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export const mapAuthError = (code) => {
    switch (code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Invalid email or password.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        case "auth/network-request-failed":
            return "Network connection failed. Please try again.";
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/weak-password":
            return "The password is too weak.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        default:
            return "An unexpected authentication error occurred. Please try again.";
    }
};
