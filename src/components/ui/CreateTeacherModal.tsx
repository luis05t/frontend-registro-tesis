import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import api from "@/api/axios";

// Esquema de validación para el docente
const teacherSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  careerId: z.string().min(1, "Debes seleccionar una carrera"),
});

export function CreateTeacherModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [careers, setCareers] = useState<{id: string, name: string}[]>([]);

  const form = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: "", email: "", password: "", careerId: "" },
  });

  // Cargar carreras al abrir el modal
  useEffect(() => {
    if (open) {
      api.get('/api/careers?limit=100').then(res => {
         // Ajuste por si tu API devuelve {data: [...]} o [...]
         const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
         setCareers(data);
      }).catch(err => console.error("Error cargando carreras", err));
    }
  }, [open]);

  const onSubmit = async (values: z.infer<typeof teacherSchema>) => {
    setLoading(true);
    try {
      // Llamamos al endpoint exclusivo de admin
      await api.post('/api/users/create-teacher', values);
      
      alert("✅ Docente registrado exitosamente");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al crear docente";
      alert("❌ " + msg);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 gap-3">
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Registrar Docente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Nuevo Docente
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl><Input placeholder="Ej. Juan Pérez" className="bg-gray-900 border-gray-600" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Institucional</FormLabel>
                <FormControl><Input placeholder="docente@sudamericano.edu.ec" type="email" className="bg-gray-900 border-gray-600" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña Inicial</FormLabel>
                <FormControl><Input type="password" placeholder="******" className="bg-gray-900 border-gray-600" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="careerId" render={({ field }) => (
              <FormItem>
                <FormLabel>Carrera Asignada</FormLabel>
                <FormControl>
                  <select className="w-full p-2 rounded-md bg-gray-900 border border-gray-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" {...field}>
                    <option value="">Seleccionar carrera...</option>
                    {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="pt-4">
               <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-gray-700 text-gray-300">Cancelar</Button>
               <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar
               </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}