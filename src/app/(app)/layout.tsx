/**
 * app/(app)/layout.tsx
 * Shell for all authenticated pages — adds Navbar + Footer.
 */
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
