import { AuthService } from "@workspace/shared/services/auth.service";
/**
 * Get Current User Query
 * REFACTORED: Removed Redis caching, using direct Firebase/Firestore.
 */
export const getCurrentUser = async (_request) => {
    const authSvc = new AuthService();
    const { user, error } = await authSvc.getFullCurrentUser();
    return {
        user,
        error,
    };
};
