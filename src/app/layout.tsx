/**
 * app/layout.tsx — Root layout
 * Wraps every page with Clerk auth + PostHog analytics providers.
 */
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";
import PostHogProvider from "@/components/providers/PostHogProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Contribution Tracker",
  description: "Track your charitable giving — receipts, records, and tax reporting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body className="min-h-screen bg-cream text-ink antialiased">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
