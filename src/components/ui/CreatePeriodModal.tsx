import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/api/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const periodSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto"),
});

interface Props {
  onSuccess: () => void;
}

export function CreatePeriodModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ 
    resolver: zodResolver(periodSchema) 
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/api/period', data);
      reset();
      setOpen(false);
      onSuccess(); 
    } catch (error) {
      console.error(error);
      alert("Error al crear. Verifica que eres ADMIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-8 px-3 text-cyan-400 border-cyan-800 bg-cyan-950/30 hover:bg-cyan-900 hover:text-cyan-300 text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Nuevo Periodo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Nuevo Periodo Académico</DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Ingresa el nombre del periodo para registrarlo en el sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Nombre del Periodo</Label>
            <Input 
              {...register('name')} 
              placeholder="Ej: Nov 2025 - Mar 2026" 
              className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500" 
            />
            {errors.name && <p className="text-red-400 text-xs">{String(errors.name.message)}</p>}
          </div>
          <div className="flex justify-end pt-2">
             <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {loading ? "Guardando..." : "Crear Periodo"}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}