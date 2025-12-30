import React, { useState } from 'react';
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
    Bell
} from 'lucide-react';
import { HealthOverviewChart } from './HealthOverviewChart';
import { RecentTests } from './RecentTests';
import { ClinicalRecordView } from '../medicina/ClinicalRecordView';
import { OccupationalHealthViewer } from './OccupationalHealthViewer';
import { VitalSignsTracker } from './VitalSignsTracker';
import { ROICalculator } from './ROICalculator';
import { UpcomingAppointments } from './widgets/UpcomingAppointments';
import { ActivityFeed } from './widgets/ActivityFeed';

// Mock Data
const CITAS_HOY = [
    {
        id: 1,
        paciente: "Ana García",
        motivo: "Evaluación Ergonómica - Dolor Lumbar",
        hora: "10:00 AM",
        status: "confirmed",
        nombre: "Ana",
        apellido_paterno: "García",
        apellido_materno: "López",
        edad: 28,
        fecha_nacimiento: "1996-05-15",
        tipo_sangre: "O+"
    }
];

export function DoctorView() {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    if (selectedPatient) {
        return (
            <ClinicalRecordView
                patient={selectedPatient}
                onBack={() => setSelectedPatient(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6 space-y-6">
            {/* Welcome Header - Premium Design */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 p-8 relative overflow-hidden"
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />

                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                        >
                            Hola, Dr. Alejandro
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-600 text-lg"
                        >
                            Panel de Medicina del Trabajo • <span className="font-semibold text-blue-600">4 evaluaciones</span> programadas hoy
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-3"
                    >
                        <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-white font-semibold text-sm">Sistema en Línea</span>
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-white" />
                            <span className="text-white font-semibold text-sm">ROI +368%</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Top Stats - Enfocado en Medicina Laboral */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
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
                                <Text className="text-slate-600 font-medium">Trabajadores Activos</Text>
                                <Metric className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">1,240</Metric>
                                <Text className="text-xs text-emerald-600 font-semibold">⬆ 87% saludables</Text>
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
                                <Text className="text-slate-600 font-medium">Casos de Riesgo</Text>
                                <Metric className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">87</Metric>
                                <Text className="text-xs text-rose-600 font-semibold">⚠ Requieren seguimiento</Text>
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
                                <Text className="text-slate-600 font-medium">Días Incapacidad (Promedio)</Text>
                                <Metric className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">19</Metric>
                                <Text className="text-xs text-emerald-600 font-semibold">⬇ -42% vs año anterior</Text>
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
                                <Text className="text-slate-600 font-medium">Ahorro Total (6 meses)</Text>
                                <Metric className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">$234K</Metric>
                                <Text className="text-xs text-emerald-600 font-semibold">💰 MXN en costos evitados</Text>
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

                                        <div className="text-center">
                                            {/* Avatar with gradient border */}
                                            <div className="relative inline-block mb-4">
                                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-2xl shadow-blue-500/30">
                                                    {CITAS_HOY[0].paciente.charAt(0)}
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-emerald-400 to-green-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            </div>

                                            <h4 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{CITAS_HOY[0].paciente}</h4>
                                            <p className="text-sm text-slate-600 mb-6 px-4">{CITAS_HOY[0].motivo}</p>

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
                                                    <span className="font-semibold text-slate-700">{CITAS_HOY[0].hora}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons - Premium */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedPatient(CITAS_HOY[0])}
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

                    {/* Panel 3: Agenda */}
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
                                        <Text className="cursor-pointer hover:text-blue-600 text-sm">Ver todos</Text>
                                    </Flex>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Dra. María López', role: 'Medicina del Trabajo', status: 'available' },
                                            { name: 'Dr. Carlos Ruiz', role: 'Ergonomía', status: 'busy' },
                                            { name: 'Enf. Ana Torres', role: 'Salud Ocupacional', status: 'available' },
                                        ].map((staff, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-sm font-bold text-slate-700">
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{staff.name}</p>
                                                        <p className="text-xs text-slate-500">{staff.role}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${staff.status === 'available' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                            </div>
                                        ))}
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
