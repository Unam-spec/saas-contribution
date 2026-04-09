/**
 * lib/supabase/server.ts  — Server-side Supabase client
 *
 * Used in Server Components, Server Actions, and API Routes.
 * Reads cookies to reconstruct the session, then appends the Clerk JWT
 * so Supabase RLS policies can verify `auth.uid()`.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { getToken } = await auth();

  // Fetch the Supabase-compatible JWT from Clerk
  // You must create a "supabase" JWT template in your Clerk dashboard
  const supabaseToken = await getToken({ template: "supabase" });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies — safe to ignore
          }
        },
      },
      global: {
        headers: supabaseToken
          ? { Authorization: `Bearer ${supabaseToken}` }
          : {},
      },
    }
  );
}

/**
 * Admin client — bypasses RLS. Only use in trusted server contexts
 * (e.g. sending year-end email summaries, admin operations).
 * NEVER expose to the browser.
 */
export function createAdminSupabaseClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
