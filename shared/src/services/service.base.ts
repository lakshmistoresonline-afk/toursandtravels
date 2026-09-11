import { auth, db, storage } from "@workspace/shared/lib/firebase";

export interface ServiceBase {
	auth: typeof auth;
	db: typeof db;
	storage: typeof storage;
}

/**
 * Base Service Class for Firebase
 */
export class Service implements ServiceBase {
	public auth = auth;
	public db = db;
	public storage = storage;

	protected readonly USERS_COLLECTION = "users";
	protected readonly TOURS_COLLECTION = "tours";
	protected readonly REGISTRATIONS_COLLECTION = "registrations";

	constructor(_request?: Request) {}

	protected async createSubService<T extends new (request?: Request) => any>(
		ServiceClass: T,
	): Promise<InstanceType<T>> {
		return new ServiceClass() as InstanceType<T>;
	}

	protected get currentUid(): string | null {
		return this.auth.currentUser?.uid || null;
	}
}
