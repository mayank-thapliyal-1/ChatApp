"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useEffect, useState } from "react";
import { SendMessage } from "@/convex/messages";

interface ChatWindowProps {
  conversationId?: Id<"conversations"> | null;
  className?: string;
}

/**
 * Main chat area: shows messages when a conversation is selected (from Convex),
 * otherwise shows empty state. Uses MessageBubble for each message.
 */
export function ChatWindow({ conversationId, className }: ChatWindowProps) {
  const [text, setText] = useState("");
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    isLoaded && user?.id ? { clerkId: user.id } : "skip",
  );
  const SendMessage = useMutation(api.messages.SendMessage);
  const messages = useQuery(
    api.messages.listByConversation,
    conversationId ? { conversationId } : "skip",
  );

  if (!conversationId) {
    return (
      <div className={className}>
        <EmptyState
          title="Select a conversation"
          description="Choose a chat from the list or start a new one."
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className ?? ""}`}>
      <header className="shrink-0 border-b border-gray-200 px-4 py-3">
        <p className="font-medium text-gray-800">{}</p>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages === undefined ? (
          <p className="text-sm text-gray-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send a message to start the conversation."
          />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              content={msg.content}
              isOwn={convexUser?._id === msg.senderId}
            />
          ))
        )}
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="type something"
          />
          <button
            onClick={async () => {
              await SendMessage({
                conversationId,
                content: text,
              });
              setText("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
