/**
 * app/(app)/dashboard/page.tsx
 *
 * Server Component — fetches stats server-side (with Redis cache),
 * then passes data to client chart components.
 */
import { getDashboardStats } from "@/app/actions/dashboard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { BarChart2 } from "lucide-react";

export default async function DashboardPage() {
  const result = await getDashboardStats();

  if (!result.success) {
    return (
      <div className="text-center py-20 text-[#8a8480]">
        <p className="text-lg">Could not load dashboard: {result.error}</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="flex items-baseline gap-3 border-b border-[#d5c9b5] pb-3 mb-6">
        <h1 className="text-3xl font-playfair">Dashboard</h1>
        <span className="font-mono text-xs text-[#8a8480] tracking-widest uppercase">
          Overview · {currentYear}
        </span>
      </div>

      {result.data.yearlyTotals.length === 0 ? (
        <div className="text-center py-24 text-[#8a8480]">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-playfair">No data yet</p>
          <p className="text-sm mt-1">Add your first transaction to see charts here.</p>
        </div>
      ) : (
        <DashboardCharts stats={result.data} currentYear={currentYear} />
      )}
    </div>
  );
}
