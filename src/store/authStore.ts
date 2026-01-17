import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Definimos la estructura de tu usuario (ajusta los campos si necesitas más)
interface User {
  id: string
  name: string
  email: string
  roleId: string
  image?: string
  careerId?: string
}

// Definimos la interfaz completa del Store
interface AuthState {
  isLoggedIn: boolean
  token: string | null
  userId: string | null
  userRole: string | null
  user: User | null
  careerId: string | null
  
  // Acciones
  login: (token: string, userId: string, userRole: string) => void
  logout: () => void
  setUser: (user: User) => void
  updateUser: (userData: Partial<User>) => void // La nueva función para el Sidebar
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      userId: null,
      user: null,
      careerId: null,
      userRole: null,

      // Función Login (usada en LoginPage)
      login: (token, userId, userRole) => set({ 
        isLoggedIn: true, 
        token, 
        userId, 
        userRole 
      }),

      // Función Logout (usada en Sidebar)
      logout: () => set({ 
        isLoggedIn: false, 
        token: null, 
        userId: null, 
        user: null, 
        userRole: null, 
        careerId: null 
      }),

      // Función para setear el usuario completo (usada al cargar)
      setUser: (user) => set({ user }),

      // Función MÁGICA para actualizar datos parciales (usada en UserProfile)
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => window.localStorage),
    }
  )
)