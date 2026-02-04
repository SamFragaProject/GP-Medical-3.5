import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, Video, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { citasService, pacientesService, Cita } from '@/services/dataService';
import toast from 'react-hot-toast';

export default function PatientAppointments() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [pacienteId, setPacienteId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user?.email) return;

            try {
                // 1. Obtener ID del paciente usando el email del usuario logueado
                const paciente = await pacientesService.getByEmail(user.email);

                if (!paciente) {
                    console.warn('Usuario no encontrado como paciente');
                    setLoading(false);
                    return;
                }

                setPacienteId(paciente.id);

                // 2. Obtener citas del paciente
                const data = await citasService.getByPaciente(paciente.id);
                setAppointments(data || []);

            } catch (error) {
                console.error('Error fetching appointments:', error);
                toast.error('Error al cargar tus citas');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);

    // Filtrar pasadas y futuras
    const now = new Date();
    const upcoming = appointments.filter(a => new Date(a.fecha_hora) >= now);
    const past = appointments.filter(a => new Date(a.fecha_hora) < now).reverse(); // Más recientes primero

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                <p>Cargando tus citas...</p>
            </div>
        );
    }

    if (!pacienteId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 max-w-xs mx-auto text-center">
                <AlertCircle className="w-12 h-12 mb-4 text-amber-500 opacity-50" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Perfil Incompleto</h3>
                <p>Tu usuario no está vinculado a un expediente de paciente. Por favor contacta a administración.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-slate-900">Mis Citas</h1>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 shadow-lg shadow-indigo-200">
                    + Nueva
                </Button>
            </header>

            {/* Próximas */}
            <section>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Próximas</h2>
                <div className="space-y-4">
                    {upcoming.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500">No tienes citas programadas</p>
                        </div>
                    ) : (
                        upcoming.map(apt => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-100 border border-slate-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">
                                            {apt.medico_nombre || 'Dr. Asignado'}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {apt.especialidad || 'Medicina General'}
                                        </p>
                                    </div>
                                    <Badge className={`border-0 uppercase text-[10px] tracking-wider ${apt.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' :
                                            apt.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {apt.estado}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 py-4 border-t border-b border-slate-50 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        {new Date(apt.fecha_hora).toLocaleDateString('es-MX', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        {new Date(apt.fecha_hora).toLocaleTimeString('es-MX', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 text-sm font-semibold shadow-lg shadow-slate-200">
                                        Reprogramar
                                    </Button>
                                    <Button variant="outline" className="flex-1 rounded-xl h-11 text-sm font-semibold border-slate-200 hover:bg-slate-50 text-slate-600">
                                        Detalles
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* Historial */}
            <section className="pt-4 pb-20">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Historial</h2>
                <div className="space-y-3">
                    {past.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No hay historial disponible</p>
                    ) : (
                        past.map(apt => (
                            <div key={apt.id} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${apt.tipo_cita === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {apt.tipo_cita === 'video' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{apt.medico_nombre}</p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {new Date(apt.fecha_hora).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
