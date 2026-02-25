"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  conversationId?: Id<"conversations"> | null;
  showChat: boolean;
  className?: string;
}

export function ChatWindow({ conversationId, className }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMessageId, setActiveMessageId] =
    useState<Id<"messages"> | null>(null);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { user, isLoaded } = useUser();

  const setTyping = useMutation(api.typing.setTyping);
  const SendMessage = useMutation(api.messages.SendMessage);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convexUser = useQuery(
    api.users.getByClerkId,
    isLoaded && user?.id ? { clerkId: user.id } : "skip"
  );

  const messages = useQuery(
    api.messages.listByConversation,
    conversationId ? { conversationId } : "skip"
  );

  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    conversationId ? { conversationId } : "skip"
  );

  const ConversationName = useQuery(
    api.conversations.getName,
    conversationId ? { conversationId } : "skip"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!conversationId || !convexUser?._id) return;

    await setTyping({
      conversationId,
      userId: convexUser._id,
      isTyping: true,
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setTyping({
        conversationId,
        userId: convexUser._id,
        isTyping: false,
      });
    }, 2000);
  };

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        await SendMessage({
          conversationId,
          content: "",
          imageUrl: data.secure_url as string,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (!conversationId) {
    return (
      <div
        className={`w-full h-full bg-slate-200 dark:bg-slate-900/95 flex justify-center items-center ${
          className ?? ""
        }`}
      >
        <EmptyState
          title="Select a conversation"
          description="Choose a chat from the list or start a new one."
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen overflow-hidden   ${
        className ?? ""
      }`}
    >
      {/* HEADER */}
      <header className="shrink-0 border-b border-gray-300 mt-12 md:mt-0 dark:border-slate-800 px-4 py-3 bg-slate-300 dark:bg-slate-900/80 backdrop-blur">
        <p className="font-medium text-gray-800 dark:text-gray-50">
          {ConversationName ?? "Chat"}
        </p>
      </header>

      {/* MESSAGES (SCROLLABLE AREA) */}
      <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900">
        {messages === undefined ? (
          <p className="text-sm text-gray-500 p-4">Loading messages…</p>
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send a message to start the conversation."
          />
        ) : (
          <div className="flex flex-col gap-5 p-4">
            {messages.map(
              (msg) =>
                convexUser?._id && (
                  <MessageBubble
                    key={msg._id}
                    messageId={msg._id}
                    content={msg.content}
                    imageUrl={msg.imageUrl}
                    isOwn={convexUser._id === msg.senderId}
                    timeStamp={msg._creationTime}
                    activeMessageId={activeMessageId}
                    setActiveMessageId={setActiveMessageId}
                    currentUserId={convexUser._id}
                    reactions={msg.reactions}
                  />
                )
            )}

            {/* Typing indicator */}
            {typingUsers
              ?.filter((u) => u.userId !== convexUser?._id)
              .map((u) => (
                <p key={u._id} className="text-sm text-gray-500">
                  {u.user?.name ?? "Someone"} is typing...
                </p>
              ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT (FIXED AT BOTTOM) */}
      <div className="shrink-0 w-full flex gap-3 items-center px-4 py-2 bg-slate-300 dark:bg-slate-900/90 border-t border-gray-200 dark:border-slate-800">
        <label className="inline-flex items-center justify-center rounded-lg border border-dashed border-gray-500 dark:border-slate-600 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800">
          {isUploading ? "Uploading..." : "Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={text}
          onChange={handleTyping}
          placeholder="Type something..."
          className="w-full p-2 outline-none bg-gray-200/60 dark:bg-slate-800/80 backdrop-blur-lg border border-white/10 dark:border-slate-700 rounded-lg text-sm"
        />

        <button
          className="bg-blue-600 dark:bg-blue-500 px-3 py-1 rounded-md text-white hover:scale-105 disabled:opacity-50"
          disabled={!text.trim()}
          onClick={async () => {
            await SendMessage({
              conversationId,
              content: text,
              imageUrl: undefined,
            });
            setText("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}