/**
 * app/sign-in/[[...sign-in]]/page.tsx
 * Clerk's hosted sign-in UI — catches all sub-routes (/sign-in/factor-one etc.)
 */
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#1a1612] flex items-center justify-center">
      <SignIn />
    </main>
  );
}
