import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Placeholder empty state for chat area when no conversation is selected.
 */
export function EmptyState({
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[75%] items-center  w-full h-full justify-center flex-1 text-center p-6 text-gray-500",
        className
      )}
    >
      <p className="font-medium dark:text-indigo-500 text-gray-700 text-xl">{title}</p>
      {description && <p className="mt-1 text-md font-light dark:text-white">{description}</p>}
      {children}
    </div>
  );
}
