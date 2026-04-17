"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppStore } from "@/lib/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { authApi } from "@/lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tc = useTranslations("common");
  const { setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase SDK restores auth state from IndexedDB on page reload and keeps
    // tokens fresh. When state resolves, fetch Firestore user data via /api/auth/me.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await authApi.me();
          setUser(res.user);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

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
