// convex/unread.ts
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ----------------------
// 1️⃣ Mutation: Update last read message
// ----------------------
export const updateLastReadMessage = mutation(
  async (
    { db },
    { conversationId, userId }: { conversationId: Id<"conversations">; userId: Id<"users"> }
  ) => {
    // Get all messages in this conversation
    const messages = await db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), conversationId))
      .collect();

    if (!messages.length) return;

    // Sort by creation time descending to get the latest message
    messages.sort((a, b) => b._creationTime - a._creationTime);
    const lastMessage = messages[0];

    // Check if a read record already exists
    const existing = await db
      .query("conversationReads")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("conversationId"), conversationId))
      .first();

    if (existing) {
      // Update the last read message
      await db.patch(existing._id, {
        lastReadMessageId: lastMessage._id,
      });
    } else {
      // Insert new read record
      await db.insert("conversationReads", {
        conversationId,
        userId,
        lastReadMessageId: lastMessage._id,
      });
    }
  }
);
// ----------------------
// 2️⃣ Query: Get unread counts
// ----------------------
export const getUnreadCounts = query(
  async ({ db }, { userId }: { userId: Id<"users"> }) => {
    // All conversations this user is a member of
    const memberships = await db
      .query("conversationMembers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const counts: Record<string, number> = {};

    for (const m of memberships) {
      // Get last read info
      const lastRead = await db
        .query("conversationReads")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("conversationId"), m.conversationId))
        .first();

      // Get all messages in this conversation
      const messages = await db
        .query("messages")
        .filter((q) => q.eq(q.field("conversationId"), m.conversationId))
        .collect();

      // Get the last read message to find its creation time
      let lastReadMessageTime = 0;
      if (lastRead?.lastReadMessageId) {
        const lastReadMessage = await db.get(lastRead.lastReadMessageId);
        lastReadMessageTime = lastReadMessage?._creationTime ?? 0;
      }

      // Count messages that came after last read
      const unreadCount = messages.filter(
        (msg) => msg._creationTime > lastReadMessageTime
      ).length;

      counts[m.conversationId] = unreadCount;
    }

    return counts; // { conversationId: unreadCount }
  }
);