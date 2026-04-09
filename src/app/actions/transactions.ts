/**
 * app/actions/transactions.ts
 *
 * Next.js Server Actions — these run on the server, authenticated via Clerk.
 * They replace a traditional REST API for mutations.
 *
 * Flow for every mutation:
 *  1. Verify Clerk session
 *  2. Rate-limit check via Upstash
 *  3. Validate input with Zod
 *  4. Write to Supabase (RLS enforces user_id)
 *  5. Invalidate Redis dashboard cache
 *  6. (Optional) Send Resend receipt email
 *  7. Track PostHog event
 */
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { transactionRateLimit, invalidateDashboardCache } from "@/lib/redis";
import { sendTransactionReceipt } from "@/lib/email";
import { trackServerEvent, Events } from "@/lib/analytics";
import { transactionSchema } from "@/lib/validations";
import { parseMoney } from "@/lib/money";
import type { ApiResponse, Transaction } from "@/types";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTransaction(
  formData: FormData,
): Promise<ApiResponse<Transaction>> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Rate limit check
  const { success: allowed } = await transactionRateLimit.limit(userId);
  if (!allowed)
    return { success: false, error: "Too many requests. Please slow down." };

  // Validate
  const raw = {
    date: formData.get("date") as string,
    payee: formData.get("payee") as string,
    amount: formData.get("amount") as string,
    memo: formData.get("memo") as string,
  };
  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: messages };
  }

  const { date, payee, amount: amountStr, memo } = parsed.data;
  const amountCents = parseMoney(amountStr)!;

  // Insert into Supabase
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .insert({ user_id: userId, date, payee, amount: amountCents, memo })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Side effects (non-blocking — failures don't break the main flow)
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (email) await sendTransactionReceipt(email, data as Transaction);
  } catch {
    /* email failure is non-critical */
  }

  await invalidateDashboardCache(userId);
  await trackServerEvent(userId, Events.TRANSACTION_ADDED, {
    amount_cents: amountCents,
    payee,
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true, data: data as Transaction };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateTransaction(
  id: string,
  formData: FormData,
): Promise<ApiResponse<Transaction>> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const raw = {
    date: formData.get("date") as string,
    payee: formData.get("payee") as string,
    amount: formData.get("amount") as string,
    memo: formData.get("memo") as string,
  };
  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: messages };
  }

  const { date, payee, amount: amountStr, memo } = parsed.data;
  const amountCents = parseMoney(amountStr)!;

  const supabase = await createServerSupabaseClient();
  // RLS ensures only the owner can update (user_id = auth.uid())
  const { data, error } = await supabase
    .from("transactions")
    .update({
      date,
      payee,
      amount: amountCents,
      memo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await invalidateDashboardCache(userId);
  await trackServerEvent(userId, Events.TRANSACTION_UPDATED, { id });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true, data: data as Transaction };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTransaction(
  id: string,
): Promise<ApiResponse<null>> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };

  await invalidateDashboardCache(userId);
  await trackServerEvent(userId, Events.TRANSACTION_DELETED, { id });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true, data: null };
}

// ─── Fetch all for PDF export ─────────────────────────────────────────────────

export async function fetchAllTransactions(): Promise<
  ApiResponse<Transaction[]>
> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Transaction[] };
}
