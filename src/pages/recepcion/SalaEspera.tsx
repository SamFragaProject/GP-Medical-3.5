
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Clock,
    UserPlus,
    CheckCircle2,
    Bell,
    Volume2,
    MoreHorizontal,
    ChevronRight,
    Search,
    Filter,
    Stethoscope,
    AlertCircle,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { PremiumHeader } from '@/components/ui/PremiumHeader';
import { receptionService, TicketCola } from '@/services/receptionService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SalaEspera() {
    const { user } = useAuth();
    const [queue, setQueue] = useState<TicketCola[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.empresa_id) {
            loadQueue();
            const interval = setInterval(loadQueue, 15000); // Polling cada 15s
            return () => clearInterval(interval);
        }
    }, [user?.empresa_id]);

    const loadQueue = async () => {
        try {
            const data = await receptionService.getWaitingQueue(user?.empresa_id!);
            setQueue(data);
        } catch (error) {
            console.error('Error loading queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCallPatient = async (ticket: TicketCola) => {
        try {
            await receptionService.callPatient(ticket.id);
            toast.success(`Llamando a ${ticket.paciente?.nombre} ${ticket.paciente?.apellido}`, {
                icon: '🔊',
                duration: 5000
            });
            loadQueue();
        } catch (error) {
            toast.error('Error al llamar al paciente');
        }
    };

    const handleStartConsultation = async (ticket: TicketCola) => {
        try {
            await receptionService.startConsultation(ticket.id);
            toast.success('Consulta iniciada');
            loadQueue();
        } catch (error) {
            toast.error('Error al iniciar consulta');
        }
    };

    const filteredQueue = queue.filter(t =>
        t.paciente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.paciente?.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: queue.length,
        espera: queue.filter(t => t.estado === 'espera').length,
        llamados: queue.filter(t => t.estado === 'llamado').length,
        enConsulta: queue.filter(t => t.estado === 'en_consulta').length
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <PremiumHeader
                title="Sala de Espera"
                subtitle="Gestión de flujo de pacientes en tiempo real"
                gradient={true}
                badges={[
                    { text: "En Vivo", variant: "success", icon: <Activity className="w-3 h-3 animate-pulse" /> }
                ]}
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumMetricCard
                    title="Total en Sala"
                    value={stats.total}
                    subtitle="Pacientes hoy"
                    icon={Users}
                    gradient="blue"
                />
                <PremiumMetricCard
                    title="En Espera"
                    value={stats.espera}
                    subtitle="Pendientes de llamado"
                    icon={Clock}
                    gradient="amber"
                />
                <PremiumMetricCard
                    title="Ya Llamados"
                    value={stats.llamados}
                    subtitle="Por presentarse"
                    icon={Bell}
                    gradient="purple"
                />
                <PremiumMetricCard
                    title="En Consulta"
                    value={stats.enConsulta}
                    subtitle="Atención activa"
                    icon={Stethoscope}
                    gradient="emerald"
                />
            </div>

            <Card className="border-0 shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center py-6">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            Cola de Atención
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar paciente..."
                                className="pl-10 h-10 bg-white border-slate-200 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        <AnimatePresence mode='popLayout'>
                            {filteredQueue.length > 0 ? filteredQueue.map((ticket, idx) => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-all group ${ticket.estado === 'llamado' ? 'bg-indigo-50/50' : ''}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${ticket.prioridad === 'urgente'
                                            ? 'bg-rose-100 text-rose-600'
                                            : ticket.prioridad === 'preferencial'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {ticket.paciente?.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900 leading-none">
                                                    {ticket.paciente?.nombre} {ticket.paciente?.apellido}
                                                </h3>
                                                <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-wider ${ticket.tipo_registro === 'nuevo_paciente' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-blue-200 text-blue-600 bg-blue-50'
                                                    }`}>
                                                    {ticket.tipo_registro === 'nuevo_paciente' ? 'Nuevo' : 'Cita'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Llegó {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MoreHorizontal className="w-3 h-3" />
                                                    {ticket.motivo_visita || 'Consulta General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right mr-4 hidden md:block">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</div>
                                            <Badge className={`border-0 uppercase text-[10px] font-black ${ticket.estado === 'espera' ? 'bg-amber-500' :
                                                ticket.estado === 'llamado' ? 'bg-indigo-600 animate-pulse' :
                                                    'bg-emerald-500'
                                                }`}>
                                                {ticket.estado.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            {ticket.estado === 'espera' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-xl"
                                                    onClick={() => handleCallPatient(ticket)}
                                                >
                                                    <Volume2 className="w-4 h-4 mr-2" /> Llamar
                                                </Button>
                                            )}
                                            {(ticket.estado === 'espera' || ticket.estado === 'llamado') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                                    onClick={() => handleStartConsultation(ticket)}
                                                >
                                                    <ChevronRight className="w-4 h-4 mr-2" /> Atender
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-20 text-center text-slate-400"
                                >
                                    <Users className="w-16 h-14 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-bold text-slate-600">No hay pacientes en sala</h3>
                                    <p className="text-sm">Las llegadas del Kiosco aparecerán aquí automáticamente.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
