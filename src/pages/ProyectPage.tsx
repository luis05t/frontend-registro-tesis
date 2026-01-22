import Sidebar from "@/components/SideBar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom" 

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTrigger, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import api from "@/api/axios"
import { 
  Loader2, 
  CalendarIcon, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Code2, 
  CheckCircle2Icon, 
  Pencil, 
  Plus, 
  User2, 
  Check, 
  Clock, 
  AlertCircleIcon, 
  Search,
  Link as LinkIcon,
  ExternalLink,
  Zap,
  Trash2, 
  AlertTriangle,
  Lock,
  Globe,
  User,
  Eye,
  EyeOff
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"

// --- ESQUEMAS ---
const skillSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
})

const projectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La problemática es obligatoria"),
  summary: z.string().optional(),
  deliverables: z.string().optional(),
  link: z.string().optional(), 
  cycle: z.string().min(1, "Selecciona un ciclo"),
  academic_period: z.string().min(1, "Selecciona un periodo"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  careerId: z.string().min(1, "Selecciona una carrera"),
  objectives: z.string().min(1, "Debes ingresar al menos un objetivo"),
  status: z.string().optional(),
})

// --- TIPOS ---
type Project = {
  id: string
  name: string
  description: string
  status: string
  objectives: string[]
  problems: string
  summary: string
  cycle: string
  academic_period: string
  createdBy: string
  user: {
    id: string
    name: string
    email: string
  }
  startDate?: string | null
  endDate?: string | null
  careerId: string
  createdAt?: string
  updatedAt?: string
  deliverables: string[]
}

type Career = { id: string, name: string }
type User = { id: string, careerId: string, roleId: string, email: string, name: string }
type Skill = { 
  id: string, 
  name: string, 
  description: string, 
  details: any,
  createdById?: string 
}
type ProjectSkill = { id: string, projectId: string, skillId: string }
type Role = { id: string, name: string }

