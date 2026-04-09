// ─── Core domain types ────────────────────────────────────────────────────────

/**
 * A single charitable contribution / transaction.
 * `amount` is always stored in CENTS (integer) to avoid floating-point errors.
 * e.g. R 150.00 → amount = 15000
 */
export interface Transaction {
  id: string;            // UUID from Supabase
  user_id: string;       // Clerk user ID, enforced by Supabase RLS
  date: string;          // ISO date string: "2025-03-15"
  payee: string;         // Charity / organisation name
  amount: number;        // INTEGER CENTS — never a float
  memo: string | null;   // Optional note
  created_at: string;    // ISO timestamp
  updated_at: string;    // ISO timestamp
}

/** What the user submits in the form — amounts come in as strings from inputs */
export interface TransactionFormValues {
  date: string;
  payee: string;
  amount: string;        // String from <input> — parsed + validated before saving
  memo?: string;
}

// ─── Dashboard / analytics types ─────────────────────────────────────────────

export interface MonthlyTotal {
  month: number;         // 1–12
  year: number;
  total_cents: number;
}

export interface YearlyTotal {
  year: number;
  total_cents: number;
}

export interface YearOverYearChange {
  year: number;
  total_cents: number;
  previous_cents: number;
  change_percent: number | null;  // null when no previous year data
}

export interface MonthlyAverage {
  month: number;
  year: number;
  avg_cents: number;
  count: number;
}

export interface DashboardStats {
  monthlyTotals: MonthlyTotal[];
  yearlyTotals: YearlyTotal[];
  yoyChanges: YearOverYearChange[];
  monthlyAverages: MonthlyAverage[];
}

// ─── API response wrappers ────────────────────────────────────────────────────

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError    = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Money utilities (re-exported from lib/money.ts) ──────────────────────────

/** Converts a cent integer to a display string: 15000 → "R 150.00" */
export type FormatMoney = (cents: number) => string;
