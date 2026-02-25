import { api } from "@/convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";

interface MessageBubbleProps {
  messageId: Id<"messages">;
  content: string;
  imageUrl?: string;
  isOwn?: boolean;
  timeStamp: number;
  className?: string;
  activeMessageId: Id<"messages"> | null;
  setActiveMessageId: (id: Id<"messages"> | null) => void;
  currentUserId: Id<"users">;
  reactions?: { userId: Id<"users">; emojiIndex: number }[];
}

/**
 * Single message bubble (placeholder). Full implementation will show
 * sender, time, and styling for own vs others.
 */
export function MessageBubble({
  messageId,
  content,
  imageUrl,
  isOwn = false,
  timeStamp,
  className,
  activeMessageId,
  setActiveMessageId,
  currentUserId,
  reactions,
}: MessageBubbleProps) {
  const formattedTime = new Date(timeStamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const DeleteChat = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const EMOJIS = ["👍🏻", "❤️", "😂", "😯", "😢"];
  const grouped = reactions?.reduce(
    (acc, r) => {
      acc[r.emojiIndex] = (acc[r.emojiIndex] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );
  
  return (
    <div className="w-full flex">
      <div className={` ${isOwn ? "ml-auto" : "mr-auto"} relative max-w-[75%]`}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm flex flex-col gap-1",
            isOwn
              ? "bg-indigo-600 text-white dark:bg-indigo-500"
              : "bg-gray-200 text-gray-900 dark:bg-slate-700 dark:text-slate-50",
            className,
          )}
          onClick={() =>
            setActiveMessageId(activeMessageId === messageId ? null : messageId)
          }
        >
          {content && <p>{content}</p>}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Sent image"
              className="mt-1 rounded-xl max-h-64 w-full object-cover border border-white/10"
            />
          )}
          <span className="w-full text-end text-xs font-extralight">
            {formattedTime}
          </span>
        </div>
        {Object.entries(grouped || {}).map(([index, count]) => (
          <span
            key={index}
            className="bg-indigo-300 text-white p-1 rounded-xl cursor-pointer"
            onClick={() =>
              toggleReaction({
                messageId,
                emojiIndex: Number(index),
                userId: currentUserId as Id<"users">,
              })
            }
          >
            {EMOJIS[Number(index)]} {count}
          </span>
        ))}
        <div
          className={`${activeMessageId === messageId ? "flex" : "hidden"} absolute ${isOwn ? "right-full top-1/2  " : " left-full bottom-1/2"}  flex-col gap-2 bg-indigo-200/50 backdrop-blur-md shadow-lg border border-indigo-300/20 w-40 p-3 rounded-md z-10`}
        >
          <button
            className={`${isOwn ? "block" : "hidden"} text-gray-800/40`}
            onClick={() => DeleteChat({ messageId: messageId })}
          >
            Delete Chat
          </button>
          <div className="flex justify-evenly">
            <button
              onClick={() =>
               {
                toggleReaction({
                  messageId,
                  emojiIndex: 0,
                  userId: currentUserId as Id<"users">,
                });
                setActiveMessageId(
                  activeMessageId === messageId ? null : messageId,
                );
              }
              }
            >
              👍🏻
            </button>
            <button
              onClick={() => {
                toggleReaction({
                  messageId,
                  emojiIndex: 1,
                  userId: currentUserId as Id<"users">,
                });
                setActiveMessageId(
                  activeMessageId === messageId ? null : messageId,
                );
              }}
            >
              ❤️
            </button>
            <button
              onClick={() =>
                {
                toggleReaction({
                  messageId,
                  emojiIndex: 2,
                  userId: currentUserId as Id<"users">,
                });
                setActiveMessageId(
                  activeMessageId === messageId ? null : messageId,
                );
              }
              }
            >
              😂
            </button>
            <button
              onClick={() =>
               {
                toggleReaction({
                  messageId,
                  emojiIndex: 3,
                  userId: currentUserId as Id<"users">,
                });
                setActiveMessageId(
                  activeMessageId === messageId ? null : messageId,
                );
              }
              }
            >
              😯
            </button>
            <button
              onClick={() =>
                {
                toggleReaction({
                  messageId,
                  emojiIndex: 4,
                  userId: currentUserId as Id<"users">,
                });
                setActiveMessageId(
                  activeMessageId === messageId ? null : messageId,
                );
              }
              }
            >
              😢
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
