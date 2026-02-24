import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Chat app schema:
 * - users: synced from Clerk (clerkId), plus presence (isOnline, lastSeen)
 * - conversations: 1:1 or group, members, lastMessageId for preview/sort
 * - messages: content, sender, soft delete (isDeleted)
 */
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    members: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
  }).index("by_member", ["members"]),
  
  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  }).index("by_conversation", ["conversationId"]),

  // Junction table for scalable "list conversations for user" (index by userId).
  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.boolean(),
    reactions: v.optional(
      v.array(
        v.object({
          emojiIndex: v.number(), // 0 = 👍, 1 = ❤️, etc.
          userId: v.id("users"), // who reacted
        }),
      ),
    ),
  }).index("by_conversation", ["conversationId"]),
});
