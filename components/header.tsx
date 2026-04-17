"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { toast } from "@/hooks/use-toast";

export function Header() {
  const { user, logout, sidebarOpen } = useAppStore();
  const router = useRouter();
  const t = useTranslations();

  const handleLogout = () => {
    Promise.all([
      authApi.logout(), // clears the httpOnly session cookie
      signOut(auth), // clears Firebase client auth state
    ])
      .then(() => {
        toast({
          title: "Success",
          description: "Logged out successfully.",
        });
        logout();
        router.push("/login");
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <header
      className={cn(
        "h-16 border-b border-border bg-card flex items-center justify-between px-6 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16",
      )}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          {t("common.cmsTitle")}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user?.name || t("common.user")}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>{t("common.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("common.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
