import Link from "next/link";
import {
  Globe,
  LayoutDashboard,
  ShieldBan,
  Key,
  Settings,
  BarChart3,
} from "lucide-react";

const sidebarNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/lookups", label: "IP Lookups", icon: Globe },
  { href: "/dashboard/blocklist", label: "Blocklist", icon: ShieldBan },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Globe className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold text-foreground">GeoKit</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {sidebarNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Globe className="h-5 w-5 text-primary-400" />
            <span className="font-bold text-foreground">GeoKit</span>
          </div>
          <div className="ml-auto" />
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
