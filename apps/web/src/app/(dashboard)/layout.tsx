"use client";

import { DashboardSidebar, DashboardHeader } from "@/components/dashboard-sidebar";
import { mockUser } from "@/lib/mock-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar tier={mockUser.tier} />
      <main className="flex-1">
        <DashboardHeader tier={mockUser.tier} />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
