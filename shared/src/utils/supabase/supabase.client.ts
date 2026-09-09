import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@workspace/shared/types/supabase";

/**
 * Creates a Supabase browser client for use in the browser.
 */
export const createSupabaseClient = () => {
	// Support both Vite (import.meta.env) and Node/Process (process.env)
	const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
	const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.");
	}

	return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};
