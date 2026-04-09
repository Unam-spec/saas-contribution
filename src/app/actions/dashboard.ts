/**
 * app/actions/dashboard.ts
 *
 * Fetches and caches aggregated dashboard statistics.
 * First checks Redis; on cache miss, runs SQL aggregation in Supabase.
 */
"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCachedDashboardStats,
  setCachedDashboardStats,
} from "@/lib/redis";
import { trackServerEvent, Events } from "@/lib/analytics";
import type {
  ApiResponse,
  DashboardStats,
  MonthlyTotal,
  YearlyTotal,
  YearOverYearChange,
  MonthlyAverage,
} from "@/types";

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  // ── 1. Cache hit? ──────────────────────────────────────────────────────────
  const cached = await getCachedDashboardStats(userId);
  if (cached) return { success: true, data: cached as DashboardStats };

  // ── 2. Fetch raw transactions ──────────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("date, amount")
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };

  // ── 3. Aggregate in JavaScript (avoids complex SQL, easy to unit test) ─────
  const monthlyMap = new Map<string, number>();
  const yearlyMap  = new Map<number, number>();
  const avgMap     = new Map<string, number[]>();

  for (const tx of transactions ?? []) {
    const d = new Date(tx.date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1; // 1-based
    const monthKey = `${y}-${m}`;

    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + tx.amount);
    yearlyMap.set(y, (yearlyMap.get(y) ?? 0) + tx.amount);

    if (!avgMap.has(monthKey)) avgMap.set(monthKey, []);
    avgMap.get(monthKey)!.push(tx.amount);
  }

  // Monthly totals
  const monthlyTotals: MonthlyTotal[] = Array.from(monthlyMap.entries()).map(([key, total]) => {
    const [year, month] = key.split("-").map(Number);
    return { year, month, total_cents: total };
  });

  // Yearly totals
  const yearlyTotals: YearlyTotal[] = Array.from(yearlyMap.entries())
    .map(([year, total]) => ({ year, total_cents: total }))
    .sort((a, b) => a.year - b.year);

  // Year-over-year changes
  const yoyChanges: YearOverYearChange[] = yearlyTotals.map((current, i) => {
    const prev = yearlyTotals[i - 1];
    const change_percent =
      prev && prev.total_cents > 0
        ? Math.round(((current.total_cents - prev.total_cents) / prev.total_cents) * 100 * 10) / 10
        : null;
    return {
      year: current.year,
      total_cents: current.total_cents,
      previous_cents: prev?.total_cents ?? 0,
      change_percent,
    };
  });

  // Monthly averages
  const monthlyAverages: MonthlyAverage[] = Array.from(avgMap.entries()).map(([key, amounts]) => {
    const [year, month] = key.split("-").map(Number);
    const sum = amounts.reduce((a, b) => a + b, 0);
    return { year, month, avg_cents: Math.round(sum / amounts.length), count: amounts.length };
  });

  const stats: DashboardStats = { monthlyTotals, yearlyTotals, yoyChanges, monthlyAverages };

  // ── 4. Cache + track ───────────────────────────────────────────────────────
  await setCachedDashboardStats(userId, stats);
  await trackServerEvent(userId, Events.DASHBOARD_VIEWED);

  return { success: true, data: stats };
}
