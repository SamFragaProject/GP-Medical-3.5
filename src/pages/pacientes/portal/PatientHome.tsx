import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, ChevronRight, FileText, Pill, Activity, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { citasService, pacientesService } from '@/services/dataService';
import { Link, useNavigate } from 'react-router-dom';

export default function PatientHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [nextAppointment, setNextAppointment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNextAppointment = async () => {
            if (!user?.email) return;

            try {
                const paciente = await pacientesService.getByEmail(user.email);
                if (paciente) {
                    const citas = await citasService.getByPaciente(paciente.id);
                    // Filtrar futuras y ordenar por fecha asc
                    const now = new Date();
                    const next = citas
                        ?.filter((c: any) => new Date(c.fecha_hora) >= now)
                        .sort((a: any, b: any) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())[0];

                    setNextAppointment(next || null);
                }
            } catch (error) {
                console.error('Error fetching next appointment:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNextAppointment();
    }, [user]);

    const patientName = user?.nombre?.split(' ')[0] || 'Paciente';

    return (
        <div className="p-6 space-y-8">
            {/* Header / Saludo */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hola,</h1>
                    <h2 className="text-3xl font-light text-indigo-600">{patientName}</h2>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full bg-slate-100 text-slate-500 relative">
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <Bell className="w-5 h-5" />
                </Button>
            </div>

            {/* Próxima Cita Card (Hero) */}
            <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/pacientes/portal/citas')}
                className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[30px] p-6 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden cursor-pointer"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Calendar className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border border-white/10">
                        Próxima Visita
                    </span>

                    {nextAppointment ? (
                        <>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-4xl font-bold">
                                    {new Date(nextAppointment.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}
                                </span>
                                <span className="text-lg font-medium opacity-80 mb-1">
                                    {new Date(nextAppointment.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
                                </span>
                            </div>
                            <p className="text-xl opacity-90 mb-6 capitalize">
                                {new Date(nextAppointment.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>

                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                                    DR
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{nextAppointment.medico_nombre || 'Médico Asignado'}</p>
                                    <p className="text-xs opacity-70">{nextAppointment.especialidad || 'Consulta General'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-start gap-2 py-4">
                            <CalendarClock className="w-12 h-12 text-white/50 mb-2" />
                            <p className="text-lg font-medium">No tienes citas programadas</p>
                            <Button size="sm" variant="secondary" className="mt-2 bg-white/20 hover:bg-white/30 text-white border-0">
                                Agendar Cita
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Accesos Rápidos */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate('/pacientes/portal/salud')}
                    className="h-auto aspect-square flex flex-col gap-3 rounded-[24px] border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all bg-white shadow-sm"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700">Resultados</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => navigate('/pacientes/portal/salud')}
                    className="h-auto aspect-square flex flex-col gap-3 rounded-[24px] border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all bg-white shadow-sm"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Pill className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700">Recetas</span>
                </Button>
            </div>

            {/* Banner Informativo */}
            <div className="bg-amber-50 rounded-[24px] p-6 border border-amber-100 flex items-center gap-4 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => navigate('/pacientes/portal/perfil')}>
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-amber-900">Completa tu perfil</h3>
                    <p className="text-xs text-amber-700 mt-1">Ayúdanos a brindarte un mejor servicio.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400" />
            </div>
        </div>
    );
}
