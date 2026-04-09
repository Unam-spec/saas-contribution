"use client";
/**
 * components/transactions/TransactionForm.tsx
 *
 * Controlled form with client-side Zod validation.
 * Doubles as both Add and Modify — behaviour switches based on editTarget prop.
 */
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionInput } from "@/lib/validations";
import { centsToInputString } from "@/lib/money";
import type { Transaction } from "@/types";
import { AlertCircle } from "lucide-react";

interface Props {
  editTarget: Transaction | null;
  onSubmit: (fd: FormData) => void;
  onClear: () => void;
  error: string | null;
  isPending: boolean;
}

export default function TransactionForm({ editTarget, onSubmit, onClear, error, isPending }: Props) {
  const isEditing = editTarget !== null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { date: "", payee: "", amount: "", memo: "" },
  });

  // Populate form when entering edit mode
  useEffect(() => {
    if (editTarget) {
      setValue("date",   editTarget.date);
      setValue("payee",  editTarget.payee);
      setValue("amount", centsToInputString(editTarget.amount));
      setValue("memo",   editTarget.memo ?? "");
    } else {
      reset();
    }
  }, [editTarget, setValue, reset]);

  const handleClear = () => {
    reset();
    onClear();
  };

  const handleFormSubmit = (data: TransactionInput) => {
    const fd = new FormData();
    fd.append("date",   data.date);
    fd.append("payee",  data.payee);
    fd.append("amount", data.amount);
    fd.append("memo",   data.memo ?? "");
    onSubmit(fd);
    if (!isEditing) reset();
  };

  return (
    <div className="bg-white border border-[#d5c9b5] rounded shadow-sm p-5">
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#8a8480] mb-4">
        {isEditing ? "Editing Entry" : "New Entry"}
      </p>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        {/* Date */}
        <div className="mb-4">
          <label className="block text-[0.72rem] font-mono uppercase tracking-wide text-[#8a8480] mb-1">
            Date
          </label>
          <input
            type="date"
            {...register("date")}
            className="w-full px-3 py-2 border border-[#d5c9b5] rounded bg-[#f9f6f0] text-[#1a1612]
                       focus:outline-none focus:border-[#9a7c3a] focus:bg-white transition-colors text-sm"
          />
          {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
        </div>

        {/* Payee */}
        <div className="mb-4">
          <label className="block text-[0.72rem] font-mono uppercase tracking-wide text-[#8a8480] mb-1">
            Payee
          </label>
          <input
            type="text"
            placeholder="Organisation name"
            {...register("payee")}
            className="w-full px-3 py-2 border border-[#d5c9b5] rounded bg-[#f9f6f0] text-[#1a1612]
                       focus:outline-none focus:border-[#9a7c3a] focus:bg-white transition-colors text-sm"
          />
          {errors.payee && <p className="text-red-600 text-xs mt-1">{errors.payee.message}</p>}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-[0.72rem] font-mono uppercase tracking-wide text-[#8a8480] mb-1">
            Amount (R)
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            {...register("amount")}
            className="w-full px-3 py-2 border border-[#d5c9b5] rounded bg-[#f9f6f0] text-[#1a1612]
                       focus:outline-none focus:border-[#9a7c3a] focus:bg-white transition-colors text-sm font-mono"
          />
          {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Memo */}
        <div className="mb-4">
          <label className="block text-[0.72rem] font-mono uppercase tracking-wide text-[#8a8480] mb-1">
            Memo
          </label>
          <textarea
            rows={3}
            placeholder="Optional note"
            {...register("memo")}
            className="w-full px-3 py-2 border border-[#d5c9b5] rounded bg-[#f9f6f0] text-[#1a1612]
                       focus:outline-none focus:border-[#9a7c3a] focus:bg-white transition-colors text-sm resize-y"
          />
          {errors.memo && <p className="text-red-600 text-xs mt-1">{errors.memo.message}</p>}
        </div>

        {/* Server-level error */}
        {error && (
          <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded border border-[#d5c9b5] text-[#4a4540] text-sm
                       hover:bg-[#f0ebe0] transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded bg-[#1a1612] text-[#f9f6f0] text-sm font-medium
                       hover:bg-[#2e2820] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : isEditing ? "Modify" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
