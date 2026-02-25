"use client";

import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Client wrapper for dashboard: holds selected conversation id and
 * responsive visibility (mobile shows list or chat full screen).
 */
export function DashboardClient() {
  const [selectedId, setSelectedId] = useState<Id<"conversations"> | null>(
    null,
  );
  const [showChat, setShowChat] = useState(false);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineStatus();
    }, 20000);
    return () => clearInterval(interval);
  }, [setOnlineStatus]);
  const handleSelect = (id: Id<"conversations">) => {
    setSelectedId(id);
    setShowChat(true);
  };

  return (
    <div className="flex flex-1 min-w-0">
      {/* Sidebar: desktop always; mobile only when list view */}
      <div
        className={
          showChat
            ? "hidden md:flex md:w-80 md:max-w-[320px] shrink-0 flex-col"
            : "flex flex-col w-full md:w-80 md:max-w-[320px] shrink-0"
        }
      >
        <Sidebar className="h-full border-r border-gray-200 ">
          <ConversationList selectedId={selectedId} onSelect={handleSelect} />
        </Sidebar>
      </div>
      {/* Chat area: desktop always; mobile when a conversation selected */}
      <div
        className={
          showChat
            ? "flex flex-1 min-w-0 flex-col bg-white"
            : "hidden md:flex flex-1 min-w-0 flex-col bg-white "
        }
      >
        {showChat && (
       
            <button
              type="button"
              onClick={() => setShowChat(false)}
              className="md:hidden p-3 border-b border-gray-200 text-left text-sm text-indigo-600 hover:bg-gray-50 fixed w-full z-10 bg-white"
            >
              ← Back to conversations
            </button>
        )}
        <ChatWindow
          conversationId={selectedId}
          showChat={showChat}
          className="bg-slate-300  "
        />
      </div>
    </div>
  );
}
