import { useState } from 'react';
import api from '../../api/axios'; 
import { useAuthStore } from '../../store/authStore';
import { Button } from './button'; 
import { Input } from './input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Trash2, Plus, CalendarClock } from 'lucide-react'; 

interface Period {
    id: string;
    name: string;
}

export function PeriodManager() {
    const { userRole } = useAuthStore();
    const [periods, setPeriods] = useState<Period[]>([]);
    const [newPeriod, setNewPeriod] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchPeriods = async () => {
        try {
            const { data } = await api.get('/projects/periods');
            setPeriods(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async () => {
        if (!newPeriod.trim()) return;
        setLoading(true);
        try {
            await api.post('/projects/periods', { name: newPeriod });
            setNewPeriod("");
            fetchPeriods(); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar?")) return;
        try {
            await api.delete(`/projects/periods/${id}`);
            fetchPeriods();
        } catch (error) {
            console.error(error);
        }
    };

    // --- MODO DIAGNÓSTICO ---
    // NO HAY IF, SIEMPRE SE MUESTRA
    
    return (
        <div className="flex items-center gap-2">
            
            {/* ESTA ETIQUETA NOS DIRÁ EL NOMBRE EXACTO */}
            <div className="bg-red-600 text-white font-bold px-3 py-1 rounded text-xs border-2 border-yellow-400">
                TU ROL ES: "{userRole}"
            </div>

            <Dialog onOpenChange={(open: boolean) => open && fetchPeriods()}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-cyan-400 border-cyan-500">
                        <CalendarClock className="w-4 h-4" />
                        Gestionar
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Periodos</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 my-4">
                        <Input 
                            placeholder="Nuevo..." 
                            value={newPeriod}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPeriod(e.target.value)}
                            className="bg-gray-800 text-white"
                        />
                        <Button onClick={handleCreate} disabled={loading}><Plus className="w-4 h-4"/></Button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {periods.map((p) => (
                            <div key={p.id} className="flex justify-between p-2 border border-gray-700 rounded">
                                <span>{p.name}</span>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}