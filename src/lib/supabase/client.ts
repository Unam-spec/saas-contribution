/**
 * lib/supabase/client.ts  — Browser-side Supabase client
 *
 * Used in React Client Components. Reads the Clerk JWT from the browser
 * session and injects it into every Supabase request so Row-Level Security
 * can verify the user's identity.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
