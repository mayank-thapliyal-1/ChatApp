"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import {  useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  conversationId?: Id<"conversations"> | null;
  className?: string;
}

/**
 * Main chat area: shows messages when a conversation is selected (from Convex),
 * otherwise shows empty state. Uses MessageBubble for each message.
 */
export function ChatWindow({ conversationId, className }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const { user, isLoaded } = useUser();
  const setTyping = useMutation(api.typing.setTyping);
  const typingUsers = useQuery(api.typing.getTypingUsers,  conversationId ? {conversationId}:"skip",);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const convexUser = useQuery(
    api.users.getByClerkId,
    isLoaded && user?.id ? { clerkId: user.id } : "skip",
  );
  const messages = useQuery(
    api.messages.listByConversation,
    conversationId ? { conversationId } : "skip",
  );

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // messages = array of current conversation messages
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!conversationId || !convexUser?._id) return;
    await setTyping({ conversationId, userId: convexUser._id, isTyping: true });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setTyping({ conversationId, userId: convexUser._id, isTyping: false });
    }, 2000); // 2s after user stops typing
  };
  const SendMessage = useMutation(api.messages.SendMessage);
  const ConversationName = useQuery(
    api.conversations.getName,
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
        <p className="font-medium text-gray-800">{ConversationName ?? "Chat"} </p>
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
            <div>
               {typingUsers
          ?.filter((u) => u.userId !== convexUser?._id)
          .map((u) => (
            <p key={u._id}>{u.user?.name ?? "someone"} is typing...</p>
          ))}
            </div>
             <div ref={messagesEndRef} />
          </div>
        )}
        <div className="w-full flex gap-3 items-center px-5">
          <input
            type="text"
            value={text}
            onChange={handleTyping}
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
