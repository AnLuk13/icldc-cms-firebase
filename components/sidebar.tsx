"use client";
import { Link, usePathname } from "@/i18n/routing";
import {
  Home,
  FolderOpen,
  Users,
  Calendar,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user } = useAppStore();
  const t = useTranslations("navigation");

  const baseNavigation = [
    { name: t("dashboard"), href: "/", icon: Home },
    { name: t("projects"), href: "/projects", icon: FolderOpen },
    { name: t("partners"), href: "/partners", icon: Users },
    { name: t("events"), href: "/events", icon: Calendar },
    { name: t("news"), href: "/news", icon: Newspaper },
  ];

  const adminNavigation =
    user?.role === "admin"
      ? [{ name: t("users"), href: "/users", icon: UserCheck }]
      : [];

  const navigation = [...baseNavigation, ...adminNavigation];

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <h1 className="text-lg font-semibold text-sidebar-foreground text-nowrap">
              {t("cmsTitle")}
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-nowrap",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        {/* <div className="border-t border-sidebar-border p-2">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{t("settings")}</span>}
          </Link>
        </div> */}
      </div>
    </div>
  );
}
