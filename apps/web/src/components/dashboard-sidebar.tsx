"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  LayoutDashboard,
  ShieldBan,
  Key,
  Settings,
  BarChart3,
  ArrowUpCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tier } from "@/lib/mock-data";

const sidebarNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/blocklist", label: "Blocklist", icon: ShieldBan },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const tierConfig: Record<Tier, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-zinc-600 text-zinc-200" },
  pro: { label: "Pro", color: "bg-primary-600 text-white" },
  business: { label: "Business", color: "bg-amber-600 text-white" },
};

interface DashboardSidebarProps {
  tier: Tier;
}

function SidebarContent({ tier }: { tier: Tier }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <Globe className="h-6 w-6 text-primary-400" />
        <span className="text-lg font-bold text-foreground">GeoKit</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {sidebarNav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-600/10 text-primary-400"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        {tier === "free" && (
          <Link
            href="/dashboard/upgrade"
            className="flex items-center gap-2 rounded-md bg-primary-600/10 px-3 py-2 text-sm font-medium text-primary-400 transition-colors hover:bg-primary-600/20"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade Plan
          </Link>
        )}
      </div>
    </div>
  );
}

export function DashboardSidebar({ tier }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <SidebarContent tier={tier} />
    </aside>
  );
}

export function DashboardHeader({ tier }: DashboardSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const tierInfo = tierConfig[tier];

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Globe className="h-5 w-5 text-primary-400" />
          <span className="font-bold text-foreground">GeoKit</span>
        </div>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-3">
          <Badge className={cn("text-xs", tierInfo.color)}>
            {tierInfo.label}
          </Badge>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl">
            <SidebarContent tier={tier} />
          </div>
        </div>
      )}
    </>
  );
}
