import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    Clock,
    CreditCard,
    CheckCircle,
    AlertCircle,
    Search,
    UserPlus,
    ArrowRight,
    ClipboardCheck
} from 'lucide-react';
import { Card, Title, Text, Metric, Grid, Flex, Badge, Button } from '@tremor/react';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { useAgenda } from '@/hooks/useAgenda';
import { useFacturacion } from '@/hooks/useFacturacion';
import { DataContainer } from '@/components/ui/DataContainer';

export function ReceptionView() {
    const { citas, loading: loadingAgenda, obtenerCitas } = useAgenda();
    const { crearFactura } = useFacturacion();
    const [searchTerm, setSearchTerm] = React.useState('');

    // Filtrar citas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = citas.filter(c => c.fechaHora.toISOString().startsWith(today)) || [];

    const stats = [
        { title: 'Esperando', value: todayAppointments.filter(c => c.estado === 'en_proceso').length, icon: Clock, color: 'amber' },
        { title: 'Programadas Hoy', value: todayAppointments.length, icon: Calendar, color: 'blue' },
        { title: 'Atendidas', value: todayAppointments.filter(c => c.estado === 'completada').length, icon: CheckCircle, color: 'emerald' },
        { title: 'Pagos Pendientes', value: 3, icon: CreditCard, color: 'rose' }, // Mock para esta iteración
    ];

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Panel de Recepción"
                subtitle="Gestión de flujo de pacientes, cobros y check-in en tiempo real."
                icon={Users}
                badge="OPERATIVA FRONT-DESK"
                actions={
                    <div className="flex gap-3">
                        <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl">
                            <UserPlus className="w-4 h-4 mr-2" /> Nuevo Paciente
                        </Button>
                        <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl border-0">
                            <Calendar className="w-4 h-4 mr-2" /> Agendar Cita
                        </Button>
                    </div>
                }
            />

            {/* Quick Stats */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card decoration="top" decorationColor={stat.color as any} className="ring-0 shadow-lg border-white/50 bg-white/70 backdrop-blur-xl rounded-3xl">
                            <Flex justifyContent="start" alignItems="center" className="space-x-4">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <Text className="text-slate-500 font-medium">{stat.title}</Text>
                                    <Metric className="text-2xl font-black text-slate-800">{stat.value}</Metric>
                                </div>
                            </Flex>
                        </Card>
                    </motion.div>
                ))}
            </Grid>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Check-in & Waiting Room List */}
                <Card className="lg:col-span-2 ring-0 shadow-2xl shadow-blue-500/5 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border-white/60 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <Title className="text-xl font-black text-slate-800">Sala de Espera & Check-in</Title>
                            <Text className="text-slate-500">Pacientes programados para el día de hoy</Text>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 border-none text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataContainer
                        loading={loadingAgenda}
                        error={null}
                        data={todayAppointments}
                        emptyTitle="No hay citas para hoy"
                        emptyMessage="Aún no se han registrado pacientes para este turno."
                    >
                        <div className="space-y-3">
                            {todayAppointments
                                .filter(c => c.paciente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((cita, i) => (
                                    <motion.div
                                        key={cita.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white transition-all">
                                                {cita.paciente?.nombre?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{cita.paciente?.nombre} {cita.paciente?.apellidoPaterno}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{cita.fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span>•</span>
                                                    <span className="font-medium text-blue-600">{cita.motivoConsulta || 'Consulta General'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge
                                                color={cita.estado === 'programada' ? 'blue' : cita.estado === 'en_proceso' ? 'amber' : 'emerald'}
                                                className="rounded-lg px-2 py-0.5 font-bold uppercase text-[9px] tracking-widest"
                                            >
                                                {cita.estado}
                                            </Badge>
                                            <Button
                                                size="xs"
                                                variant="secondary"
                                                className="opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                                            >
                                                Check-in <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </DataContainer>
                </Card>

                {/* Quick Actions & Finance Side */}
                <div className="space-y-8">
                    <Card className="ring-0 shadow-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-[2.5rem] border-0 p-8">
                        <Title className="text-white font-black mb-6">Acciones Rápidas</Title>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-[2rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Cobrar</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-[2rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <ClipboardCheck className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Previs</span>
                            </button>
                        </div>
                    </Card>

                    <Card className="ring-0 shadow-xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border-white/60 p-8">
                        <Title className="text-slate-800 font-black mb-4">Alertas Operativas</Title>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-rose-900">Retraso en Consultorio 2</p>
                                    <p className="text-xs text-rose-700">Dr. Ruiz tiene 15 min de retraso.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Paciente esperando</p>
                                    <p className="text-xs text-amber-700">Ana García ha esperado 25 min.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
