import type { AuthConfig } from "convex/server";

/**
 * Convex auth config for Clerk. The domain must match the issuer in your
 * Clerk JWT template (Dashboard → JWT Templates → Convex).
 * Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard → Settings → Environment Variables.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
