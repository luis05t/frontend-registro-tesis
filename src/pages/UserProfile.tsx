import SideBar from "@/components/SideBar"
// CAMBIO 1: Eliminamos axios
// import axios from "axios" (YA NO)
import api from "@/api/axios"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import avatarPlaceholder from "../assets/avatar.png"
import { Loader2, Mail, GraduationCap, Shield, Pencil, Camera } from "lucide-react"
import { DialogTrigger, Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type UserData = {
  id: string
  name: string
  email: string
  careerId: string
  roleId: string
  image?: string 
}

type Career = { id: string; name: string }
type Role = { id: string; name: string }

const UserProfile = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const accessToken = localStorage.getItem('token')
  const userId = localStorage.getItem('id')

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [careerName, setCareerName] = useState("Cargando...")
  const [roleName, setRoleName] = useState("Cargando...")
  const [name, setName] = useState('') // Estado para el nuevo nombre escrito

  const loadProfile = async () => {
    if (!userId || !accessToken) return
    setLoading(true)
    try {
      // CAMBIO 2: api.get y ruta relativa
      const userRes = await api.get(`/api/users/${userId}`)
      const userData = userRes.data
      setUser(userData)

      // CAMBIO 3: api.get en paralelo y rutas relativas
      const [careersRes, rolesRes] = await Promise.all([
        api.get("/api/careers"),
        api.get("/api/roles")
      ])

      const foundCareer = careersRes.data.data.find((c: Career) => c.id === userData.careerId)
      const foundRole = rolesRes.data.data.find((r: Role) => r.id === userData.roleId)

      setCareerName(foundCareer ? foundCareer.name : "Sin asignar")
      setRoleName(foundRole ? foundRole.name : "Usuario")

    } catch (error) {
      console.error("Error cargando perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async () => {
    // Si el campo está vacío, no hacemos nada (o podrías mostrar una alerta)
    if (!name.trim()) return

    try {
      setLoading(true)
      // CAMBIO 4: api.patch y ruta relativa
      await api.patch(`/api/users/${userId}`, { name })
      await loadProfile()
      setName('') // Limpiar después de guardar
    } catch (error) {
      console.error('Error al editar el usuario', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      // CAMBIO 5: api.patch para subida de archivos
      // No necesitamos configurar Authorization manualmente porque el interceptor lo hace
      await api.patch(`/api/users/${userId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      await loadProfile()
    } catch (error) {
      console.error("Error al subir imagen:", error)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (!accessToken || !userId) {
      navigate("/login")
      return
    }
    loadProfile()
  }, [userId, accessToken])

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100 font-sans">
      <SideBar />

      <main className="flex-1 ml-0 md:ml-64 p-6 flex items-center justify-center">
        {loading && !user ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <span className="text-gray-400 text-sm">Cargando perfil...</span>
          </div>
        ) : (
          <Card className="w-full max-w-sm bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-col items-center pb-2 relative pt-8">
              
              {/* SECCIÓN DE IMAGEN */}
              <div 
                className="group relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-800 mb-4 bg-gray-800 cursor-pointer shadow-2xl"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* CAMBIO 6: CORRECCIÓN DE URL DE IMAGEN */}
                    {/* Usamos api.defaults.baseURL para obtener la URL base dinámica */}
                    <img 
                      src={user?.image ? `${api.defaults.baseURL}${user.image}` : avatarPlaceholder} 
                      alt="Avatar" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:opacity-40" 
                      onError={(e) => { e.currentTarget.src = avatarPlaceholder }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Cambiar foto</span>
                    </div>
                  </>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />

              {/* NOMBRE Y DIÁLOGO DE EDICIÓN */}
              <div className="flex flex-row items-center gap-2 mt-2">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <Dialog onOpenChange={(open) => { if(open) setName('') }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-800 text-gray-500 hover:text-cyan-400 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Editar Nombre</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName">Nuevo Nombre</Label>
                        <Input 
                          id="userName"
                          value={name} 
                          placeholder={user?.name} // EL NOMBRE ACTUAL SALE AQUÍ EN GRIS
                          onChange={(e) => setName(e.target.value)} 
                          className="bg-gray-950 border-gray-700 focus:border-cyan-500 placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost" className="hover:bg-gray-800">Cancelar</Button>
                      </DialogClose>
                      <Button 
                        className="bg-cyan-600 hover:bg-cyan-700" 
                        onClick={handleEditUser}
                        disabled={!name.trim()} // No deja guardar si el campo está vacío
                      >
                        Guardar Cambios
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <span className="mt-3 text-cyan-400 font-bold text-[10px] uppercase tracking-widest bg-cyan-950/30 px-4 py-1 rounded-full border border-cyan-900/50">
                {roleName}
              </span>
            </CardHeader>

            <CardContent className="space-y-3 mt-6 px-6 pb-8">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-950/50 border border-gray-800/50">
                <div className="bg-gray-800 p-2 rounded-lg text-cyan-500"><Mail className="w-5 h-5" /></div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Correo</p>
                  <p className="text-sm text-gray-200 truncate font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-950/50 border border-gray-800/50">
                <div className="bg-gray-800 p-2 rounded-lg text-purple-500"><GraduationCap className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Carrera</p>
                  <p className="text-sm text-gray-200 font-medium">{careerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-950/50 border border-gray-800/50">
                <div className="bg-gray-800 p-2 rounded-lg text-orange-500"><Shield className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Nivel</p>
                  <p className="text-sm text-gray-200 font-medium">{roleName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default UserProfile