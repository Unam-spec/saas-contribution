/**
 * app/(app)/transactions/page.tsx
 *
 * Server Component — loads all transactions for the logged-in user
 * then passes them to the client TransactionManager.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import TransactionManager from "@/components/transactions/TransactionManager";
import type { Transaction } from "@/types";

export default async function TransactionsPage() {
  const { userId } = await auth();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId!)
    .order("date", { ascending: false });

  if (error) {
    return (
      <div className="text-center py-20 text-[#8a8480]">
        <p>Failed to load transactions: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 border-b border-[#d5c9b5] pb-3 mb-6">
        <h1 className="text-3xl font-playfair">Transactions</h1>
        <span className="font-mono text-xs text-[#8a8480] tracking-widest uppercase">Ledger</span>
      </div>
      <TransactionManager initialTransactions={(data ?? []) as Transaction[]} />
    </div>
  );
}
