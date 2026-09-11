/**
 * Server-side Auth Utils
 * REFACTORED: Removed Supabase session logic.
 */
export function extractAuthId(_request: Request): string | null {
	// Firebase sessions are typically managed client-side in SPA mode.
	return null;
}

export function genAuthSecurity(_request: Request) {
	return { authId: "user", headers: new Headers() };
}
