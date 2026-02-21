"use client";

import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Left sidebar: user avatar/name (Clerk), and slot for conversation list
 * or other nav. Responsive: hidden on mobile when chat is full screen.
 */
export function Sidebar({ className, children }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-full md:w-80 md:max-w-[320px] border-r border-gray-200 bg-white shrink-0",
        className
      )}
    >
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-800">Chat</span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </aside>
  );
}
