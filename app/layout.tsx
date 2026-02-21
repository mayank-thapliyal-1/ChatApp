import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat App",
  description: "Real-time chat application",
};

// Avoid prerender when Clerk/Convex env vars are not set (e.g. CI or fresh clone)
export const dynamic = "force-dynamic";

/**
 * Root layout: wraps the app with Clerk (auth) and Convex (realtime backend).
 * ConvexClientProvider uses ConvexProviderWithClerk for unified auth + DB.
 * When env vars are missing (e.g. fresh clone), we render a minimal shell so build succeeds.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const hasConvexUrl = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  if (!hasClerkKey || !hasConvexUrl) {
    return (
      <html lang="en">
        <body className="antialiased min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
          <p className="text-gray-600 text-center">
            Copy <code className="bg-gray-200 px-1 rounded">.env.example</code> to{" "}
            <code className="bg-gray-200 px-1 rounded">.env.local</code> and set
            Clerk and Convex variables. Then restart the dev server.
          </p>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <html lang="en">
          <body className="antialiased min-h-screen bg-gray-50 text-gray-900">
            {children}
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
