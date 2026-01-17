import Sidebar from "@/components/SideBar"
import { useEffect, useState } from "react"
import api from "@/api/axios"
import { 
  FolderGit2,  
  GraduationCap, 
  Code2, 
  Loader2, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Eye,
  Calendar
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  Dialog, 
  DialogHeader, 
  DialogFooter, 
  DialogTrigger, 
  DialogContent, 
  DialogTitle,   
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import type { Proyect } from "@/types/Proyect" 

type Career = {
  id: string
  name: string
  createdAt: string
}

type Skill = {
  id: string
  name: string
}

const Dashboard = () => {
  const navigate = useNavigate()
  const accessToken = localStorage.getItem("token")
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalCareers: 0,
    totalSkills: 0
  })
  
  const [recentProjects, setRecentProjects] = useState<Proyect[]>([])
  const [allProjects, setAllProjects] = useState<Proyect[]>([]) 
  const [careersList, setCareersList] = useState<Career[]>([])
  const [skillsList, setSkillsList] = useState<Skill[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [projectsRes, usersRes, careersRes, skillsRes] = await Promise.allSettled([
          api.get("/api/projects?limit=1000"),
          api.get("/api/users?limit=1000"),
          api.get("/api/careers?limit=1000"),
          api.get("/api/skills?limit=1000")
        ])

        if (projectsRes.status === 'fulfilled') {
          const rawData = projectsRes.value.data
          const projectsData = Array.isArray(rawData) ? rawData : (rawData.data || [])
          
          setStats(prev => ({ ...prev, totalProjects: projectsData.length }))
          
          setRecentProjects(projectsData.slice(0, 4))
          setAllProjects(projectsData) 
        }

        if (usersRes.status === 'fulfilled') {
          const rawData = usersRes.value.data
          const usersData = Array.isArray(rawData) ? rawData : (rawData.data || [])
          setStats(prev => ({ ...prev, totalUsers: usersData.length }))
        }

        if (careersRes.status === 'fulfilled') {
          const rawData = careersRes.value.data
          const careersData = Array.isArray(rawData) ? rawData : (rawData.data || [])
          setStats(prev => ({ ...prev, totalCareers: careersData.length }))
          setCareersList(careersData)
        }
        
        if (skillsRes.status === 'fulfilled') {
           const rawData = skillsRes.value.data;
           const skillsData = Array.isArray(rawData) ? rawData : (rawData.data || []);
           
           setStats(prev => ({ ...prev, totalSkills: skillsData.length }))
           setSkillsList(skillsData)
        }

      } catch (error) {
        console.error("Error cargando dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) {
      fetchDashboardData()
    }
  }, [accessToken])

  const statCards = [
    { 
      key: "projects",
      label: "Proyectos Registrados", 
      value: stats.totalProjects, 
      icon: FolderGit2, 
      color: "text-cyan-500", 
      bg: "bg-cyan-500/10",
      desc: "Proyectos ya registrados"
    },
    { 
      key: "careers",
      label: "Carreras Ofertadas", 
      value: stats.totalCareers, 
      icon: GraduationCap, 
      color: "text-yellow-500", 
      bg: "bg-yellow-500/10",
      desc: "Carreras de tercer nivel"
    },
    { 
      key: "skills",
      label: "Habilidades Técnicas", 
      value: stats.totalSkills, 
      icon: Code2, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      desc: "Habilidades registradas"
    },
  ]

  const renderDialogContent = (key: string) => {
    if (key === 'projects') {
      return (
        <div className="grid gap-4 py-4">
          {allProjects.length > 0 ? (
             allProjects.map(project => (
              <div key={project.id} className="flex items-center p-3 bg-gray-800 rounded-md border border-gray-700">
                <FolderGit2 className="w-5 h-5 text-cyan-500 mr-3" />
                <span className="text-sm font-medium text-gray-200">{project.name}</span>
              </div>
             ))
          ) : (
            <p className="text-gray-500">No hay proyectos registrados.</p>
          )}
        </div>
      )
    }
    if (key === 'careers') {
      return (
        <div className="grid gap-4 py-4">
          {careersList.length > 0 ? (
             careersList.map(career => (
              <div key={career.id} className="flex items-center p-3 bg-gray-800 rounded-md border border-gray-700">
                <GraduationCap className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="text-sm font-medium text-gray-200">{career.name}</span>
              </div>
             ))
          ) : (
            <p className="text-gray-500">No hay carreras registradas.</p>
          )}
        </div>
      )
    }
    if (key === 'skills') {
      return (
        <div className="flex flex-wrap gap-2 py-4">
          {skillsList.length > 0 ? (
            skillsList.map(skill => (
              <Badge key={skill.id} variant="secondary" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1">
                 {skill.name}
              </Badge>
            ))
          ) : (
            <p className="text-gray-500">No hay habilidades registradas.</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-0 md:ml-64 p-0 transition-all">
        
        <div className="p-4 md:p-6 space-y-6">
          
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Control</h1>
              <p className="text-gray-400 mt-1">Sistema de gestión de proyectos</p>
            </div>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => navigate("/projects")}>
              Ver Todos los Proyectos
            </Button>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-2 text-cyan-500" />
              <p>Sincronizando datos del sistema...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {statCards.map((stat, index) => {
                  
                  if (stat.key === 'projects') {
                    return (
                      <Dialog key={index}>
                        <Card className="bg-gray-900 border-gray-800 shadow-lg hover:border-gray-700 transition-all relative">
                          <CardContent className="p-6">
                            
                            <div className="flex justify-between items-start">
                              <div 
                                className="cursor-pointer group/nav"
                                onClick={() => navigate("/projects")}
                                title="Ir a la página de proyectos"
                              >
                                <p className="text-sm font-medium text-gray-400 group-hover/nav:text-cyan-400 transition-colors">
                                  {stat.label}
                                </p>
                                <h3 className="text-3xl font-bold text-white mt-2 group-hover/nav:text-cyan-400 transition-colors">
                                  {stat.value}
                                </h3>
                              </div>

                              <DialogTrigger asChild>
                                <div className={`p-3 rounded-xl ${stat.bg} cursor-pointer hover:opacity-80 transition-opacity`} title="Ver lista rápida">
                                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                              </DialogTrigger>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" /> 
                                  {stat.desc}
                                </span>
                              </div>
                              
                              <DialogTrigger asChild>
                                <div className="h-6 flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 cursor-pointer transition-colors">
                                  <Eye className="w-3 h-3 mr-1" /> Ver lista
                                </div>
                              </DialogTrigger>
                            </div>

                          </CardContent>
                        </Card>

                        <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                              Lista de {stat.label}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Vista rápida de títulos registrados.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {renderDialogContent(stat.key)}

                          <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 cursor-pointer">
                                  Cerrar
                                </Button>
                              </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )
                  }

                  return (
                    <Card key={index} className="bg-gray-900 border-gray-800 shadow-lg hover:border-gray-700 transition-all relative">
                      <Dialog>
                        <DialogTrigger asChild>
                          <CardContent className="p-6 cursor-pointer group">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-400 group-hover:text-cyan-400 transition-colors">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors">{stat.value}</h3>
                              </div>
                              <div className={`p-3 rounded-xl ${stat.bg} group-hover:opacity-80 transition-opacity`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" /> 
                                  {stat.desc}
                                </span>
                              </div>
                              <div className="h-6 flex items-center text-xs text-cyan-400 group-hover:text-cyan-300 font-medium px-2">
                                <Eye className="w-3 h-3 mr-1" /> Ver lista
                              </div>
                            </div>
                          </CardContent>
                        </DialogTrigger>

                        <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                              Lista de {stat.label}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Listado completo registrado en el sistema.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {renderDialogContent(stat.key)}

                          <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 cursor-pointer">
                                  Cerrar
                                </Button>
                              </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  )
                })}
              </div>

              {/* LISTA DE ÚLTIMOS PROYECTOS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-1 lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg shadow-lg hover:border-gray-700 transition-all overflow-hidden">
                  
                  <div 
                    className="p-4 border-b border-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-800/50 transition-colors group"
                    onClick={() => navigate("/projects")}
                    title="Ir a todos los proyectos"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition-colors"/>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Últimos Proyectos
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 group-hover:text-cyan-400 transition-colors gap-1">
                       Ver todo <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="divide-y divide-gray-800">
                    {recentProjects.length > 0 ? (
                      <>
                        {recentProjects.map((proj) => (
                          <Dialog key={proj.id}>
                            <DialogTrigger asChild>
                              <div className="p-4 hover:bg-gray-800/50 transition-colors flex justify-between items-center cursor-pointer group/item">
                                
                                <div className="flex-1 min-w-0 mr-4">
                                  <h5 className="font-semibold text-gray-200 truncate group-hover/item:text-cyan-400 transition-colors" title={proj.name}>
                                    {proj.name}
                                  </h5>
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                                    {proj.startDate ? (
                                      <>
                                        <Calendar className="w-3 h-3 shrink-0"/> 
                                        <span className="truncate">{new Date(proj.startDate).toLocaleDateString()}</span>
                                      </>
                                    ) : 'Sin fecha'}
                                    <span className="mx-1 shrink-0">•</span> 
                                    <span className="truncate">
                                      {proj.careerId ? 'Carrera asignada' : 'Sin carrera'}
                                    </span>
                                  </div>
                                </div>

                                <Badge variant="outline" className={`shrink-0 text-xs ${proj.status === 'Finalizado' ? 'text-green-400 border-green-800' : 'text-cyan-400 border-cyan-800'}`}>
                                  {proj.status || 'Activo'}
                                </Badge>
                              </div>
                            </DialogTrigger>

                            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="text-xl flex items-center gap-2 text-cyan-400">
                                  <FolderGit2 className="w-5 h-5"/>
                                  Detalles del Proyecto
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400">Nombre del Proyecto</h4>
                                  <p className="text-lg font-semibold text-white break-words">{proj.name}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400">Descripción</h4>
                                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                                    {proj.description || "No hay descripción disponible para este proyecto."}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-500 block mb-1">Estado</span>
                                    <Badge className={proj.status === 'Finalizado' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}>
                                      {proj.status || 'En Progreso'}
                                    </Badge>
                                  </div>
                                  <div className="p-3 bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-500 block mb-1">Fecha de Inicio</span>
                                    <div className="text-sm font-medium">
                                      {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'No definida'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button 
                                  onClick={() => navigate(`/projects/${proj.id}`)} 
                                  variant="secondary" 
                                  className="mr-2 cursor-pointer"
                                >
                                  Ver completo
                                </Button>
                                <DialogClose asChild>
                                  <Button variant="outline" className="border-gray-700 text-gray-300 cursor-pointer">Cerrar</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ))}

                        <div className="p-4">
                          <Button 
                            variant="ghost" 
                            className="w-full text-sm text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer" 
                            onClick={() => navigate("/projects")}
                          >
                            Ver todos los proyectos <ArrowRight className="w-4 h-4 ml-2"/>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No hay actividad reciente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  ) 
}

export default Dashboard