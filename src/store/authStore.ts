import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type AuthStore = {
  isLoggedIn: boolean
  token: string | null
  userId: string | null
  userRole: string | null
  user: any | null
  careerId: any | null
  login: (token: string, userId: string, userRole: string) => void
  logout: () => void
  setUser: (user: any) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      userId: null,
      user: null,
      careerId: null,
      userRole: null,

      login: (token, userId, userRole) => set({ isLoggedIn: true, token, userId, userRole }),
      logout: () => set({ isLoggedIn: false, token: null, userId: null, user: null, userRole: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => window.localStorage),
    }
  )
)

