import { useEffect, useState } from "react"
import { NavLink, useNavigate, Link } from "react-router-dom" 
import api from "@/api/axios" 
import { useAuthStore } from "@/store/authStore"
import { Home, User, Settings, LogOut, Menu } from "lucide-react"
import avatar from "../assets/avatar.png"
import { Dialog, DialogClose, DialogContent, DialogTrigger, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

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

  // --- CAMBIO SENCILLO: Usamos la URL base de Axios directamente ---
  // Esto asegura que si cambias el túnel en axios.ts, se cambia aquí también.
  const baseUrl = api.defaults.baseURL?.replace(/\/$/, '') || '';

  useEffect(() => {
    if (!isLogged || !userId) return

    api.get(`/api/users/${userId}`)
      .then((res) => {
        // Al cargar, actualizamos el store global para que todos tengan los datos frescos
        setUser(res.data)
      })
      .catch((err) => {
        console.error("Sidebar: Error cargando usuario", err);
      })
  }, [isLogged, userId, setUser]) 

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("id")
      logoutStore()
      setSuccess(true)
      setTimeout(()=>{
        setSuccess(false);
        navigate("/login")
      }, 2000)
    } catch (error) {
      setErrorAlert(true)
    }
  }

  // Lógica de imagen simplificada y consistente con el Perfil
  const profileImage = user?.image 
    ? (user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`)
    : avatar;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-gray-200 rounded-md"
      >
        <Menu className="w-6 h-6" />
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-100 shadow-xl transition-all duration-300 z-40 
        ${open ? "translate-x-0" : "-translate-x-full"} w-64`}
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

             <p className="font-semibold text-center px-2 text-gray-200 min-h-[1.5rem]">
               {user?.name || "Cargando..."}
             </p>
             <p className="text-xs text-gray-400 max-w-[200px] truncate text-center mt-1 min-h-[1rem]">
               {user?.email || ""}
             </p>
          </div>
        )}

        <nav className="flex flex-col gap-1 p-3 mt-4">
          <NavItem to="/dashboard" icon={<Home />} label="Panel de Control" />
          <NavItem to="/profile" icon={<User />} label="Perfil" />
          <NavItem to="/projects" icon={<Settings />} label="Proyectos" />

          <div className="py-7">
            {isLogged && (
                <Dialog>
                  <DialogTrigger asChild className=" bg-red-600 rounded-lg hover:bg-red-800 cursor-pointer">
                    <button className="flex items-center gap-2 p-3 mt-4 w-full text-left">
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-m text-white">Cerrar Sesión</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-gray-300">
                      ¿Está seguro que desea cerrar sesión?
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button className="bg-gray-700 hover:bg-gray-900 text-white" variant="ghost">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button
                        className="bg-red-500 hover:bg-red-900 cursor-pointer text-white"
                        onClick={handleLogout}
                      >
                        Cerrar Sesión
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            )}
            {success && (
              <Alert className="fixed top-4 right-4 w-auto bg-green-700 text-white">
                <CheckCircle2Icon />
                <AlertTitle>Sesión cerrada</AlertTitle>
                <AlertDescription>
                  Se ha cerrado sesión correctamente!
                </AlertDescription>
              </Alert>
            )}
            {errorAlert && (
              <Alert className="fixed top-4 right-4 w-auto bg-red-700 text-white">
                <AlertCircleIcon />
                <AlertTitle>Error al cerrar sesión</AlertTitle>
                <AlertDescription>
                  Ha ocurrido un error intentar cerrar sesión.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}

const NavItem = ({ to, icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition-all ${
        isActive ? "bg-cyan-700 text-white" : "hover:bg-gray-800 text-gray-300"
      }`
    }
  >
    <div className="grid place-items-center">{icon}</div>
    <span>{label}</span>
  </NavLink>
)

export default Sidebar