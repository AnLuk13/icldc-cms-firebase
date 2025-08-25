import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, User, Language } from "./types"

interface AppState extends AuthState {
  language: Language
  sidebarOpen: boolean

  // Auth actions
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User | null) => void

  // UI actions
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      language: "en",
      sidebarOpen: true,

      // Auth actions
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
        // Set HTTP-only cookie
        document.cookie = `auth-token=${token}; path=/; max-age=${24 * 60 * 60}; samesite=strict`
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        // Clear cookie
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // UI actions
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "cms-app-storage",
      partialize: (state) => ({
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
)
