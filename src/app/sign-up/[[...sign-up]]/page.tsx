/**
 * app/sign-up/[[...sign-up]]/page.tsx
 */
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#1a1612] flex items-center justify-center">
      <SignUp />
    </main>
  );
}
