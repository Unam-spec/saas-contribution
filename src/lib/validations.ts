/**
 * lib/validations.ts
 *
 * Zod schemas — used on both the client (form validation feedback)
 * and on the server (API route / Server Action validation).
 * Single source of truth for business rules.
 */
import { z } from "zod";
import { isValidMoneyString } from "./money";

export const transactionSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((d) => {
      const parsed = new Date(d);
      return !isNaN(parsed.getTime());
    }, "Please enter a valid date"),

  payee: z
    .string()
    .min(1, "Payee name is required")
    .max(200, "Payee name is too long")
    .transform((s) => s.trim()),

  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(isValidMoneyString, "Amount must be a positive number (e.g. 150.00)"),

  memo: z
    .string()
    .max(500, "Memo is too long")
    .optional()
    .transform((s) => s?.trim() || null),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
