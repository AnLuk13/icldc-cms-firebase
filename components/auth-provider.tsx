"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppStore } from "@/lib/store";
import axios from "axios";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tc = useTranslations("common");
  const { setUser, isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Check if user is already authenticated via cookie
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me");

        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        // Authentication check failed - user will need to login
        console.log("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Always check auth on mount, regardless of current state
    checkAuth();
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">{tc("loading")}...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
