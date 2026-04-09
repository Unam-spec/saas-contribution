/**
 * lib/email.ts
 *
 * Resend integration — sends:
 *  1. Receipt email on every new transaction
 *  2. Year-end tax summary (triggered in January or on demand)
 */
import { Resend } from "resend";
import { formatMoney } from "./money";
import type { Transaction } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "receipts@contributiontracker.app";

// ─── Receipt email ────────────────────────────────────────────────────────────

export async function sendTransactionReceipt(
  toEmail: string,
  transaction: Transaction
) {
  const amount = formatMoney(transaction.amount);
  const date = new Date(transaction.date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Contribution receipt — ${transaction.payee} — ${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1612;">
          <h1 style="font-size: 1.5rem; border-bottom: 1px solid #d5c9b5; padding-bottom: 1rem;">
            Contribution Receipt
          </h1>
          <table style="width: 100%; border-collapse: collapse; margin-top: 1.5rem;">
            <tr><td style="padding: 0.5rem 0; color: #8a8480; width: 40%;">Date</td>
                <td style="padding: 0.5rem 0;">${date}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #8a8480;">Payee</td>
                <td style="padding: 0.5rem 0;">${transaction.payee}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #8a8480;">Amount</td>
                <td style="padding: 0.5rem 0; font-size: 1.2rem;">${amount}</td></tr>
            ${transaction.memo ? `<tr><td style="padding: 0.5rem 0; color: #8a8480;">Memo</td>
                <td style="padding: 0.5rem 0;">${transaction.memo}</td></tr>` : ""}
          </table>
          <p style="margin-top: 2rem; font-size: 0.85rem; color: #8a8480;">
            This receipt has been saved to your Contribution Tracker account.
          </p>
        </body>
      </html>
    `,
  });
}

// ─── Year-end tax summary ─────────────────────────────────────────────────────

export async function sendYearEndSummary(
  toEmail: string,
  year: number,
  transactions: Transaction[]
) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const rows = transactions
    .map(
      (t) =>
        `<tr>
          <td style="padding:4px 8px;border-bottom:1px solid #e5ddd0">${t.date}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #e5ddd0">${t.payee}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #e5ddd0;text-align:right">${formatMoney(t.amount)}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Your ${year} Contribution Summary — ${formatMoney(total)} total`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:2rem;color:#1a1612">
          <h1 style="font-size:1.5rem">${year} Contribution Summary</h1>
          <p style="font-size:1.1rem">Total contributed: <strong>${formatMoney(total)}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin-top:1.5rem">
            <thead>
              <tr style="background:#f0ebe0">
                <th style="padding:8px;text-align:left">Date</th>
                <th style="padding:8px;text-align:left">Payee</th>
                <th style="padding:8px;text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr style="background:#f0ebe0;font-weight:bold">
                <td style="padding:8px" colspan="2">Total</td>
                <td style="padding:8px;text-align:right">${formatMoney(total)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top:1.5rem;font-size:0.8rem;color:#8a8480">
            Keep this email for tax reporting purposes. Section 18A donations to approved NPOs may be tax-deductible.
          </p>
        </body>
      </html>
    `,
  });
}
