import { useEffect, useState } from "react"
import { NavLink, useNavigate, Link } from "react-router-dom" 
import api from "@/api/axios" 
import { useAuthStore } from "@/store/authStore"
import { 
  LogOut, Menu, X,
  CheckCircle2Icon 
} from "lucide-react"
// Se eliminó LucideProps y AlertCircleIcon porque no se usaban
import avatar from "../assets/avatar.png"
import { 
  Dialog, DialogClose, DialogContent, DialogTrigger, 
  DialogDescription, DialogHeader, DialogFooter, DialogTitle 
} from "./ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateTeacherModal } from "./ui/CreateTeacherModal"
import { BulkRegisterModal } from "./ui/BulkRegisterModal" 

const Sidebar = () => {
  const userId = useAuthStore((s) => s.userId)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const isLogged = useAuthStore((s) => s.isLoggedIn)
  const logoutStore = useAuthStore((s) => s.logout)
  
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  // Se eliminó errorAlert porque no se estaba renderizando nada con él
  const [open, setOpen] = useState(false)

  const baseUrl = api.defaults.baseURL?.replace(/\/$/, '') || '';
  const isAdmin = (user as any)?.role?.name === 'ADMIN';

  useEffect(() => {
    if (!isLogged || !userId) return
    api.get(`/api/users/${userId}`)
      .then((res) => { setUser(res.data) })
      .catch((err) => { console.error("Sidebar error", err); })
  }, [isLogged, userId, setUser]) 

  const handleLogout = () => {
    try {
      localStorage.removeItem("token"); 
      localStorage.removeItem("auth-storage");
      logoutStore(); 
      setSuccess(true);
      setTimeout(() => { 
        setSuccess(false); 
        navigate("/login") 
      }, 2000)
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }

  const profileImage = user?.image 
    ? (user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`)
    : avatar;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-2 right-2 z-50 p-2 bg-gray-800/95 backdrop-blur-sm text-cyan-400 rounded-md border border-gray-700 shadow-2xl cursor-pointer active:scale-95 transition-all"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-100 shadow-2xl transition-all duration-300 z-40 
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64 flex flex-col border-r border-gray-800`}
      >
        <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-800">
          <img 
            src="https://eva.sudamericano.edu.ec/pluginfile.php/1/theme_moove/logo/1762397214/faviconSuda%20%281%29%20%281%29.png" 
            alt="Logo ITS" 
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg leading-tight">RepoDigital</h1>
            <span className="text-cyan-500 text-[10px] font-bold tracking-widest uppercase">ITS Sudamericano</span>
          </div>
        </div>

        {isLogged && (
          <div className="border-b border-gray-800 py-5 flex flex-col items-center">
             <Link to="/profile" className="group cursor-pointer mb-3 relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 transition-all group-hover:border-cyan-500/50">
                  <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = avatar }} />
                </div>
             </Link>
             <p className="font-semibold text-center px-2 text-gray-200">{user?.name || "Cargando..."}</p>
             <p className="text-[11px] text-gray-500 font-normal text-center mt-1 break-all px-4">{user?.email || ""}</p>
          </div>
        )}

        <nav className="flex flex-col gap-1 p-3 mt-4 flex-grow overflow-y-auto custom-scrollbar">
          <NavItem to="/dashboard" icon={MiIconoPanel} label="Panel de Control" onClick={() => setOpen(false)} />
          <NavItem to="/projects" icon={MiIconoProyectos} label="Proyectos" onClick={() => setOpen(false)} />
          <NavItem to="/profile" icon={MiIconoPersonalizado} label="Perfil" onClick={() => setOpen(false)} />

          {isAdmin && (
             <div className="pt-4 mt-4 border-t border-gray-800">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Administración</p>
                <div onClick={() => setOpen(false)}><CreateTeacherModal /></div>
                <div onClick={() => setOpen(false)}><BulkRegisterModal /></div>
             </div>
          )}
        </nav>

        <div className="p-3 border-t border-gray-800">
          {isLogged && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-3 p-3 w-full text-left rounded-lg text-red-400 hover:bg-red-950/30 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Confirmar Salida</DialogTitle>
                  <DialogDescription className="text-gray-300">¿Deseas cerrar tu sesión?</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild><Button variant="ghost" className="text-white">Cancelar</Button></DialogClose>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>Cerrar Sesión</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </aside>

      {success && (
        <Alert className="fixed top-4 right-4 z-[100] w-auto bg-green-600 text-white shadow-2xl animate-in slide-in-from-top-full border-none">
          <CheckCircle2Icon className="h-4 w-4" />
          <AlertTitle>¡Éxito!</AlertTitle>
          <AlertDescription>Sesión cerrada.</AlertDescription>
        </Alert>
      )}
    </>
  )
}

// Icono nuevo para Panel de Control
const MiIconoPanel = ({ className }: { className?: string }) => (
  <div 
    className={`${className} bg-current scale-125`} 
    style={{ 
      WebkitMaskImage: 'url(/image2.png)', 
      WebkitMaskSize: 'contain', 
      WebkitMaskRepeat: 'no-repeat', 
      WebkitMaskPosition: 'center',
      maskImage: 'url(/image2.png)',
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center'
    }} 
  />
);

// Icono para Perfil
const MiIconoPersonalizado = ({ className }: { className?: string }) => (
  <div 
    className={`${className} bg-current scale-150`} 
    style={{ 
      WebkitMaskImage: 'url(/image.png)', 
      WebkitMaskSize: 'contain', 
      WebkitMaskRepeat: 'no-repeat', 
      WebkitMaskPosition: 'center',
      maskImage: 'url(/image.png)',
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center'
    }} 
  />
);

// Icono nuevo para Proyectos
const MiIconoProyectos = ({ className }: { className?: string }) => (
  <div 
    className={`${className} bg-current scale-150`} 
    style={{ 
      WebkitMaskImage: 'url(/image1.png)', 
      WebkitMaskSize: 'contain', 
      WebkitMaskRepeat: 'no-repeat', 
      WebkitMaskPosition: 'center',
      maskImage: 'url(/image1.png)',
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center'
    }} 
  />
);

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive ? "bg-cyan-600/20 text-cyan-400 border-r-4 border-cyan-500" : "hover:bg-gray-800/50 text-gray-400"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
)

export default Sidebar;