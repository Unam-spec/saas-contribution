/**
 * app/(app)/about/page.tsx
 */
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h1 className="font-playfair text-4xl mb-3">About</h1>
      <p className="text-[#4a4540] leading-relaxed mb-2">
        Contribution Tracker is a personal finance tool to log, monitor, and
        report charitable giving — built for clarity, discipline, and tax-ready
        records.
      </p>
      <p className="text-[#8a8480] text-sm mb-8">
        Built with Next.js · TypeScript · Supabase · Clerk · Resend · Upstash ·
        PostHog · Sentry · Vercel
      </p>

      <div className="flex justify-center gap-3 flex-wrap">
        {[
          { href: "https://github.com", label: "GitHub", Icon: Github },
          { href: "https://twitter.com", label: "Twitter / X", Icon: Twitter },
          { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
        ].map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[#d5c9b5] rounded
                       text-[#4a4540] font-mono text-sm hover:bg-[#1a1612] hover:text-[#f9f6f0]
                       hover:border-[#1a1612] transition-all"
          >
            <Icon size={15} />
            {label}
          </a>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[#d5c9b5]">
        <Link href="/dashboard" className="text-sm text-[#9a7c3a] hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
