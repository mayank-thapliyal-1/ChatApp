import { DashboardClient } from "./DashboardClient";

/**
 * Dashboard layout: responsive shell. DashboardClient renders
 * sidebar (conversation list) + chat area; protected by Clerk middleware.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col md:flex-row  overflow-hidden">
      <DashboardClient />
      {children}
    </div>
  );
}
