"use client";
/**
 * components/transactions/DeleteModal.tsx
 * Confirmation dialog before deleting a transaction.
 */
import { AlertTriangle } from "lucide-react";

interface Props {
  payee: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ payee, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white border border-[#d5c9b5] rounded shadow-xl p-7 max-w-sm w-[90%] mx-4">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} className="text-[#a33333]" />
          <h3 className="font-playfair text-lg">Confirm Delete</h3>
        </div>
        <p className="text-sm text-[#4a4540] mb-6 leading-relaxed">
          Remove the transaction for{" "}
          <span className="font-medium text-[#1a1612]">{payee}</span>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-[#d5c9b5] rounded text-[#4a4540]
                       hover:bg-[#f0ebe0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded bg-[#1a1612] text-white
                       border border-red-600 text-red-400
                       hover:bg-red-700 hover:text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
