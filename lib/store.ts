import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User, Language } from "./types";

interface AppState extends AuthState {
  language: Language;
  sidebarOpen: boolean;

  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;

  // UI actions
  setLanguage: (language: Language) => void;
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
      setLanguage: (language) => set({ language }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "cms-app-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        language: state.language, // to be removed
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
