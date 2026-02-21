import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List conversations for a user (placeholder). Full implementation will
 * filter by membership and join with last message.
 */
export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_member", (q) => q.eq("members", args.userId))
      .collect();
  },
});
