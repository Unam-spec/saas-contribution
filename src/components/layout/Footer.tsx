/**
 * components/layout/Footer.tsx
 */
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1612] text-[#8a8480] text-center py-3 text-sm mt-auto">
      <Link href="/about" className="text-[#c4a35a] hover:underline">
        About
      </Link>
      {" · "}Contribution Tracker{" · "}Records are encrypted and private
    </footer>
  );
}
