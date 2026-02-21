"use client";

import { cn } from "@/lib/utils";

interface ConversationListProps {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Placeholder list of conversations. Full implementation will query
 * Convex and show last message preview, unread, etc.
 */
export function ConversationList({
  selectedId,
  onSelect,
  className,
}: ConversationListProps) {
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="p-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-sm text-gray-500 px-2 py-4">
          {selectedId
            ? "Conversation selected. Chat UI will show messages here."
            : "No conversations yet. Start a chat from the sidebar."}
        </p>
        {onSelect && (
          <button
            type="button"
            className="text-indigo-600 text-sm mt-2"
            onClick={() => onSelect("placeholder")}
            aria-label="Placeholder: select conversation"
          >
            (Placeholder: simulate select)
          </button>
        )}
      </div>
    </div>
  );
}
