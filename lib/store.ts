import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User, Language } from "./types";

interface AppState extends AuthState {
  sidebarOpen: boolean;

  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;

  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      language: "en",
      sidebarOpen: true,

      // Auth actions
      login: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // UI actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "cms-app-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
