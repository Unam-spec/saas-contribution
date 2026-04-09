/**
 * app/page.tsx — Public landing / redirect
 */
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#1a1612] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="font-playfair text-4xl text-[#c4a35a] mb-3">Contribution Tracker</h1>
        <p className="text-[#8a8480] text-base mb-8 leading-relaxed">
          A private ledger for your charitable giving. Receipts by email,
          dashboard charts, and tax-ready annual summaries.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in"
            className="px-6 py-2.5 bg-[#c4a35a] text-[#1a1612] rounded font-medium hover:bg-[#d4b36a] transition-colors">
            Sign in
          </Link>
          <Link href="/sign-up"
            className="px-6 py-2.5 border border-[#4a4540] text-[#e5ddd0] rounded hover:border-[#c4a35a] transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
