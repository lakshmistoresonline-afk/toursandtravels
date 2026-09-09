import { redis } from "@workspace/shared/utils/redis";

type Fetcher<T> = () => Promise<T>;

/**
 * @description Service for manipulating data in Redis.
 * REFACTORED: Now a no-op service to remove Redis dependency for free tier.
 */
export class cacheService {
	/**
	 * Bypasses Redis and always fetches fresh data from DB.
	 */
	static async get<T>(key: string, fetcher: Fetcher<T>, ttl: number = 7200): Promise<T> {
		console.log("ℹ️ Cache bypassed (Redis disabled) for KEY: ", key);
		// Always fetch fresh data from the DB
		return await fetcher();
	}

	/**
	 * No-op: Invalidation is not needed when caching is disabled.
	 */
	static async invalidate(key: string, retries = 3, delay = 500): Promise<void> {
		console.log("ℹ️ Cache invalidation skipped (Redis disabled) for KEY: ", key);
	}

	/**
	 * No-op: Invalidation is not needed when caching is disabled.
	 */
	static async invalidatePattern(pattern: string, retries = 3, delay = 500): Promise<void> {
		console.log("ℹ️ Cache pattern invalidation skipped (Redis disabled) for PATTERN: ", pattern);
	}
}

// Helper for delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
