/**
 * lib/analytics.ts
 *
 * PostHog event tracking. Call these functions from Server Actions and
 * client components to record meaningful user behaviour.
 *
 * PostHog is also initialised on the client via the Provider in layout.tsx.
 */
import { PostHog } from "posthog-node";

// Server-side PostHog client (for Server Actions / API routes)
const serverPostHog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
  flushAt: 1,   // Send immediately in serverless contexts
  flushInterval: 0,
});

// ─── Event catalogue ──────────────────────────────────────────────────────────
// Centralising event names prevents typo-driven data fragmentation.

export const Events = {
  TRANSACTION_ADDED:   "transaction_added",
  TRANSACTION_UPDATED: "transaction_updated",
  TRANSACTION_DELETED: "transaction_deleted",
  DASHBOARD_VIEWED:    "dashboard_viewed",
  PDF_EXPORTED:        "pdf_exported",
  SUMMARY_EMAIL_SENT:  "summary_email_sent",
} as const;

export async function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  serverPostHog.capture({ distinctId: userId, event, properties });
  await serverPostHog.shutdown();
}
