"use client";

import { EmptyState } from "@/components/ui/EmptyState";

interface ChatWindowProps {
  conversationId?: string | null;
  className?: string;
}

/**
 * Main chat area: shows messages when a conversation is selected,
 * otherwise shows empty state. Placeholder only — no message logic yet.
 */
export function ChatWindow({ conversationId, className }: ChatWindowProps) {
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
      {/* Header placeholder */}
      <header className="shrink-0 border-b border-gray-200 px-4 py-3">
        <p className="font-medium text-gray-800">Chat</p>
      </header>
      {/* Message list placeholder */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <EmptyState
          title="No messages yet"
          description="Send a message to start the conversation."
        />
      </div>
    </div>
  );
}
