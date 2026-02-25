"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();

  const username = user?.fullName ?? user?.firstName ?? "User";
  const isDark = theme === "dark";

  return (
    <aside
      className={cn(
        "flex flex-col w-full md:w-80 md:max-w-[320px] border-r border-gray-400   dark:bg-slate-900 bg-slate-500 dark:border-slate-800 shrink-0",
        className
      )}
    >
      <div className="p-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="font-semibold text-gray-800 dark:text-gray-50 truncate">
          {isLoaded ? username : "Loading..."}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full border border-gray-200 dark:border-slate-700 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </aside>
  );
}