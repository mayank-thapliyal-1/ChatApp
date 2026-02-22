import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";

/**
 * List conversations for a user using the conversationMembers index (scalable).
 * Run backfillConversationMembers once if you have existing conversations.
 */
export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const conversations = await Promise.all(
      memberships.map((m) => ctx.db.get(m.conversationId))
    );
    return conversations.filter(Boolean);
  },
});

/** Get Convex user id for the currently authenticated user (Clerk). */
async function getCurrentUserId(ctx: MutationCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}

function requireCurrentUserId(ctx: MutationCtx): Promise<Id<"users">> {
  return getCurrentUserId(ctx).then((id) => {
    if (id) return id;
    throw new Error(
      "You must be signed in and your profile must be synced. Try refreshing the page and starting a chat again."
    );
  });
}

/**
 * Create a 1:1 conversation with another user. Idempotent: if a direct chat
 * already exists between you and them, returns that conversation id.
 */
export const createDirectConversation = mutation({
  args: { otherUserId: v.id("users") },
 
  handler: async (ctx, args) => {
     const otheruser = await ctx.db.get(args.otherUserId);
     if(!otheruser){
      throw new Error("User not found")
     }
     const OtherUserName = otheruser.name;
    const myId = await requireCurrentUserId(ctx);
    if (args.otherUserId === myId) throw new Error("Cannot chat with yourself");

    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", myId))
      .collect();
    for (const m of myMemberships) {
      const conv = await ctx.db.get(m.conversationId);
      if (!conv?.isGroup && conv?.members.length === 2 && conv.members.includes(args.otherUserId))
        return conv._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      members: [myId, args.otherUserId],
      name:OtherUserName,
    });
    for (const uid of [myId, args.otherUserId]) {
      await ctx.db.insert("conversationMembers", { conversationId, userId: uid });
    }
    return conversationId;
  },
});

/**
 * Create a group conversation. Current user is added as a member if not in the list.
 */
export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const myId = await requireCurrentUserId(ctx);

    const members = [...new Set([myId, ...args.memberIds])];
    if (members.length < 2) throw new Error("Group must have at least 2 members");

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name.trim() || "Group",
      members,
    });
    for (const uid of members) {
      await ctx.db.insert("conversationMembers", { conversationId, userId: uid });
    }
    return conversationId;
  },
});

/**
 * One-time backfill: populates conversationMembers from existing conversations.
 * Run once from Convex dashboard (Functions → backfillConversationMembers) or
 * via npx convex run conversations:backfillConversationMembers.
 */
export const backfillConversationMembers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect();
    for (const conv of conversations) {
      for (const userId of conv.members) {
        const existing = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .filter((q) => q.eq(q.field("userId"), userId))
          .first();
        if (!existing) {
          await ctx.db.insert("conversationMembers", {
            conversationId: conv._id,
            userId,
          });
        }
      }
    }
    return { backfilled: conversations.length };
  },
});
