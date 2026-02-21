import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

/**
 * Landing page: redirects signed-in users to dashboard, others see sign-in CTA.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <SignedOut>
        <h1 className="text-2xl font-semibold mb-4">Welcome to Chat</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Sign in to start chatting in real time.
        </p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <h1 className="text-2xl font-semibold mb-4">You&apos;re in</h1>
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Go to Dashboard
        </Link>
      </SignedIn>
    </main>
  );
}
