"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { SyncUser } from "@/components/SyncUser";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

/**
 * Wraps the app with Convex + Clerk so Convex queries/mutations receive
 * the authenticated user identity from Clerk JWTs.
 * SyncUser ensures the Clerk user is upserted into Convex when signed in.
 */
export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <SyncUser />
      {children}
    </ConvexProviderWithClerk>
  );
}
