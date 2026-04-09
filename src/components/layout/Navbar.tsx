"use client";
/**
 * components/layout/Navbar.tsx
 * Sticky top nav with hamburger menu and Clerk UserButton.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X, BarChart2, List } from "lucide-react";

const navLinks = [
  { href: "/dashboard",     label: "Dashboard",    icon: BarChart2 },
  { href: "/transactions",  label: "Transactions", icon: List },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#1a1612] text-[#f9f6f0] h-14 flex items-center justify-between px-5">
        <span className="font-playfair text-xl tracking-wide text-[#c4a35a]">
          Contribution Tracker
        </span>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col gap-1.5 p-1.5 rounded hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-56 bg-[#1a1612] flex flex-col pt-4">
            <button
              onClick={() => setOpen(false)}
              className="self-end mr-4 mb-4 text-[#e5ddd0] hover:text-white"
            >
              <X size={22} />
            </button>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 font-playfair text-base border-b border-white/10 transition-all
                  ${pathname.startsWith(href)
                    ? "text-[#c4a35a] pl-8"
                    : "text-[#e5ddd0] hover:text-[#c4a35a] hover:pl-8"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
