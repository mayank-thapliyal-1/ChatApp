"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  selectedId?: Id<"conversations"> | null;
  onSelect?: (id: Id<"conversations">) => void;
  className?: string;
}

/**
 * Lists conversations for the current user. "New chat" searches other users
 * and creates a 1:1 conversation. "New group" creates a group with selected members.
 */
export function ConversationList({
  selectedId,
  onSelect,
  className,
}: ConversationListProps) {
  const { user, isLoaded } = useUser();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Id<"users">[]>([]);

  const convexUser = useQuery(
    api.users.getByClerkId,
    isLoaded && user?.id ? { clerkId: user.id } : "skip",
  );
  const conversations = useQuery(
    api.conversations.listForUser,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );
  const otherUsers = useQuery(
    api.users.listOthers,
    convexUser?._id
      ? { excludeUserId: convexUser._id, search: searchTerm || undefined }
      : "skip",
  );
  const createDirect = useMutation(api.conversations.createDirectConversation);
  const createGroup = useMutation(api.conversations.createGroupConversation);

  const handleStartDirect = async (otherUserId: Id<"users">) => {
    console.log(otherUserId);
    if (!convexUser?._id || !onSelect) return;
    try {
      const conversationId = await createDirect({ otherUserId });
      onSelect(conversationId);
      setShowNewChat(false);
      setSearchTerm("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGroup = async () => {
    if (!convexUser?._id || !onSelect || selectedMemberIds.length === 0) return;
    try {
      const conversationId = await createGroup({
        name: groupName.trim() || "Group",
        memberIds: selectedMemberIds,
      });
      onSelect(conversationId);
      setShowNewGroup(false);
      setGroupName("");
      setSelectedMemberIds([]);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMember = (userId: Id<"users">) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="p-3 border-b border-gray-200 space-y-2">
        <h2 className="font-semibold text-gray-800">Conversations</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowNewChat(true);
              setShowNewGroup(false);
            }}
            className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
          >
            New chat
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewGroup(true);
              setShowNewChat(false);
            }}
            className="flex-1 rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-300"
          >
            New group
          </button>
        </div>
      </div>

      {/* New chat: search users */}
      {showNewChat && (
        <div className="p-2 border-b border-gray-200 bg-gray-50 space-y-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {otherUsers?.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No users found.</p>
            ) : (
              otherUsers
                ?.filter((u): u is NonNullable<typeof u> => u != null)
                .map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleStartDirect(u._id)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
                  >
                    <span className="font-medium text-gray-800">{u.name}</span>
                    <span className="text-gray-500 text-xs block truncate">
                      {u.email}
                    </span>
                  </button>
                ))
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowNewChat(false);
              setSearchTerm("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* New group: name + member selection */}
      {showNewGroup && (
        <div className="p-2 border-b border-gray-200 bg-gray-50 space-y-2">
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500">Select members:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {otherUsers
              ?.filter((u): u is NonNullable<typeof u> => u != null)
              .map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/80 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-800">{u.name}</span>
                </label>
              ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={selectedMemberIds.length === 0}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Create group
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewGroup(false);
                setGroupName("");
                setSelectedMemberIds([]);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {!isLoaded || (user && !convexUser) ? (
          <p className="text-sm text-gray-500 px-2 py-4">Loading…</p>
        ) : !conversations ? (
          <p className="text-sm text-gray-500 px-2 py-4">
            Loading conversations…
          </p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-gray-500 px-2 py-4">
            No conversations yet. Start a chat or create a group above.
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations
              .filter((c): c is NonNullable<typeof c> => c != null)
              .map((conv) => (
                <li key={conv._id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(conv._id)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedId === conv._id
                        ? "bg-indigo-100 text-indigo-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                    aria-label={`Open ${conv.name ?? (conv.isGroup ? "Group" : "Chat")}`}
                  >
                    {conv.name ?? (conv.isGroup ? "Group" : "Chat")}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
