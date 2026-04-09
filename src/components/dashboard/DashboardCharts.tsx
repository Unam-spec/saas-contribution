"use client";
/**
 * components/dashboard/DashboardCharts.tsx
 *
 * Client component — renders Chart.js charts from server-fetched stats.
 * Chart.js must be registered once; we do it here.
 */
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { formatMoney } from "@/lib/money";
import type { DashboardStats } from "@/types";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GOLD   = "#9a7c3a";
const GOLD2  = "#c4a35a";
const CREAM2 = "#f0ebe0";

interface Props { stats: DashboardStats; currentYear: number; }

export default function DashboardCharts({ stats, currentYear }: Props) {
  // ── Monthly totals for current year ────────────────────────────────────────
  const monthlyData = MONTHS.map((_, i) => {
    const found = stats.monthlyTotals.find(
      (m) => m.year === currentYear && m.month === i + 1
    );
    return found ? found.total_cents / 100 : 0;
  });

  // ── Yearly totals ───────────────────────────────────────────────────────────
  const yearLabels  = stats.yearlyTotals.map((y) => String(y.year));
  const yearData    = stats.yearlyTotals.map((y) => y.total_cents / 100);

  // ── YoY change ─────────────────────────────────────────────────────────────
  const yoyLabels = stats.yoyChanges.slice(1).map((y) => String(y.year));
  const yoyData   = stats.yoyChanges.slice(1).map((y) => y.change_percent ?? 0);

  // ── Monthly average (all years) ────────────────────────────────────────────
  const avgLabels = stats.monthlyAverages.map((m) => `${MONTHS[m.month - 1]} ${m.year}`);
  const avgData   = stats.monthlyAverages.map((m) => m.avg_cents / 100);

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { color: CREAM2 },
        ticks: {
          callback: (v: number | string) =>
            "R " + Number(v).toLocaleString("en-ZA"),
        },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1 — Monthly totals */}
      <ChartCard title={`Contributions by Month · ${currentYear}`}>
        <Bar
          data={{
            labels: MONTHS,
            datasets: [{ data: monthlyData, backgroundColor: GOLD2 + "cc", borderColor: GOLD, borderWidth: 1, borderRadius: 2 }],
          }}
          options={baseOpts as never}
        />
      </ChartCard>

      {/* 2 — Yearly totals */}
      <ChartCard title="Total by Year">
        <Bar
          data={{
            labels: yearLabels,
            datasets: [{ data: yearData, backgroundColor: GOLD + "bb", borderColor: GOLD, borderWidth: 1, borderRadius: 2 }],
          }}
          options={baseOpts as never}
        />
      </ChartCard>

      {/* 3 — YoY change */}
      <ChartCard title="Year-over-Year Change">
        <Bar
          data={{
            labels: yoyLabels,
            datasets: [{
              data: yoyData,
              backgroundColor: yoyData.map((v) => v >= 0 ? GOLD2 + "cc" : "#a33333aa"),
              borderColor: yoyData.map((v) => v >= 0 ? GOLD : "#a33333"),
              borderWidth: 1,
              borderRadius: 2,
            }],
          }}
          options={{
            ...baseOpts,
            scales: {
              y: {
                grid: { color: CREAM2 },
                ticks: { callback: (v: number | string) => `${v}%` },
              },
              x: { grid: { display: false } },
            },
          } as never}
        />
      </ChartCard>

      {/* 4 — Monthly average */}
      <ChartCard title="Average Contribution by Month">
        <Line
          data={{
            labels: avgLabels,
            datasets: [{
              data: avgData,
              borderColor: GOLD,
              backgroundColor: GOLD + "22",
              fill: true,
              pointBackgroundColor: GOLD,
              pointRadius: 4,
              tension: 0.35,
            }],
          }}
          options={{
            ...baseOpts,
            scales: {
              y: {
                grid: { color: CREAM2 },
                ticks: { callback: (v: number | string) => "R " + Number(v).toLocaleString("en-ZA") },
              },
              x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 10 } } },
            },
          } as never}
        />
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#d5c9b5] rounded shadow-sm p-5">
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#8a8480] mb-3">{title}</p>
      <div className="relative h-52">{children}</div>
    </div>
  );
}
