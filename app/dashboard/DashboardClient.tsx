"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";

/**
 * Client wrapper for dashboard: holds selected conversation id and
 * responsive visibility (mobile shows list or chat full screen).
 */
export function DashboardClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowChat(true);
  };

  return (
    <>
      {/* Sidebar: desktop always; mobile only when list view */}
      <div
        className={
          showChat ? "hidden md:flex md:w-80 md:max-w-[320px] shrink-0 flex-col" : "flex flex-col w-full md:w-80 md:max-w-[320px] shrink-0"
        }
      >
        <Sidebar className="h-full border-r border-gray-200 bg-white">
          <ConversationList selectedId={selectedId} onSelect={handleSelect} />
        </Sidebar>
      </div>
      {/* Chat area: desktop always; mobile when a conversation selected */}
      <div
        className={
          showChat
            ? "flex flex-1 min-w-0 flex-col bg-white"
            : "hidden md:flex flex-1 min-w-0 flex-col bg-white"
        }
      >
        {showChat && (
          <button
            type="button"
            onClick={() => setShowChat(false)}
            className="md:hidden p-3 border-b border-gray-200 text-left text-sm text-indigo-600 hover:bg-gray-50"
          >
            ← Back to conversations
          </button>
        )}
        <ChatWindow conversationId={selectedId} className="flex-1 min-h-0" />
      </div>
    </>
  );
}
