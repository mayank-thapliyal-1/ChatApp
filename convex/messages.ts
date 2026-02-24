import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
// Finding the current User Id for the mutations
async function getCurrentUserId(ctx: MutationCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}
/**
 * List messages in a conversation (excludes soft-deleted). Pagination can be added later.
 */
export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .take(100)
      .then((msgs) => msgs.filter((m) => !m.isDeleted));
  },
});
// For Deleting a message (soft delete by setting isDeleted flag)
export const deleteMessage = mutation({
  args:{messageId:v.id("messages")},
  handler:async(ctx,args)=>{
    const identity =  await getCurrentUserId(ctx);
    if(!identity) throw new Error("User not authenticated");
    const message = await ctx.db.get(args.messageId);
    if(!message) throw new Error("Message not found");
    if(message.senderId !== identity) throw new Error("User not authorized to delete this message");
    await ctx.db.patch(args.messageId,{isDeleted:true});
  }
})


// For Sending a message in a conversation
export const SendMessage = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    if(args.content.trim()==="")
      return;
    const senderId = await getCurrentUserId(ctx);
    if (!senderId) throw new Error("User not authenticated");
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: senderId,
      content: args.content,
      isDeleted: false,
      reactions: [],
    });
  },
});
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emojiIndex: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, { messageId, emojiIndex, userId }) => {
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions || [];

    // Check if THIS user already reacted with THIS emoji
    const existingReaction = reactions.find(
      (r) =>
        r.userId === userId &&
        r.emojiIndex === emojiIndex
    );

    let updatedReactions;

    if (existingReaction) {
      // Remove ONLY this user's reaction
      updatedReactions = reactions.filter(
        (r) =>
          !(r.userId === userId &&
            r.emojiIndex === emojiIndex)
      );
    } else {
      // Add new reaction (optional: remove previous one)
      updatedReactions = [
        ...reactions.filter((r) => r.userId !== userId), // remove previous emoji if you want 1 per user
        { emojiIndex, userId },
      ];
    }

    await ctx.db.patch(messageId, {
      reactions: updatedReactions,
    });
  },
});