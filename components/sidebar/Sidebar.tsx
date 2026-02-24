"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  const { user, isLoaded } = useUser();

  const username =
    user?.fullName ?? user?.firstName ?? "User";

  return (
    <aside
      className={cn(
        "flex flex-col w-full md:w-80 md:max-w-[320px] border-r border-gray-200 bg-white shrink-0",
        className
      )}
    >
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-800">
          {isLoaded ? username : "Loading..."}
        </span>

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </aside>
  );
}