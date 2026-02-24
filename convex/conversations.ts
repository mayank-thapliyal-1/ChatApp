import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

/** Get Convex user id for the currently authenticated user (Clerk). */
async function getCurrentUserId(ctx: MutationCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}

function requireCurrentUserId(ctx: MutationCtx): Promise<Id<"users">> {
  return getCurrentUserId(ctx).then((id) => {
    if (id) return id;
    throw new Error(
      "You must be signed in and your profile must be synced. Try refreshing the page and starting a chat again.",
    );
  });
}

async function getCurrentUserIdQuery(ctx: any): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}


/**
 * List conversations for a user using the conversationMembers index (scalable).
 * Run backfillConversationMembers once if you have existing conversations.
 */
export const listForUser = query({
  args: { userId: v.id("users") },

  handler: async (ctx, args) => {
    const now = Date.now();

    // 1️⃣ Get memberships of this user
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // 2️⃣ Fetch conversations safely
    const conversations = await Promise.all(
      memberships.map((m) => ctx.db.get(m.conversationId)),
    );

    const validConversations = conversations.filter(Boolean);
    type ConversationListItem =
      | ({
          isGroup: true;
          onlineCount: number;
          otherUser: undefined;
          isOnline: undefined;
        } & Doc<"conversations">)
      | ({
          isGroup: false;
          onlineCount: undefined;
          otherUser: Doc<"users"> | undefined;
          isOnline: boolean;
        } & Doc<"conversations">);
    // 3️⃣ Build enriched response
    const results: ConversationListItem[] = (
      await Promise.all(
        validConversations.map(async (conversation) => {
          if (!conversation) return null;

          // 4️⃣ Get all members of this conversation
          const memberLinks = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation", (q) =>
              q.eq("conversationId", conversation._id),
            )
            .collect();

          const members = await Promise.all(
            memberLinks.map((link) => ctx.db.get(link.userId)),
          );

          const validMembers = members.filter(Boolean);

          // 5️⃣ Calculate online members (excluding current user)
          const onlineMembers = validMembers.filter(
            (user) =>
              user && user._id !== args.userId && now - user.lastSeen < 40000,
          );

          // 🔵 GROUP CHAT
          if (conversation.isGroup) {
            return {
              ...conversation,
              isGroup: true as const,
              onlineCount: onlineMembers.length,
              otherUser: undefined,
              isOnline: undefined,
            };
          }

          // 🟢 PRIVATE CHAT
          const otherUser = validMembers.find(
            (u) => u && u._id !== args.userId,
          );

          const isOnline = !!otherUser && now - otherUser.lastSeen < 40000;

          return {
            ...conversation,
            isGroup: false as const,
            onlineCount: undefined,
            otherUser,
            isOnline,
          };
        }),
      )
    ).filter((item): item is ConversationListItem => item !== null);

    // 6️⃣ Final null cleanup
    return results;
  },
});
// get conversation member name chatwindow header 
export const getName = query({
  args:{conversationId: v.id("conversations")},
  handler: async(ctx,args)=>{
    const conversation = await ctx.db.get(args.conversationId);
    if(!conversation) throw new Error("Conversation not found");
    if(conversation.isGroup)
    return conversation.name;
  // If 1-to-1 → find the other user
  const currentUserId = await getCurrentUserIdQuery(ctx);
    if (!currentUserId) {
      throw new Error("You must be signed in and your profile must be synced. Try refreshing the page and starting a chat again.");
    }
    const otherUserId = conversation.members.find(
      (memberId) => memberId !== currentUserId,
    );

    if (!otherUserId) {
      throw new Error("Other user not found");
    }

    const otherUser = await ctx.db.get(otherUserId);

    return otherUser?.name;
  },
});


/**
 * Create a 1:1 conversation with another user. Idempotent: if a direct chat
 * already exists between you and them, returns that conversation id.
 */
export const createDirectConversation = mutation({
  args: { otherUserId: v.id("users") },

  handler: async (ctx, args) => {
    const otheruser = await ctx.db.get(args.otherUserId);
    if (!otheruser) {
      throw new Error("User not found");
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
      if (
        !conv?.isGroup &&
        conv?.members.length === 2 &&
        conv.members.includes(args.otherUserId)
      )
        return conv._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      members: [myId, args.otherUserId],
      name: OtherUserName,
    });
    for (const uid of [myId, args.otherUserId]) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId: uid,
      });
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
    if (members.length < 2)
      throw new Error("Group must have at least 2 members");

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name.trim() || "Group",
      members,
    });
    for (const uid of members) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId: uid,
      });
    }
    return conversationId;
  },
});
