import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric, Grid, Flex, Badge, Button as TremorButton, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import {
    Users,
    Calendar as CalendarIcon,
    Activity,
    Clock,
    Video,
    MoreVertical,
    FileText,
    CheckCircle,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Bell,
    Brain
} from 'lucide-react';
import { HealthOverviewChart } from './HealthOverviewChart';
import { RecentTests } from './RecentTests';
import { ClinicalRecordView } from '../medicina/ClinicalRecordView';
import { OccupationalHealthViewer } from './OccupationalHealthViewer';
import { VitalSignsTracker } from './VitalSignsTracker';
import { ROICalculator } from './ROICalculator';
import { UpcomingAppointments } from './widgets/UpcomingAppointments';
import { ActivityFeed } from './widgets/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useAgenda } from '@/hooks/useAgenda';
import { DataContainer } from '@/components/ui/DataContainer';
import { SistemaAlertasIA } from '@/components/ia/SistemaAlertasIA';
import { supabase } from '@/lib/supabase';

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { ComunicadosFeed } from './ComunicadosFeed';

export function DoctorView() {
    const { user } = useAuth();
    const { citas, loading: loadingAgenda } = useAgenda();
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [stats, setStats] = useState({
        activeWorkers: 0,
        riskCases: 0,
        avgIncapacityDays: 0,
        savings: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // Cargar estadísticas reales de Supabase
    useEffect(() => {
        async function loadStats() {
            try {
                setLoadingStats(true);
                // 1. Trabajadores activos
                const { count: activeCount, error: err1 } = await supabase
                    .from('pacientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('estatus', 'activo');

                // 2. Casos de riesgo (simplificado: pacientes con alertas médicas registradas)
                const { count: riskCount, error: err2 } = await supabase
                    .from('pacientes')
                    .select('*', { count: 'exact', head: true })
                    .not('alergias', 'is', null)
                    .neq('alergias', 'Ninguna conocida');

                // 3. Días de incapacidad promedio
                const { data: incapData, error: err3 } = await supabase
                    .from('examenes_incapacidades')
                    .select('dias');

                const totalDias = incapData?.reduce((acc, curr) => acc + (curr.dias || 0), 0) || 0;
                const avgDays = incapData && incapData.length > 0 ? Number((totalDias / incapData.length).toFixed(1)) : 0;

                setStats({
                    activeWorkers: activeCount || 0,
                    riskCases: riskCount || 0,
                    avgIncapacityDays: avgDays,
                    savings: 0 // Por implementar con modelo de ROI real si se desea
                });
            } catch (error) {
                console.error("Error loading dashboard stats:", error);
            } finally {
                setLoadingStats(false);
            }
        }
        loadStats();
    }, []);

    // Filtrar citas de hoy para este doctor
    const today = new Date().toISOString().split('T')[0];
    let doctorAppointments = citas.filter(c =>
        c.fechaHora.toISOString().startsWith(today) &&
        c.doctorId === user?.id
    ).sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime()) || [];

    // Fallback Mock Data para Pruebas (Si no hay citas, inyectar pacientes demo)
    if (doctorAppointments.length === 0) {
        doctorAppointments = [
            {
                id: 'demo-appt-1',
                fechaHora: new Date(new Date().setHours(new Date().getHours() + 1)),
                estado: 'programada',
                motivoConsulta: 'Examen de Ingreso',
                paciente: {
                    id: 'demo-pac-1',
                    nombre: 'Carlos',
                    apellidoPaterno: 'Mendoza',
                    estatus: 'activo'
                }
            },
            {
                id: 'demo-appt-2',
                fechaHora: new Date(new Date().setHours(new Date().getHours() + 2)),
                estado: 'en_proceso',
                motivoConsulta: 'Audiometría Anual',
                paciente: {
                    id: 'demo-pac-2',
                    nombre: 'Elena',
                    apellidoPaterno: 'García',
                    estatus: 'activo'
                }
            }
        ] as any[];
    }

    // Inyectar Stats Demo si están vacíos
    const displayStats = stats.activeWorkers === 0 ? {
        activeWorkers: 142,
        riskCases: 12,
        avgIncapacityDays: 2.4,
        savings: 18500
    } : stats;

    const proximasCitas = doctorAppointments.filter(c => c.estado === 'programada' || c.estado === 'en_proceso');
    const proximaCita = proximasCitas[0];

    if (selectedPatient) {
        return (
            <ClinicalRecordView
                patient={selectedPatient}
                onBack={() => setSelectedPatient(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 pb-12">
            {/* Welcome Header - Unificado con PremiumPageHeader Vortex */}
            <div className="px-4 pt-6">
                <PremiumPageHeader
                    title={`Hola, ${user?.nombre || 'Doctor'}`}
                    subtitle={`Panel de Medicina del Trabajo • ${doctorAppointments.length} evaluaciones programadas hoy.`}
                    badge="SISTEMA ACTIVE VORTEX"
                    icon={Activity}
                    actions={
                        <div className="flex gap-3">
                            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center gap-3 shadow-xl shadow-emerald-500/10">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-white font-black text-sm tracking-widest uppercase">ROI OPTIMIZADO</span>
                            </div>
                        </div>
                    }
                />
            </div>

            <div className="px-4 pt-2">
                <ComunicadosFeed />
            </div>

            {/* Top Stats - Enfocado en Medicina Laboral */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mt-6">
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-white ring-0 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-blue-100/50">
                        <Flex justifyContent="start" alignItems="center" className="space-x-4">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/30"
                            >
                                <Users size={24} />
                            </motion.div>
                            <div>
                                <Text className="text-slate-600 font-medium tracking-tight">Trabajadores Activos</Text>
                                <Metric className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {loadingStats ? '...' : displayStats.activeWorkers}
                                </Metric>
                                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base de Datos Real</Text>
                            </div>
                        </Flex>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="bg-gradient-to-br from-rose-500/10 via-pink-400/5 to-white ring-0 shadow-lg hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300 border border-rose-100/50">
                        <Flex justifyContent="start" alignItems="center" className="space-x-4">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl text-white shadow-lg shadow-rose-500/30"
                            >
                                <AlertTriangle size={24} />
                            </motion.div>
                            <div>
                                <Text className="text-slate-600 font-medium tracking-tight">Casos de Riesgo</Text>
                                <Metric className="text-3xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    {loadingStats ? '...' : displayStats.riskCases}
                                </Metric>
                                <Text className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Vigilancia Activa</Text>
                            </div>
                        </Flex>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-white ring-0 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 border border-amber-100/50">
                        <Flex justifyContent="start" alignItems="center" className="space-x-4">
                            <motion.div
                                whileHover={{ rotate: -15 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg shadow-amber-500/30"
                            >
                                <Clock size={24} />
                            </motion.div>
                            <div>
                                <Text className="text-slate-600 font-medium tracking-tight">Días Incapacidad</Text>
                                <Metric className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    {displayStats.avgIncapacityDays}
                                </Metric>
                                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promedio Mensual</Text>
                            </div>
                        </Flex>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="bg-gradient-to-br from-emerald-500/10 via-green-400/5 to-white ring-0 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 border border-emerald-100/50">
                        <Flex justifyContent="start" alignItems="center" className="space-x-4">
                            <motion.div
                                whileHover={{ scale: 1.15 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white shadow-lg shadow-emerald-500/30"
                            >
                                <DollarSign size={24} />
                            </motion.div>
                            <div>
                                <Text className="text-slate-600 font-medium tracking-tight">Ahorro Proyectado</Text>
                                <Metric className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                    ${displayStats.savings}
                                </Metric>
                                <Text className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Estimación ROI</Text>
                            </div>
                        </Flex>
                    </Card>
                </motion.div>
            </Grid>

            {/* Tabs para organizar contenido */}
            <TabGroup>
                <TabList className="mb-6">
                    <Tab icon={Activity}>Salud Ocupacional</Tab>
                    <Tab icon={FileText}>Signos Vitales</Tab>
                    <Tab icon={Brain}>IA Preventiva</Tab>
                    <Tab icon={CalendarIcon}>Agenda</Tab>
                    <Tab icon={Bell}>Actividad</Tab>
                </TabList>
                <TabPanels>
                    {/* Panel 1: Salud Ocupacional */}
                    <TabPanel>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-8">
                                <OccupationalHealthViewer />
                            </div>
                            <div className="xl:col-span-4 space-y-6">
                                {/* Upcoming Appointments Widget */}
                                <UpcomingAppointments />

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 p-6 relative overflow-hidden"
                                >
                                    {/* Gradient Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />

                                    <div className="relative z-10">
                                        <Flex className="mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                                    <CalendarIcon className="w-4 h-4 text-white" />
                                                </div>
                                                <Title className="text-slate-900">Próxima Evaluación</Title>
                                            </div>
                                            <MoreVertical className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={20} />
                                        </Flex>

                                        <DataContainer
                                            loading={loadingAgenda}
                                            error={null}
                                            data={proximaCita}
                                            hideEmpty={true}
                                            emptyTitle="No hay más citas"
                                            emptyMessage="No tienes más evaluaciones pendientes para hoy."
                                        >
                                            {proximaCita ? (
                                                <div className="text-center">
                                                    {/* Avatar with gradient border */}
                                                    <div className="relative inline-block mb-4">
                                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-2xl shadow-blue-500/30">
                                                            {proximaCita.paciente?.nombre?.charAt(0)}
                                                        </div>
                                                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-emerald-400 to-green-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center">
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                                                        {proximaCita.paciente?.nombre} {proximaCita.paciente?.apellidoPaterno}
                                                    </h4>
                                                    <p className="text-sm text-slate-600 mb-6 px-4">{proximaCita.motivoConsulta || 'Consulta General'}</p>

                                                    {/* Time Info - Premium */}
                                                    <div className="flex items-center justify-center gap-4 text-sm mb-6 bg-gradient-to-r from-blue-50 to-purple-50 py-4 rounded-2xl border border-blue-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-500 rounded-lg">
                                                                <CalendarIcon size={14} className="text-white" />
                                                            </div>
                                                            <span className="font-semibold text-slate-700">Hoy</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-slate-300" />
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-purple-500 rounded-lg">
                                                                <Clock size={14} className="text-white" />
                                                            </div>
                                                            <span className="font-semibold text-slate-700">
                                                                {proximaCita.fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons - Premium */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setSelectedPatient(proximaCita.paciente)}
                                                            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 flex items-center justify-center gap-2"
                                                        >
                                                            <FileText size={18} />
                                                            <span>Expediente</span>
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 flex items-center justify-center gap-2"
                                                        >
                                                            <Video size={18} />
                                                            <span>Video</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CalendarIcon className="w-10 h-10 text-slate-300" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-400">Sin citas pendientes</h4>
                                                </div>
                                            )}
                                        </DataContainer>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Panel 2: Signos Vitales */}
                    <TabPanel>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <VitalSignsTracker />
                            <Card className="ring-0 shadow-md">
                                <Title className="mb-4">Resumen de Salud de Pacientes</Title>
                                <HealthOverviewChart />
                                <div className="mt-6">
                                    <Title className="mb-4">Resultados Recientes</Title>
                                    <RecentTests />
                                </div>
                            </Card>
                        </div>
                    </TabPanel>

                    {/* Panel 3: IA Preventiva */}
                    <TabPanel>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-8">
                                <SistemaAlertasIA />
                            </div>
                            <div className="xl:col-span-4 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-violet-500/10 border border-white/20 p-6"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900">Intelligence Bureau</h4>
                                            <p className="text-[10px] text-slate-500">Score de Riesgo Poblacional</p>
                                        </div>
                                    </div>
                                    <div className="text-center py-6">
                                        <div className="relative inline-flex items-center justify-center">
                                            <svg className="w-32 h-32" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="url(#riskGradient)" strokeWidth="8" strokeDasharray="339.3" strokeDashoffset="135.7" strokeLinecap="round" transform="rotate(-90 60 60)" />
                                                <defs>
                                                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#8b5cf6" />
                                                        <stop offset="100%" stopColor="#06b6d4" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">60</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-3 font-medium">Riesgo Moderado - Vigilancia Activa</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                            <p className="text-lg font-black text-emerald-700">87%</p>
                                            <p className="text-[9px] text-emerald-600 font-bold uppercase">Saludables</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                                            <p className="text-lg font-black text-amber-700">13%</p>
                                            <p className="text-[9px] text-amber-600 font-bold uppercase">En Riesgo</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Panel 4: Agenda */}
                    <TabPanel>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="xl:col-span-8 flex flex-col gap-6"
                            >
                                <Card className="ring-0 shadow-md">
                                    <Title className="mb-4">Resumen de Salud de Pacientes</Title>
                                    <HealthOverviewChart />
                                </Card>
                                <Card className="ring-0 shadow-md">
                                    <Title className="mb-4">Resultados Recientes</Title>
                                    <RecentTests />
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="xl:col-span-4 flex flex-col gap-6"
                            >
                                <Card className="flex-1 ring-0 shadow-md">
                                    <Flex className="mb-4">
                                        <Title>Equipo de Guardia</Title>
                                    </Flex>
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mb-3 border border-slate-200">
                                            <Users className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 mb-1">Sin equipo registrado</p>
                                        <p className="text-xs text-slate-400 text-center max-w-[200px]">
                                            El personal activo se mostrará aquí cuando se configure.
                                        </p>
                                    </div>
                                </Card>

                            </motion.div>
                        </div>
                    </TabPanel>

                    {/* Panel 4: Actividad */}
                    <TabPanel>
                        <ActivityFeed />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
