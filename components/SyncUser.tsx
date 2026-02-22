"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

/**
 * Syncs the current Clerk user to Convex users table when they are signed in.
 * Run once per session so Convex has the user for conversations/messages.
 */
export function SyncUser() {
  const { user, isLoaded } = useUser();
  const upsert = useMutation(api.users.upsert);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (syncedRef.current) return;
    syncedRef.current = true;
    upsert({
      clerkId: user.id,
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      image: user.imageUrl ?? "",
    }).catch(() => {
      syncedRef.current = false;
    });
  }, [isLoaded, user, upsert]);

  return null;
}
