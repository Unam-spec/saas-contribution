"use client";
/**
 * components/transactions/TransactionLedger.tsx
 *
 * Sortable table of all transactions with:
 * - Alternating row colours
 * - Click-to-sort on all columns
 * - Running total / average summary bar
 * - PDF export via window.print() on a dedicated print stylesheet
 */
import { useState, useMemo } from "react";
import { formatMoney, sumCents, avgCents } from "@/lib/money";
import { fetchAllTransactions } from "@/app/actions/transactions";
import type { Transaction } from "@/types";
import { ArrowUp, ArrowDown, ArrowUpDown, Pencil, Trash2, FileText } from "lucide-react";

type SortCol = "date" | "payee" | "amount" | "memo";
type SortDir = "asc" | "desc";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  isPending: boolean;
}

export default function TransactionLedger({ transactions, onEdit, onDelete, isPending }: Props) {
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let av: string | number = a[sortCol] ?? "";
      let bv: string | number = b[sortCol] ?? "";
      if (sortCol === "amount") {
        return sortDir === "asc" ? (a.amount - b.amount) : (b.amount - a.amount);
      }
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [transactions, sortCol, sortDir]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ArrowUpDown size={12} className="inline ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp size={12} className="inline ml-1 text-[#9a7c3a]" />
      : <ArrowDown size={12} className="inline ml-1 text-[#9a7c3a]" />;
  };

  const handleExportPDF = async () => {
    const result = await fetchAllTransactions();
    if (!result.success) return alert("Export failed: " + result.error);

    const total = sumCents(result.data.map((t) => t.amount));
    const rows = result.data
      .map((t) => `<tr><td>${t.date}</td><td>${t.payee}</td><td style="text-align:right">${formatMoney(t.amount)}</td><td>${t.memo ?? ""}</td></tr>`)
      .join("");

    const w = window.open("", "_blank")!;
    w.document.write(`<!DOCTYPE html><html><head><title>Contribution Ledger</title>
      <style>
        body{font-family:Georgia,serif;margin:2rem;color:#1a1612}
        h1{font-size:1.4rem;border-bottom:1px solid #ccc;padding-bottom:.5rem}
        table{width:100%;border-collapse:collapse;margin-top:1rem;font-size:.9rem}
        th,td{border:1px solid #ccc;padding:.4rem .6rem;text-align:left}
        th{background:#f0ebe0}
        tfoot td{font-weight:bold;background:#f0ebe0}
        @media print{button{display:none}}
      </style></head><body>
      <h1>Contribution Ledger</h1>
      <button onclick="window.print()" style="margin-bottom:1rem;padding:.4rem 1rem;cursor:pointer">
        Print / Save as PDF
      </button>
      <table>
        <thead><tr><th>Date</th><th>Payee</th><th>Amount</th><th>Memo</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="2">Total</td><td style="text-align:right">${formatMoney(total)}</td><td></td></tr></tfoot>
      </table>
    </body></html>`);
    w.document.close();
  };

  const totalCents = sumCents(transactions.map((t) => t.amount));
  const avgAmount  = avgCents(transactions.map((t) => t.amount));

  return (
    <div>
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: "Total", value: formatMoney(totalCents) },
          { label: "Entries", value: String(transactions.length) },
          { label: "Average", value: formatMoney(avgAmount) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#f0ebe0] border border-[#d5c9b5] rounded px-4 py-2">
            <p className="font-mono text-[0.68rem] uppercase tracking-wider text-[#8a8480]">{label}</p>
            <p className="font-playfair text-lg text-[#1a1612]">{value}</p>
          </div>
        ))}
      </div>

      {/* Export */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d5c9b5] rounded
                     text-xs font-mono text-[#4a4540] hover:bg-[#f0ebe0] transition-colors"
        >
          <FileText size={13} /> Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d5c9b5] rounded shadow-sm overflow-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-[#8a8480] italic text-sm">
            No transactions yet. Add your first contribution.
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {(["date", "payee", "amount", "memo"] as SortCol[]).map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="bg-[#f0ebe0] px-3 py-2 text-left font-mono text-[0.7rem]
                               uppercase tracking-wider text-[#4a4540] border-b border-[#d5c9b5]
                               cursor-pointer select-none hover:text-[#9a7c3a] whitespace-nowrap"
                  >
                    {col} <SortIcon col={col} />
                  </th>
                ))}
                <th className="bg-[#f0ebe0] px-3 py-2 text-right font-mono text-[0.7rem]
                               uppercase tracking-wider text-[#4a4540] border-b border-[#d5c9b5]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`transition-colors hover:!bg-[#e8d5a8] ${
                    i % 2 === 0 ? "bg-white" : "bg-[#f9f6f0]"
                  } ${isPending ? "opacity-60" : ""}`}
                >
                  <td className="px-3 py-2 border-b border-[#ede7d8] font-mono text-xs whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="px-3 py-2 border-b border-[#ede7d8]">{tx.payee}</td>
                  <td className="px-3 py-2 border-b border-[#ede7d8] font-mono text-right whitespace-nowrap">
                    {formatMoney(tx.amount)}
                  </td>
                  <td className="px-3 py-2 border-b border-[#ede7d8] text-[#8a8480] text-xs">
                    {tx.memo ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-[#ede7d8]">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(tx)}
                        className="px-2 py-1 text-xs border border-[#d5c9b5] rounded
                                   hover:bg-[#f0ebe0] transition-colors flex items-center gap-1"
                      >
                        <Pencil size={11} /> Modify
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="px-2 py-1 text-xs border border-red-200 rounded text-red-600
                                   hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
