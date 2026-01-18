import SideBar from "@/components/SideBar"
import api from "@/api/axios"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import avatarPlaceholder from "../assets/avatar.png"
import { Loader2, Mail, GraduationCap, Shield, Pencil, Camera } from "lucide-react"
// CORRECCIÓN 1: Quitamos DialogClose de los imports
import { DialogTrigger, Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/authStore"

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

  const updateUserStore = useAuthStore((state) => state.updateUser)

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [careerName, setCareerName] = useState("Cargando...")
  const [roleName, setRoleName] = useState("Cargando...")
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('') 

  const loadProfile = async () => {
    if (!userId || !accessToken) return
    setLoading(true)
    try {
      const userRes = await api.get(`/api/users/${userId}`)
      const userData = userRes.data
      
      setUser(userData)
      updateUserStore(userData)

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

  const handleEditUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() 
    if (!name.trim()) return

    try {
      setLoading(true)
      
      await api.patch(`/api/users/${userId}`, { name })
      
      updateUserStore({ name })

      if (user) setUser({ ...user, name })
      
      setIsDialogOpen(false)
      setName('')

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
      // CORRECCIÓN 2: Quitamos "const res =" ya que no usamos la respuesta
      await api.patch(`/api/users/${userId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
              
              <div className="relative"> 
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
                
                <div 
                  className="absolute bottom-4 right-0 bg-cyan-600 p-1.5 rounded-full border-2 border-gray-900 text-white cursor-pointer hover:bg-cyan-500 transition-colors z-20 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    fileInputRef.current?.click();
                  }}
                  title="Subir foto"
                >
                  <Camera size={14} />
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />

              <div className="flex flex-row items-center gap-2 mt-2">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                   setIsDialogOpen(open)
                   if(open) setName('') 
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-800 text-gray-500 hover:text-cyan-400 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Editar Nombre</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleEditUser}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="userName">Nuevo Nombre</Label>
                          <Input 
                            id="userName"
                            value={name} 
                            placeholder={user?.name}
                            onChange={(e) => setName(e.target.value)} 
                            className="bg-gray-950 border-gray-700 focus:border-cyan-500 placeholder:text-gray-600"
                            autoFocus 
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="hover:bg-gray-800" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        
                        <Button 
                          type="submit" 
                          className="bg-cyan-600 hover:bg-cyan-700" 
                          disabled={!name.trim() || loading} 
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cambios"}
                        </Button>
                      </DialogFooter>
                    </form>

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