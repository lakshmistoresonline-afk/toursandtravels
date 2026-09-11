import { auth, db, storage } from "@workspace/shared/lib/firebase";
/**
 * Base Service Class for Firebase
 */
export class Service {
    auth = auth;
    db = db;
    storage = storage;
    USERS_COLLECTION = "users";
    TOURS_COLLECTION = "tours";
    REGISTRATIONS_COLLECTION = "registrations";
    constructor(_request) { }
    async createSubService(ServiceClass) {
        return new ServiceClass();
    }
    get currentUid() {
        return this.auth.currentUser?.uid || null;
    }
}
