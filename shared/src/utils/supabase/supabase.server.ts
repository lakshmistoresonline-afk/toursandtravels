import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { Database } from "@workspace/shared/types/supabase";

/**
 * Creates a Supabase server client for React Router v7 / standard Fetch API environments.
 * This helper manages cookie-based authentication.
 */
export function createSupabaseServerClient(request: Request) {
	const supabaseUrl = process.env.VITE_SUPABASE_URL;
	const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using Anon key for SSR as per standard patterns

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.");
	}

	const headers = new Headers();

	const supabase = createServerClient<Database>(
		supabaseUrl,
		supabaseKey,
		{
			cookies: {
				getAll() {
					return parseCookieHeader(request.headers.get("Cookie") ?? "");
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						headers.append(
							"Set-Cookie",
							serializeCookieHeader(name, value, options),
						),
					);
				},
			},
		},
	);

	return { supabase, headers };
}

export { createSupabaseServerClient };