const ProyectPage = () => {
  const { id } = useParams() 
  const navigate = useNavigate()

  // --- ESTADOS DE DATOS ---
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [projectSkills, setProjectSkills] = useState<ProjectSkill[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role[]>([])
  const [userProjects, setUserProjects] = useState<Project[]>([])
  
  // --- CREDENCIALES ---
  const userId = localStorage.getItem('id')

  // --- ESTADOS UI ---
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // --- NOTIFICACIONES (Alertas) ---
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("") 

  const [errorAlert, setErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState("Hubo un problema.")

  const [search, setSearch] = useState("")
  const [skillSearch, setSkillSearch] = useState("")
  
  const [manageSkillSearch, setManageSkillSearch] = useState("")
  
  const [filterStatus, setFilterStatus] = useState("Todo");
  const [filterStatusUserProjects, setFilterStatusUserProjects] = useState("Todo")
  const statusOptions = ["Todo", "en progreso", "completado"];
  const statusUserProjects = ["Todo", "Mis proyectos"]

  // --- MODALES PROYECTOS ---
  const [viewProject, setViewProject] = useState<Project | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  
  // --- ESTADOS GESTIÓN DE SKILLS ---
  const [isSkillsManagerOpen, setIsSkillsManagerOpen] = useState(false)
  const [isCreateSkillOpen, setIsCreateSkillOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  
  const [activeTab, setActiveTab] = useState<"mine" | "community">("mine")

  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [editSkillName, setEditSkillName] = useState('')
  const [editSkillDesc, setEditSkillDesc] = useState('')
  
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)

  const [visibleDescriptions, setVisibleDescriptions] = useState<Record<string, boolean>>({})

  // --- FORMS ---
  const createSkillForm = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: { name: "", description: "" }
  })

  const createProjectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "", description: "", summary: "", deliverables: "", link: "",
      cycle: "", academic_period: "", startDate: "", endDate: "",
      careerId: "", objectives: "", status: "en progreso",
    }
  })

  const editProjectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "", description: "", summary: "", deliverables: "", link: "",
      cycle: "", academic_period: "", startDate: "", endDate: "",
      careerId: "", objectives: "", status: "",
    }
  })

  // --- HELPER ALERTAS ---
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setErrorAlert(true)
    setTimeout(() => setErrorAlert(false), 4000)
  }

  // --- FETCHING ---
  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await api.get("/api/projects?limit=1000")
      const rawData = res.data
      setProjects(Array.isArray(rawData) ? rawData : (rawData.data || []))
    } catch (error) {
      console.log(error)
    }
    setLoadingProjects(false)
  }

  const fetchUserProjects = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/users-projects/user/${userId}`);
      const projectsOnly = response.data.map((item: any) => item.project);
      setUserProjects(projectsOnly || []);
    } catch (error) {
       // Silencio en error de red
    }
  }

  const fetchSkillsData = async () => {
    try {
      const resSkills = await api.get('/api/skills?limit=1000')
      const skillsRaw = resSkills.data
      setSkills(Array.isArray(skillsRaw) ? skillsRaw : (skillsRaw.data || []))
      
      const resProjectSkills = await api.get('/api/porjects-skills?limit=1000')
      const pSkillsRaw = resProjectSkills.data
      setProjectSkills(Array.isArray(pSkillsRaw) ? pSkillsRaw : (pSkillsRaw.data || []))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [careersRes, rolesRes] = await Promise.all([
          api.get('/api/careers?limit=1000'), 
          api.get('/api/roles?limit=1000')
        ])
        const careersData = careersRes.data
        setCareers(Array.isArray(careersData) ? careersData : (careersData.data || []))
        
        const rolesData = rolesRes.data
        setRole(Array.isArray(rolesData) ? rolesData : (rolesData.data || []))
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
    fetchProjects()
    fetchSkillsData()

    const fetchUser = async () => {
      if (!userId) return
      try {
        const response = await api.get(`/api/users/${userId}`)
        setUser(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchUser()
    fetchUserProjects()
  }, [])

  useEffect(() => {
    if (id && projects.length > 0) {
      const found = projects.find(p => p.id === id);
      if (found) {
        setViewProject(found);
        setIsViewOpen(true);
      }
    }
  }, [id, projects]);

  const roleName = user && role.length > 0 ? role.find(r => r.id === user.roleId)?.name : "";
  const isAdmin = roleName?.toLowerCase().includes("admin");

  const getProjectSkillsDisplay = (projectId: string) => {
    const relations = projectSkills.filter(ps => ps.projectId === projectId);
    return relations.map(rel => skills.find(s => s.id === rel.skillId)).filter(Boolean) as Skill[];
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Pendiente";
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const parseDeliverables = (items: string[]) => {
    const link = items.find(item => item.startsWith('http') || item.startsWith('https'));
    const textItems = items.filter(item => !item.startsWith('http') && !item.startsWith('https'));
    return { link, textItems };
  }

  // --- HANDLERS SKILLS ---
  const handleCreateSkill = async (values: z.infer<typeof skillSchema>) => {
    setLoading(true)
    try {
      await api.post('/api/skills', {
        name: values.name,
        description: values.description,
        details: { level: "N/A", category: "N/A" } 
      })
      await fetchSkillsData();
      
      setLoading(false); 
      setTimeout(() => showSuccess("Habilidad creada correctamente."), 300);
      
      createSkillForm.reset();
      setIsCreateSkillOpen(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      if (error.response && error.response.status === 409) {
        showError("Habilidad ya agregada");
      } else {
        showError("Hubo un problema al crear la habilidad.");
      }
    }
  }

  const handleUpdateSkill = async () => {
    if (!editingSkill || !editSkillName.trim()) return
    setLoading(true)
    try {
      await api.patch(`/api/skills/${editingSkill.id}`, {
        name: editSkillName,
        description: editSkillDesc
      })
      await fetchSkillsData()
      setEditingSkill(null)
      
      setLoading(false);
      setTimeout(() => showSuccess("Habilidad actualizada correctamente."), 300);
    } catch (error) {
      setLoading(false);
      console.error("Error actualizando habilidad", error)
      showError("Error al actualizar.");
    }
  }

  const handleDeleteSkill = async () => {
    if(!skillToDelete) return;
    setLoading(true)
    try {
      await api.delete(`/api/skills/${skillToDelete.id}`)
      await fetchSkillsData()
      setSkillToDelete(null)
      
      setLoading(false);
      setTimeout(() => showSuccess("Habilidad eliminada correctamente."), 300);
    } catch (error) {
      setLoading(false);
      console.error("Error borrando", error)
      showError("No se pudo eliminar.");
    }
  }

  const toggleVisibility = (skillId: string) => {
    setVisibleDescriptions(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }))
  }

  // --- HANDLERS PROYECTOS ---
  const handleCreateProyect = async (values: z.infer<typeof projectSchema>) => {
    setLoading(true) 
    try {
      const objectivesArray = values.objectives.split("\n").filter(l => l.trim().length > 0)
      let deliverablesArray = values.deliverables ? values.deliverables.split("\n").filter(l => l.trim().length > 0) : []
      if (values.link && values.link.trim() !== "") { deliverablesArray.push(values.link.trim()); }
      
      const initialStatus = "pendiente";

      const res = await api.post('/api/projects', {
        name: values.name,
        description: values.description,
        summary: values.summary,
        cycle: values.cycle,
        academic_period: values.academic_period,
        careerId: values.careerId,
        status: initialStatus,
        objectives: objectivesArray,
        deliverables: deliverablesArray, 
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        createdBy: userId,
      });

      const projectId = res.data.id;
      
      if (projectId && selectedSkills.length > 0) {
        await Promise.all(selectedSkills.map(skillId =>
          api.post('/api/porjects-skills', { projectId, skillId })
        )).catch(e => console.log("Error menor guardando skills:", e));
      }

      setIsCreateOpen(false); 
      createProjectForm.reset();
      setSelectedSkills([]);

      fetchProjects();
      fetchUserProjects();
      fetchSkillsData();

      setLoading(false);

      setTimeout(() => {
        showSuccess("Proyecto guardado correctamente");
      }, 300);

    } catch (error) {
      setLoading(false); 
      console.error(error);
      showError("Hubo un problema al crear el proyecto.");
    }
  };

  const handleApproveProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await api.patch(`/api/projects/${project.id}`, { status: "en progreso" });
      await fetchProjects();
      
      setLoading(false);
      setTimeout(() => {
         showSuccess("Proyecto aceptado");
      }, 300);

    } catch (error) {
      setLoading(false);
      showError("Error al aprobar.");
    }
  };

  const handleEditProyect = async (values: z.infer<typeof projectSchema>) => {
    if (!editingProject) return
    setLoading(true)
    try {
      const objectivesArray = values.objectives.split("\n").filter(l => l.trim().length > 0)
      let deliverablesArray = values.deliverables ? values.deliverables.split("\n").filter(l => l.trim().length > 0) : []
      if (values.link && values.link.trim() !== "") { deliverablesArray.push(values.link.trim()); }

      await api.patch(`/api/projects/${editingProject.id}`, {
        name: values.name,
        description: values.description,
        summary: values.summary,
        cycle: values.cycle,
        academic_period: values.academic_period,
        careerId: values.careerId,
        status: values.status, 
        objectives: objectivesArray,
        deliverables: deliverablesArray,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });

      const currentRelations = projectSkills.filter(ps => ps.projectId === editingProject.id);
      const currentSkillIds = currentRelations.map(ps => ps.skillId);
      const skillsToAdd = selectedSkills.filter(sid => !currentSkillIds.includes(sid));

      if (skillsToAdd.length > 0) {
        await Promise.all(skillsToAdd.map(skillId =>
          api.post('/api/porjects-skills', { projectId: editingProject.id, skillId })
        ));
      }
      
      await fetchProjects();
      await fetchSkillsData();
      setIsEditOpen(false)

      setLoading(false);
      setTimeout(() => {
        showSuccess("Cambios guardados");
      }, 300);

    } catch (error) {
      setLoading(false);
      showError("Error al editar.");
    }
  };

  const handleDeleteProyect = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setLoading(true)
    try {
      await api.delete(`/api/projects/${id}`)
      await fetchProjects()
      await fetchSkillsData()
      
      setLoading(false);
      setTimeout(() => {
        showSuccess("Proyecto eliminado");
      }, 300);

    } catch (error) {
      setLoading(false);
      showError("No se pudo eliminar.");
    }
  }

  const loadProjectData = (project: Project) => {
    setEditingProject(project)
    const existingSkillIds = projectSkills
      .filter(ps => ps.projectId === project.id)
      .map(ps => ps.skillId);
    setSelectedSkills(existingSkillIds);

    const { link, textItems } = parseDeliverables(project.deliverables || []);

    editProjectForm.reset({
      name: project.name,
      description: project.description,
      summary: project.summary || "",
      deliverables: textItems.join("\n") || "",
      link: link || "",
      cycle: project.cycle,
      academic_period: project.academic_period,
      startDate: project.startDate ? project.startDate.split('T')[0] : "",
      endDate: project.endDate ? project.endDate.split('T')[0] : "",
      careerId: project.careerId,
      objectives: project.objectives?.join("\n") || "",
      status: project.status
    })
    setIsEditOpen(true)
  };

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  }

  const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(manageSkillSearch.toLowerCase()));
  const mySkillsList = filteredSkills.filter(s => s.createdById === userId);
  const otherSkillsList = filteredSkills.filter(s => s.createdById !== userId);

  // --- COMPONENTE DE TARJETA ---
  const SkillCardItem = ({ skill, canEdit }: { skill: Skill, canEdit: boolean }) => {
    const isVisible = visibleDescriptions[skill.id];
    const isOwner = skill.createdById === userId;

    if (!isOwner && !canEdit) {
       return (
         <Card className="bg-gray-900 border border-gray-800 p-1 flex items-center justify-center shadow-sm hover:border-cyan-500/30 transition-colors h-full">
            <div className="flex items-center gap-1 overflow-hidden w-full">
               <div className="p-0.5 rounded-md bg-gray-800/50 text-cyan-500/70 shrink-0">
                 <Code2 className="w-3 h-3" />
               </div>
               <span className="text-xs font-bold text-gray-300 whitespace-normal leading-tight text-left w-full" title={skill.name}>
                 {skill.name}
               </span>
            </div>
         </Card>
       )
    }

    return (
      <Card className="group relative bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-cyan-900/20 p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/0 via-cyan-900/0 to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-800 bg-gray-950/30 gap-2">
          <div className="p-0.5 rounded-md bg-gray-800 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-base text-gray-100 whitespace-normal leading-tight flex-1 text-center" title={skill.name}>
            {skill.name}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 shrink-0 transition-colors rounded-full p-0 ${isVisible ? "text-cyan-400 bg-cyan-950/50" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"}`}
            onClick={() => toggleVisibility(skill.id)}
            title={isVisible ? "Ocultar" : "Ver"}
          >
            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="relative" style={{ minHeight: isVisible ? '3rem' : 'auto', maxHeight: isVisible ? '5.5rem' : 'auto' }}> 
           {isVisible ? (
             <div className="h-full overflow-y-auto px-2 custom-scrollbar">
               <p className="text-xs text-gray-300 leading-snug">
                 {skill.description}
               </p>
             </div>
           ) : (
             <div className="flex items-center justify-center text-gray-700 py-2">
                <Lock className="w-3 h-3 opacity-50" />
             </div>
           )}
        </div>
        
        {canEdit && (
          <div className="flex border-t border-gray-800 divide-x divide-gray-800 bg-gray-950/20">
            <button
              onClick={() => {
                setEditSkillName(skill.name);
                setEditSkillDesc(skill.description);
                setEditingSkill(skill);
              }}
              className="flex-1 flex items-center justify-center py-1.5 text-xs font-semibold text-yellow-500/80 hover:text-yellow-400 hover:bg-yellow-950/30 transition-colors gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={() => setSkillToDelete(skill)}
              className="flex-1 flex items-center justify-center py-1.5 text-xs font-semibold text-red-500/80 hover:text-red-400 hover:bg-red-950/30 transition-colors gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </Card>
    )
  }

  const renderFormFields = (form: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Nombre del Proyecto</FormLabel><FormControl><Textarea className="bg-gray-900 border-gray-600 mt-1" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Problemática</FormLabel><FormControl><Textarea className="bg-gray-900 border-gray-600 mt-1" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="summary" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Resumen</FormLabel><FormControl><Textarea className="bg-gray-900 border-gray-600 mt-1" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="cycle" render={({ field }) => (
        <FormItem><FormLabel className="text-gray-300">Ciclo</FormLabel><FormControl><select className="w-full mt-1 p-2 rounded-md bg-gray-900 border border-gray-600 text-sm text-white" {...field}><option value="">Seleccionar...</option><option>Primer Ciclo</option><option>Segundo Ciclo</option><option>Tercer Ciclo</option><option>Cuarto Ciclo</option></select></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="academic_period" render={({ field }) => (
        <FormItem><FormLabel className="text-gray-300">Periodo</FormLabel><FormControl><select className="w-full mt-1 p-2 rounded-md bg-gray-900 border border-gray-600 text-sm text-white" {...field}><option value="">Seleccionar...</option><option>Sep 2025 - Feb 2026</option><option>Mar 2026 - Ago 2026</option><option>Sep 2026 - Feb 2027</option><option>Mar 2027 - Ago 2027</option></select></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="startDate" render={({ field }) => (
        <FormItem><FormLabel className="text-gray-300">Fecha Inicio</FormLabel><FormControl><Input type="date" className="bg-gray-900 border-gray-600 mt-1" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="endDate" render={({ field }) => (
        <FormItem><FormLabel className="text-gray-300">Fecha Fin</FormLabel><FormControl><Input type="date" className="bg-gray-900 border-gray-600 mt-1" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="careerId" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Carrera</FormLabel><FormControl><select className="w-full mt-1 p-2 rounded-md bg-gray-900 border border-gray-600 text-sm text-white" {...field}><option value="">Seleccionar carrera...</option>{careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      
      <div className="md:col-span-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <Label className="text-cyan-400 font-bold mb-3 block items-center gap-2"><Code2 className="w-4 h-4" /> Habilidades Requeridas</Label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} type="text" placeholder="Buscar habilidad..." className="pl-9 bg-gray-800 border-gray-600 text-white text-sm h-9" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {skills.filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase())).map((skill) => {
            const isSelected = selectedSkills.includes(skill.id);
            return (
              <div 
                key={skill.id} 
                onClick={() => toggleSkillSelection(skill.id)}
                className={`
                  relative flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200 group
                  ${isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_10px_-4px_rgba(6,182,212,0.5)]' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                  }
                `}
              >
                <div className={`
                  w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0
                  ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500 group-hover:border-cyan-400'}
                `}>
                  {isSelected && <Check className="w-3 h-3 text-black font-bold" />}
                </div>
                
                <span className={`text-xs font-medium whitespace-normal leading-tight ${isSelected ? 'text-cyan-100' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {skill.name}
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">{selectedSkills.length} seleccionadas</p>
      </div>

      <FormField control={form.control} name="objectives" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Objetivos</FormLabel><FormControl><Textarea className="bg-gray-900 border-gray-600 mt-1 h-32" placeholder="- Objetivo 1&#10;" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="deliverables" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Entregables (Texto)</FormLabel><FormControl><Textarea className="bg-gray-900 border-gray-600 mt-1 h-32" placeholder="- Entregable 1&#10;" {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="link" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300 flex items-center gap-2"><LinkIcon className="w-3 h-3" /> Enlace de Repositorio/Drive</FormLabel><FormControl><Input className="bg-gray-900 border-gray-600 mt-1" placeholder="https://..." {...field} /></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
      <FormField control={form.control} name="status" render={({ field }) => (
        <FormItem className="md:col-span-2"><FormLabel className="text-gray-300">Estado del proyecto</FormLabel><FormControl><select className="w-full mt-1 p-2 rounded-md bg-gray-900 border border-gray-600 text-sm text-white" {...field}><option value="">Selecciona un estado...</option><option value="en progreso">En progreso</option><option value="completado">Completado</option></select></FormControl><FormMessage className="text-red-500 text-xs" /></FormItem>
      )} />
    </div>
  )

  return (
    <div className="flex bg-gray-900 min-h-screen text-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6 transition-all w-full overflow-x-hidden relative">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div className="flex-shrink-0">
            <h2 className="text-3xl font-bold text-white tracking-tight">Panel de Proyectos</h2>
            <p className="text-gray-400 text-sm mt-1">Gestión de proyectos - Sudamericano</p>
          </div>

          <div className="flex flex-col w-full xl:w-auto gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Botón NUEVO PROYECTO */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-lg shadow-cyan-900/20 whitespace-nowrap" onClick={() => { createProjectForm.reset(); setSelectedSkills([]) }}>
                    + Nuevo Proyecto
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-cyan-400">Crear Nuevo Proyecto</DialogTitle>
                  </DialogHeader>
                  <Form {...createProjectForm}>
                    <form onSubmit={createProjectForm.handleSubmit(handleCreateProyect)}>
                      {renderFormFields(createProjectForm)}
                      <DialogFooter>
                        <Button type="button" variant="ghost" className="hover:bg-gray-700" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={loading}>{loading ? "Creando..." : "Guardar Proyecto"}</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 p-1">
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wide">Estado</h5>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Badge key={status} onClick={() => setFilterStatus(status)} variant={filterStatus === status ? "default" : "outline"} className={`cursor-pointer px-3 py-1 transition-all ${filterStatus === status ? "bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600" : "text-gray-400 border-gray-600 hover:border-cyan-500 hover:text-cyan-400"}`}>
                      {capitalizeFirst(status)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-purple-400/80 uppercase tracking-wide">Origen</h5>
                <div className="flex flex-wrap gap-2">
                  {statusUserProjects.map((option) => (
                    <Badge key={option} onClick={() => setFilterStatusUserProjects(option)} variant={filterStatusUserProjects === option ? "default" : "outline"} className={`cursor-pointer px-3 py-1 transition-all ${filterStatusUserProjects === option ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600" : "text-gray-400 border-gray-600 hover:border-purple-500 hover:text-purple-400"}`}>
                      {capitalizeFirst(option)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL (TABLA) */}
        {loadingProjects ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
            <p className="text-gray-400">Cargando proyectos...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-900/30 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Directorio Completo de Proyectos</h2>
                
                <Dialog open={isSkillsManagerOpen} onOpenChange={setIsSkillsManagerOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2 shadow-lg">
                      <Zap className="w-4 h-4" /> Gestionar Habilidades
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="w-[95vw] max-w-sm bg-gray-900 border-gray-700 text-white flex flex-col max-h-[80vh]">
                    
                    <DialogHeader className="flex flex-col gap-2 pr-3.5">
                        <div className="flex items-center justify-between">
                          <DialogTitle className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Habilidades
                          </DialogTitle>
                          
                          <Dialog open={isCreateSkillOpen} onOpenChange={setIsCreateSkillOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/20 gap-2 h-7 text-xs">
                                <Plus className="w-3 h-3" /> Nueva
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 text-white z-[60]">
                              <DialogHeader><DialogTitle>Crear Nueva Habilidad</DialogTitle></DialogHeader>
                              <Form {...createSkillForm}>
                                <form onSubmit={createSkillForm.handleSubmit(handleCreateSkill)} className="space-y-4 py-4">
                                  <FormField control={createSkillForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input className="bg-gray-900 border-gray-600" {...field} /></FormControl><FormMessage /></FormItem>
                                  )} />
                                  <FormField control={createSkillForm.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input className="bg-gray-900 border-gray-600" {...field} /></FormControl><FormMessage /></FormItem>
                                  )} />
                                  <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsCreateSkillOpen(false)}>Cancelar</Button>
                                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={loading}>Crear</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        <div className="flex p-1 bg-gray-800 rounded-lg border border-gray-700 mt-1">
                          <button 
                            onClick={() => setActiveTab("mine")}
                            className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-1.5 rounded-md transition-all ${activeTab === "mine" ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                          >
                            <User className="w-3 h-3" /> Mis Habilidades
                          </button>
                          <button 
                            onClick={() => setActiveTab("community")}
                            className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-1.5 rounded-md transition-all ${activeTab === "community" ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                          >
                            <Globe className="w-3 h-3" /> Comunidad Global
                          </button>
                        </div>

                        <div className="relative mt-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <Input 
                            value={manageSkillSearch} 
                            onChange={(e) => setManageSkillSearch(e.target.value)} 
                            type="text" 
                            placeholder="Buscar habilidad..." 
                            className="pl-8 bg-gray-800 border-gray-600 text-white text-xs h-8" 
                          />
                        </div>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto pr-1 mt-2">
                      
{activeTab === "mine" && (
  <div className="space-y-2">
    {mySkillsList.length === 0 ? (
       <div className="text-center p-8 border border-dashed border-gray-700 rounded-xl text-gray-500 text-xs">
         No tienes habilidades creadas aún.
       </div>
     ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"> 
         {mySkillsList.map(skill => (
            <SkillCardItem key={skill.id} skill={skill} canEdit={true} />
         ))}
       </div>
     )}
  </div>
)}

{activeTab === "community" && (
  <div className="space-y-2">
    {otherSkillsList.length === 0 ? (
       <div className="text-center p-8 border border-dashed border-gray-700 rounded-xl text-gray-500 text-xs">
         No hay habilidades de la comunidad.
       </div>
     ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"> 
         {otherSkillsList.map(skill => (
            <SkillCardItem key={skill.id} skill={skill} canEdit={isAdmin || false} />
         ))}
       </div>
     )}
  </div>
)}

                    </div>
                  </DialogContent>
                </Dialog>

              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-900/50">
                    <TableRow className="border-gray-700 hover:bg-gray-900/50">
                      <TableHead className="text-gray-300 font-bold min-w-[250px]">Proyecto</TableHead>
                      <TableHead className="text-gray-300 font-bold">Detalles & Habilidades</TableHead>
                      <TableHead className="text-gray-300 font-bold min-w-[250px]">Objetivos</TableHead>
                      <TableHead className="text-gray-300 font-bold min-w-[250px]">Entregables</TableHead>
                      <TableHead className="text-gray-300 font-bold min-w-[150px]">Fechas & Estado</TableHead>
                      <TableHead className="text-gray-300 font-bold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">No se encontraron proyectos.</TableCell></TableRow>
                    ) : (
                      projects.filter(p => {
                        const careerName = careers.find((c) => c.id === p.careerId)?.name
                        const term = search.toLowerCase();
                        const projectSkillsList = getProjectSkillsDisplay(p.id);
                        const hasSkill = projectSkillsList.some(s => s.name.toLowerCase().includes(term));
                        const matchesSearch = (
                          (p.name && p.name.toLowerCase().includes(term)) ||
                          (p.description && p.description.toLowerCase().includes(term)) ||
                          (careerName && careerName.toLowerCase().includes(term)) ||
                          hasSkill
                        );
                        const matchesStatus = filterStatus === "Todo" || p.status === filterStatus;
                        const isOwner = p.createdBy === userId || userProjects.some(up => up.id === p.id);
                        const matchesUser = filterStatusUserProjects === "Todo" || (filterStatusUserProjects === "Mis proyectos" && isOwner);
                        if (!isAdmin && !isOwner && p.status === "pendiente") return false;
                        return matchesSearch && matchesStatus && matchesUser;
                      }).map((p) => {
                        const careerName = careers.find((c) => c.id === p.careerId)?.name;
                        const isOwner = p.createdBy === userId || userProjects.some((up) => up.id === p.id);
                        const mySkills = getProjectSkillsDisplay(p.id);
                        const { link, textItems } = parseDeliverables(p.deliverables || []);

                        return (
                          <TableRow 
                            key={p.id} 
                            className={`border-gray-700 transition-colors group align-top cursor-pointer 
                              ${p.status === 'pendiente' 
                                ? 'bg-red-950/20 hover:bg-red-900/30' // Rojo para pendientes
                                : 'hover:bg-gray-700/30' // Gris normal para el resto
                              }`} 
                            onClick={() => { setViewProject(p); setIsViewOpen(true); }}
                          >
                            <TableCell className="py-4 align-top">
                              <div className="space-y-2">
                                <p className="text-white font-bold text-lg leading-tight truncate w-[375px]" title={p.name}>{p.name}</p>
                                <div className="space-y-1 text-sm text-gray-400">
                                  <div className="flex items-center gap-2"><GraduationCap className="w-3 h-3" /> {careerName || "Sin Carrera"}</div>
                                  <div className="flex items-center gap-2"><BookOpen className="w-3 h-3" /> {p.cycle}</div>
                                  <div className="flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> {p.academic_period}</div>
                                  <div className="flex items-center gap-2"><User2 className="w-3 h-3" />{p.user?.name || "Desconocido"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 align-top">
                              <div className="space-y-3 w-[300px] whitespace-normal">
                                <div>
                                  <span className="text-xs font-semibold text-gray-500 uppercase">Problemática</span>
                                  <p className="text-sm text-gray-300 leading-relaxed break-words line-clamp-3">{p.description}</p>
                                </div>
                                {p.summary && (
                                  <div className="bg-gray-900/40 p-2 rounded border border-gray-700/50">
                                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Resumen</span>
                                    <p className="text-xs text-gray-400 italic break-words line-clamp-2">{p.summary}</p>
                                  </div>
                                )}
                                
                                {mySkills.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {mySkills.map(sk => (
                                      <Badge 
                                        key={sk.id} 
                                        variant="secondary" 
                                        className="bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/60 hover:text-cyan-200 text-[10px] px-2 py-0.5 transition-colors"
                                      >
                                        {sk.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 align-top max-w-[350px]">
                              {p.objectives && p.objectives.length > 0 ? (
                                <div className="space-y-1">
                                  {p.objectives.slice(0, 3).map((obj, i) => (
                                    <div key={i} className="text-sm text-gray-400 leading-snug break-words whitespace-normal" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{obj}</div>
                                  ))}
                                  {p.objectives.length > 3 && <div className="text-xs text-cyan-500 italic">... y {p.objectives.length - 3} más</div>}
                                </div>
                              ) : <span className="text-xs text-gray-600 italic">Sin objetivos registrados</span>}
                            </TableCell>
                            <TableCell className="py-4 align-top max-w-[350px]">
                              {textItems && textItems.length > 0 ? (
                                <div className="space-y-1">
                                  {textItems.slice(0, 3).map((del, i) => (
                                    <div key={i} className="text-sm text-gray-400 leading-snug break-words whitespace-normal" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{del}</div>
                                  ))}
                                  {textItems.length > 3 && <div className="text-xs text-cyan-500 italic">... y {textItems.length - 3} más</div>}
                                </div>
                              ) : <span className="text-xs text-gray-600 italic">Sin entregables</span>}
                              {link && (
                                <div className="mt-2">
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline" onClick={(e) => e.stopPropagation()}><LinkIcon className="w-3 h-3" /> Ver enlace</a>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-4 align-top">
                              <div className="space-y-3">
                                {p.status === 'pendiente' ? (
                                  <Badge variant="outline" className="text-red-400 border-red-900 bg-red-900/20 flex w-fit items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</Badge>
                                ) : (
                                  <Badge variant="outline" className={`${p.status === 'Finalizado' || p.status === 'completado' ? 'text-green-400 border-green-900 bg-green-900/20' : 'text-cyan-400 border-cyan-900 bg-cyan-900/20'}`}>{capitalizeFirst(p.status) || "N/A"}</Badge>
                                )}
                                <div className="text-xs text-gray-400">
                                  <div className="mb-1"><span className="text-gray-600">Inicio:</span> <br />{formatDate(p.startDate)}</div>
                                  <div><span className="text-gray-600">Fin:</span> <br />{formatDate(p.endDate)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 align-top text-right">
                              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                {isAdmin && p.status === 'pendiente' && (
                                  <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white mr-2" title="Aprobar Proyecto" onClick={(e) => handleApproveProject(e, p)}><Check className="w-4 h-4" /></Button>
                                )}
                                {(isAdmin || isOwner) && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/20" onClick={() => loadProjectData(p)}><Pencil className="w-4 h-4" /></Button>
                                )}
                                {isAdmin && (
                                  <Dialog>
                                    <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button></DialogTrigger>
                                    <DialogContent className="bg-gray-800 border-gray-700 text-white"><DialogHeader><DialogTitle>¿Eliminar Proyecto?</DialogTitle></DialogHeader><DialogDescription className="text-gray-400">Esta acción no se puede deshacer.</DialogDescription><DialogFooter><Button className="bg-red-600 hover:bg-red-700" onClick={(e) => handleDeleteProyect(e, p.id)}>Confirmar Eliminación</Button></DialogFooter></DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* --- ALERTAS UNIFICADAS Y DE ALTA VISIBILIDAD --- */}
            {/* Z-INDEX SUPREMO (z-[10002]) PARA QUE NADA LO TAPE */}
            
            {success && (
              <div className="fixed top-5 right-5 z-[10002] animate-in slide-in-from-right fade-in duration-300">
                <Alert className="w-auto bg-green-600 border-green-500 text-white shadow-2xl flex items-center gap-3 pr-6">
                  <CheckCircle2Icon className="h-6 w-6 text-white" />
                  <div>
                    <AlertTitle className="text-white font-bold text-lg">Éxito</AlertTitle>
                    <AlertDescription className="text-white/90 font-medium text-base">
                      {successMessage}
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
            )}

            {errorAlert && (
               <div className="fixed top-5 right-5 z-[10002] animate-in slide-in-from-right fade-in duration-300">
                <Alert className="w-auto bg-red-600 border-red-500 text-white shadow-2xl flex items-center gap-3 pr-6">
                  <AlertCircleIcon className="h-6 w-6 text-white" />
                  <div>
                    <AlertTitle className="text-white font-bold text-lg">Error</AlertTitle>
                    <AlertDescription className="text-white/90 font-medium text-base">
                      {errorMessage}
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
            )}

          </div>
        )}
      </main>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white z-[90]">
          <DialogHeader><DialogTitle className="text-xl font-bold text-cyan-400">Editar Proyecto</DialogTitle></DialogHeader>
          <Form {...editProjectForm}>
            <form onSubmit={editProjectForm.handleSubmit(handleEditProyect)}>
              {renderFormFields(editProjectForm)}
              <DialogFooter>
                <Button type="button" variant="ghost" className="hover:bg-gray-700" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
<Dialog open={!!editingSkill} onOpenChange={(open) => !open && setEditingSkill(null)}>
  <DialogContent className="bg-gray-800 border-gray-700 text-white z-[70]">
    <DialogHeader><DialogTitle>Editar Habilidad</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={editSkillName} onChange={(e) => setEditSkillName(e.target.value)} className="bg-gray-900 border-gray-600" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={editSkillDesc} onChange={(e) => setEditSkillDesc(e.target.value)} className="bg-gray-900 border-gray-600" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingSkill(null)}>Cancelar</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleUpdateSkill}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!skillToDelete} onOpenChange={(open) => !open && setSkillToDelete(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white z-[80] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-5 h-5" /> Eliminar Habilidad
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              ¿Estás seguro de que deseas eliminar la habilidad <span className="text-white font-bold">"{skillToDelete?.name}"</span>?
              <br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSkillToDelete(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteSkill}>
              Eliminar Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={(open) => { setIsViewOpen(open); if (!open) { navigate('/projects'); } }}>
        <DialogContent className="w-[95vw] md:w-full md:max-w-4xl bg-slate-900 border-slate-700 text-slate-100 p-0 z-[60]">
          <div className="max-h-[85vh] overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 break-words">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2"><FileText className="w-6 h-6" /> {viewProject?.name}</DialogTitle>
              <DialogDescription className="text-slate-400">Detalles completos del proyecto</DialogDescription>
            </DialogHeader>
            {viewProject && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-lg">
                  <div><h4 className="text-xs font-bold text-cyan-500 uppercase mb-1">Carrera</h4><p className="text-sm">{careers.find(c => c.id === viewProject.careerId)?.name || "N/A"}</p></div>
                  <div><h4 className="text-xs font-bold text-cyan-500 uppercase mb-1">Periodo & Ciclo</h4><p className="text-sm">{viewProject.academic_period} - {viewProject.cycle}</p></div>
                  <div><h4 className="text-xs font-bold text-cyan-500 uppercase mb-1">Fechas</h4><p className="text-sm text-slate-300">{formatDate(viewProject.startDate)} al {formatDate(viewProject.endDate)}</p></div>
                  <div><h4 className="text-xs font-bold text-cyan-500 uppercase mb-1">Estado</h4><Badge variant="outline" className="text-cyan-300 border-cyan-700">{viewProject.status}</Badge></div>
                </div>
                <div><h3 className="text-lg font-semibold text-white mb-2 border-b border-slate-700 pb-1">Problemática</h3><div className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words bg-slate-950/30 p-3 rounded-md border border-slate-800 overflow-hidden">{viewProject.description}</div></div>
                {viewProject.summary && (<div><h3 className="text-lg font-semibold text-white mb-2 border-b border-slate-700 pb-1">Resumen Ejecutivo</h3><div className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words bg-slate-950/30 p-3 rounded-md border border-slate-800 overflow-hidden">{viewProject.summary}</div></div>)}
                {viewProject.objectives?.length > 0 && (<div><h3 className="text-lg font-semibold text-white mb-2 border-b border-slate-700 pb-1">Objetivos</h3><div className="pl-5 space-y-2 text-slate-300 break-words">{viewProject.objectives.map((obj, i) => <div key={i}>{obj}</div>)}</div></div>)}
                {viewProject.deliverables?.length > 0 && (() => {
                  const { link, textItems } = parseDeliverables(viewProject.deliverables);
                  return (<div><h3 className="text-lg font-semibold text-white mb-2 border-b border-slate-700 pb-1">Entregables</h3>{textItems.length > 0 ? (<div className="pl-5 space-y-2 text-slate-300 break-words">{textItems.map((obj, i) => <div key={i}>{obj}</div>)}</div>) : (<p className="text-sm text-slate-500 italic">Sin entregables de texto</p>)}{link && (<div className="mt-4 pl-5"><a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 hover:underline bg-cyan-950/30 px-3 py-2 rounded border border-cyan-800"><ExternalLink className="w-4 h-4" /> Abrir enlace de repositorio/drive</a></div>)}</div>);
                })()}
                <div><h3 className="text-lg font-semibold text-white mb-2 border-b border-slate-700 pb-1">Tecnologías / Skills</h3><div className="flex flex-wrap gap-2">{getProjectSkillsDisplay(viewProject.id).map(skill => (<Badge key={skill.id} className="bg-slate-700 hover:bg-slate-600 text-white">{skill.name}</Badge>))}</div></div>
              </div>
            )}
            <DialogFooter><Button onClick={() => setIsViewOpen(false)} className="bg-cyan-600 hover:bg-cyan-700 text-white">Cerrar</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <LoadingOverlay isVisible={loading} message="Procesando..." />
    </div>
  )
}
export default ProyectPage