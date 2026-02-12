import { useEffect, useState } from "react"
import { NavLink, useNavigate, Link } from "react-router-dom" 
import api from "@/api/axios" 
import { useAuthStore } from "@/store/authStore"
import { 
  Home, User, Settings, LogOut, Menu, 
  AlertCircleIcon, CheckCircle2Icon 
} from "lucide-react"
import type { LucideProps } from "lucide-react" 
import avatar from "../assets/avatar.png"
import { 
  Dialog, DialogClose, DialogContent, DialogTrigger, 
  DialogDescription, DialogHeader, DialogFooter, DialogTitle 
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { CreateTeacherModal } from "./ui/CreateTeacherModal"
import { BulkRegisterModal } from "./ui/BulkRegisterModal" // 1. IMPORTADO

const Sidebar = () => {
  const userId = useAuthStore((s) => s.userId)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const isLogged = useAuthStore((s) => s.isLoggedIn)
  const logoutStore = useAuthStore((s) => s.logout)
  
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [errorAlert, setErrorAlert] = useState(false)
  const [open, setOpen] = useState(true)

  const baseUrl = api.defaults.baseURL?.replace(/\/$/, '') || '';
  const isAdmin = (user as any)?.role?.name === 'ADMIN';

  useEffect(() => {
    if (!isLogged || !userId) return

    api.get(`/api/users/${userId}`)
      .then((res) => {
        setUser(res.data)
      })
      .catch((err) => {
        console.error("Sidebar: Error cargando usuario", err);
      })
  }, [isLogged, userId, setUser]) 

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("auth-storage")
      logoutStore()
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false);
        navigate("/login")
      }, 2000)
    } catch (error) {
      setErrorAlert(true)
      setTimeout(() => setErrorAlert(false), 3000)
    }
  }

  // 2. CORRECCIÓN DE IMAGEN: Se quitó el "/uploads/" sobrante
  const profileImage = user?.image 
    ? (user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`)
    : avatar;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-gray-200 rounded-md cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-100 shadow-xl transition-all duration-300 z-40 
        ${open ? "translate-x-0" : "-translate-x-full"} w-64 flex flex-col`}
      >
        <div className="flex items-center justify-center py-6 border-b border-gray-800 gap-3">
          <img src="https://cdn-icons-png.flaticon.com/512/4196/4196599.png" alt="icon" className="w-7 h-7 "/>
          <h1 className="text-white font-bold text-xl">RepoDigital ITS</h1>
        </div>

        {isLogged && (
          <div className="border-b border-gray-800 py-5 flex flex-col items-center animate-in fade-in duration-500">
             <Link 
               to="/profile" 
               className="group cursor-pointer mb-3 relative"
               title="Ir a mi perfil"
             >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 transition-transform duration-300 group-hover:scale-105 group-hover:border-cyan-500/50">
                  <img 
                    src={profileImage} 
                    alt="Perfil" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = avatar }}
                  />
                </div>
             </Link>

             <p className="font-semibold text-center px-2 text-gray-200">
               {user?.name || "Cargando..."}
             </p>

             <p className="text-[11px] text-gray-500 font-normal text-center mt-1 break-all px-4 tracking-wide">
               {user?.email || ""}
             </p>
          </div>
        )}

        <nav className="flex flex-col gap-1 p-3 mt-4 flex-grow overflow-y-auto custom-scrollbar">
          <NavItem to="/dashboard" icon={Home} label="Panel de Control" />
          <NavItem to="/profile" icon={User} label="Perfil" />
          <NavItem to="/projects" icon={Settings} label="Proyectos" />

          {isAdmin && (
             <div className="pt-4 mt-4 border-t border-gray-800 animate-in fade-in slide-in-from-left-4 duration-500">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Administración</p>
                <CreateTeacherModal />
                <BulkRegisterModal /> {/* 3. AGREGADO */}
             </div>
          )}
        </nav>

        <div className="p-3 border-t border-gray-800">
          {isLogged && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer">
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </DialogTrigger>

              <DialogContent className="bg-gray-800 border-gray-700" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle className="text-white">Confirmar Salida</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    ¿Estás seguro de que deseas cerrar tu sesión actual?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button className="bg-gray-700 hover:bg-gray-600 text-white border-none" variant="ghost">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </aside>

      {success && (
        <Alert className="fixed top-4 right-4 z-[100] w-auto bg-green-600 border-none text-white shadow-2xl animate-in slide-in-from-top-full">
          <CheckCircle2Icon className="h-4 w-4" />
          <AlertTitle>¡Éxito!</AlertTitle>
          <AlertDescription>Se ha cerrado la sesión correctamente.</AlertDescription>
        </Alert>
      )}

      {errorAlert && (
        <Alert className="fixed top-4 right-4 z-[100] w-auto bg-red-600 border-none text-white shadow-2xl animate-in slide-in-from-top-full">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudo cerrar la sesión. Inténtalo de nuevo.</AlertDescription>
        </Alert>
      )}
    </>
  )
}

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<LucideProps>; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? "bg-cyan-600/20 text-cyan-400 border-r-4 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]" 
          : "hover:bg-gray-800/50 text-gray-400 hover:text-gray-200"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
)

export default Sidebar