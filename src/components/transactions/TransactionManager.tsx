"use client";
/**
 * components/transactions/TransactionManager.tsx
 *
 * Orchestrates the form + ledger table. Manages optimistic UI state
 * so the user sees changes instantly without waiting for server round-trips.
 */
import { useState, useTransition, useCallback } from "react";
import TransactionForm from "./TransactionForm";
import TransactionLedger from "./TransactionLedger";
import DeleteModal from "./DeleteModal";
import { createTransaction, updateTransaction, deleteTransaction } from "@/app/actions/transactions";
import { parseMoney } from "@/lib/money";
import type { Transaction } from "@/types";

interface Props { initialTransactions: Transaction[] }

export default function TransactionManager({ initialTransactions }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleAdd = useCallback((fd: FormData) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createTransaction(fd);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setTransactions((prev) => [result.data, ...prev]);
    });
  }, []);

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleUpdate = useCallback((fd: FormData) => {
    if (!editTarget) return;
    setFormError(null);
    startTransition(async () => {
      const result = await updateTransaction(editTarget.id, fd);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setTransactions((prev) =>
        prev.map((t) => (t.id === result.data.id ? result.data : t))
      );
      setEditTarget(null);
    });
  }, [editTarget]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    });
  }, [deleteTarget]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      {/* Left: Form */}
      <div>
        <TransactionForm
          editTarget={editTarget}
          onSubmit={editTarget ? handleUpdate : handleAdd}
          onClear={() => { setEditTarget(null); setFormError(null); }}
          error={formError}
          isPending={isPending}
        />
      </div>

      {/* Right: Ledger */}
      <div>
        <TransactionLedger
          transactions={transactions}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
          isPending={isPending}
        />
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          payee={deleteTarget.payee}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
