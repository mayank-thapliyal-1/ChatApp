import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isOwn?: boolean;
  className?: string;
}

/**
 * Single message bubble (placeholder). Full implementation will show
 * sender, time, and styling for own vs others.
 */
export function MessageBubble({
  content,
  isOwn = false,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
        isOwn
          ? "bg-indigo-600 text-white ml-auto"
          : "bg-gray-200 text-gray-900",
        className
      )}
    >
      {content}
    </div>
  );
}
