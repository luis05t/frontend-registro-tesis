export type Proyect = {
  id: string
  name: string
  description: string
  status: string      // por defecto "in-progress"
  startDate?: string | null
  endDate?: string | null
  careerId: string
  skillsId?: string | null
  createdAt: string
  updatedAt: string   // relación opcional
}