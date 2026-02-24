// convex/mutations.ts
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, { conversationId, userId, isTyping }) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isTyping });
    } else {
      await ctx.db.insert("typing", { conversationId, userId, isTyping });
    }
  },
});
// convex/queries.ts

export const getTypingUsers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const usersTyping = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) => q.eq(q.field("isTyping"), true))
      .collect();

    // Fetch names
    return await Promise.all(
      usersTyping.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, user };
      })
    );
  },
});