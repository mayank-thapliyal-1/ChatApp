import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List messages in a conversation (placeholder). Full implementation will
 * paginate and filter isDeleted.
 */
export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .take(100);
  },
});
