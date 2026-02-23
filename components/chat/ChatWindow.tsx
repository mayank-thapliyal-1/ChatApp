"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import {  useState } from "react";

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
    <div className={`flex flex-col h-full  ${className ?? ""}`}>
      <header className="shrink-0 border-b border-gray-200 px-4 py-3">
        <p className="font-medium text-gray-800">{}</p>
      </header>
      <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 space-y-2 bg-amber-100/25">
        {messages === undefined ? (
          <p className="text-sm text-gray-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send a message to start the conversation."
          />
        ) : (
          <div className="flex flex-col gap-3 h-full overflow-y-scroll   ">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                messageId={msg._id} 
                content={msg.content}
                isOwn={convexUser?._id === msg.senderId}
                timeStamp={msg._creationTime}
              />
            ))}
          </div>
        )}
        <div className="w-full flex gap-3 items-center px-5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="type something"
            className="w-full p-2 outline-none border-b bg-gray-200/50 backdrop-blur-lg border-white/80 rounded-lg"
          />
          <button
            className="bg-blue-600 px-3 py-1 rounded-md text-white hover:scale-105"
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
