/**
 * app/api/email/year-summary/route.ts
 *
 * POST — triggers a year-end summary email for the authenticated user.
 * Can be called manually or via a cron job (Vercel Cron / GitHub Actions).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendYearEndSummary } from "@/lib/email";
import { trackServerEvent, Events } from "@/lib/analytics";
import type { Transaction } from "@/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const year = body.year ?? new Date().getFullYear() - 1; // Default: previous year

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: `No transactions found for ${year}` });
  }

  await sendYearEndSummary(email, year, data as Transaction[]);
  await trackServerEvent(userId, Events.SUMMARY_EMAIL_SENT, { year });

  return NextResponse.json({ success: true, count: data.length, year });
}
