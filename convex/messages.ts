import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List messages in a conversation (excludes soft-deleted). Pagination can be added later.
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
      .take(100)
      .then((msgs) => msgs.filter((m) => !m.isDeleted));
  },
});
async function getCurrentUserId(ctx: MutationCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}
export const SendMessage = mutation({
  args:{conversationId:v.id("conversations"),
  content: v.string(),
  },
  handler: async(ctx,args)=>{
 const senderId = await getCurrentUserId(ctx); 
 await ctx.db.insert("messages",{
   conversationId: args.conversationId,
    senderId: senderId,
    content: args.content,
    createdAt: Date.now(),
    isDeleted: false,
 })
  }
})