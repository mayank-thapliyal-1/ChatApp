import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get current user by Clerk id (for use after auth).
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
// For Checking user is active or not 
export const setOnlineStatus = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
   console.log("Setting online status for", identity.subject);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    await ctx.db.patch(user._id, {
      lastSeen: Date.now(),
    });
  },
});
/**
 * List other users for search / new chat. Excludes the given user; optional
 * search filters by name or email (case-insensitive).
 */
export const listOthers = query({
  args: {
    excludeUserId: v.id("users"),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("users").collect();
    list = list.filter((u) => u._id !== args.excludeUserId);
    if (args.search?.trim()) {
      const term = args.search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }
    return list;
  },
});

/**
 * Upsert user from Clerk webhook or client (name, email, image from Clerk).
 */
export const upsert = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        image: args.image,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      image: args.image,
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});
