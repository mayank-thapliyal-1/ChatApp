import { api } from "@/convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel"
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { useState } from "react";
interface MessageBubbleProps {
  messageId: Id<"messages">;
  content: string;
  isOwn?: boolean;
  timeStamp: number;
  className?: string;
}

/**
 * Single message bubble (placeholder). Full implementation will show
 * sender, time, and styling for own vs others.
 */
export function MessageBubble({
  messageId,
  content,
  isOwn = false,
  timeStamp,
  className,
}: MessageBubbleProps) {
  const formattedTime = new Date(timeStamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const DeleteChat = useMutation(api.messages.deleteMessage);
  const [active, setActive] = useState(false);
  return (
    <div className="w-full">
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm flex flex-col gap-1",
          isOwn
            ? "bg-indigo-600 text-white ml-auto"
            : "bg-gray-200 text-gray-900",
          className,
        )}
        onClick={() => setActive((prev) => !prev)}
      >
        <p> {content}</p>
        <span className="w-full text-end text-xs font-extralight ">
          {formattedTime}
        </span>  
      </div>
      <div className={`${active?"flex":"hidden"} relative ${isOwn?"left-[60vw] bottom-28":"left-5 bottom-2"}  flex-col gap-2 bg-indigo-200/50 backdrop-blur-md shadow-lg border border-indigo-300/20 w-40 p-3 rounded-md`}>
        <button className={`${isOwn?"block":"hidden"} text-gray-800/40`} onClick={()=>DeleteChat({messageId: messageId})}>Delete Chat</button>
        <div className="flex justify-evenly">
          <button>👍🏻</button><button>❤️</button><button>😂</button><button>😯</button><button>😢</button>
              
        </div>
      </div>
    </div>
  );
}
