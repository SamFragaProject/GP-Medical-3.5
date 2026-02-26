import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, Users, FileText, ShieldCheck, Activity,
    ArrowLeft, TrendingUp, Clock, Plus, Download, Mail, Phone,
    MapPin, Calendar, CheckCircle, XCircle, AlertTriangle,
    Briefcase, Zap, Scale, BarChart3, FileDown, Shield, Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Empresa, b2bService, empresasService } from '@/services/dataService';
import { seedDemoPatients } from '@/utils/seeder_5_pacientes';
import toast from 'react-hot-toast';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface Company360ViewProps {
    empresaId: string;
    onBack: () => void;
}

interface Metricas360 {
    headcountReal: number;
    headcountContratado: number;
    porcentajeCupo: number;
    aptos: number;
    aptosConRestriccion: number;
    noAptos: number;
    pendientes: number;
    pctAptos: number;
    pctRestriccion: number;
    pctNoAptos: number;
    sedesActivas: number;
    vigenciaFin: string | null;
    diasParaVencer: number | null;
    estatusContrato: string;
    serviciosActivos: string[];
}

interface Hallazgo {
    nombre: string;
    total: number;
    criticos: number;
    leves: number;
}

interface ReporteDisponible {
    id: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    periodo: string;
    registros: number;
    disponible: boolean;
    normas: string[];
}

const RISK_COLORS: Record<string, string> = {
    'Ruido (Hipoacusia)': '#ef4444',
    'Cargas (Ergonómico)': '#f59e0b',
    'Químicos': '#8b5cf6',
    'Psicosocial': '#3b82f6',
    'Visual': '#06b6d4',
    'Cardiovascular': '#ec4899',
    'Otros': '#6b7280'
};

export function Company360View({ empresaId, onBack }: Company360ViewProps) {
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [metricas, setMetricas] = useState<Metricas360 | null>(null);
    const [contactos, setContactos] = useState<any[]>([]);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [serviciosDetalle, setServiciosDetalle] = useState<any[]>([]);
    const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
    const [reportes, setReportes] = useState<ReporteDisponible[]>([]);
    const [complianceData, setComplianceData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAllData() {
            setLoading(true);
            try {
                const [empData, met, cont, docs, servs, hall, reps, compliance] = await Promise.all([
                    empresasService.getAll().then(all => all.find(e => e.id === empresaId)),
                    b2bService.getMetricas360(empresaId),
                    b2bService.getContactos(empresaId),
                    b2bService.getDocumentos(empresaId),
                    b2bService.getServicios(empresaId),
                    b2bService.getHallazgosPorRiesgo(empresaId),
                    b2bService.getReportesDisponibles(empresaId),
                    b2bService.getCumplimientoHistorico(empresaId)
                ]);
                if (empData) setEmpresa(empData as Empresa);
                setMetricas(met);
                setContactos(cont || []);
                setDocumentos(docs || []);
                setServiciosDetalle(servs || []);
                setHallazgos(hall || []);
                setReportes(reps || []);
                setComplianceData(compliance || []);
            } catch (error) {
                console.error('Error loading company 360 data:', error);
                toast.error('Error al cargar datos 360');
            } finally {
                setLoading(false);
            }
        }
        loadAllData();
    }, [empresaId]);

    const handleDescargarReporte = (reporte: ReporteDisponible) => {
        if (!reporte.disponible) {
            toast.error('No hay datos suficientes para generar este reporte');
            return;
        }
        toast.success(`Generando "${reporte.titulo}"... Se descargará en breve.`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Activity className="w-12 h-12 text-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Generando Vista 360°...</p>
            </div>
        );
    }

    if (!empresa) return <div>Empresa no encontrada</div>;

    const m = metricas!;
    const vigenciaLabel = m.vigenciaFin
        ? new Date(m.vigenciaFin).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Sin definir';
    const vigenciaColor = m.diasParaVencer !== null
        ? m.diasParaVencer > 90 ? 'text-emerald-400' : m.diasParaVencer > 30 ? 'text-amber-400' : 'text-rose-400'
        : 'text-slate-400';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="hover:bg-slate-100 rounded-xl px-4 py-2 text-slate-600 font-bold flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver al Ecosistema
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold" onClick={() => seedDemoPatients(empresaId)}>
                        <Database className="w-4 h-4 mr-2" /> Inyectar 5 Pacientes Reales
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold" onClick={() => handleDescargarReporte(reportes.find(r => r.id === 'reporte-anual')!)}>
                        <Download className="w-4 h-4 mr-2" /> Reporte Anual
                    </Button>
                </div>
            </div>

            {/* Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 to-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
                    <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/40 border-4 border-white/10 ring-8 ring-emerald-500/10">
                        {empresa.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">{empresa.nombre}</h1>
                            <Badge className="bg-blue-500/20 text-blue-300 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                {empresa.plan || 'Básico'}
                            </Badge>
                        </div>
                        <p className="text-slate-400 font-medium text-lg mb-6">{empresa.razon_social || 'Entidad Corporativa Activa'}</p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                            <div className="flex items-center gap-3 text-slate-300">
                                <MapPin className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold">{empresa.direccion || 'Ubicación no registrada'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Mail className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold">{empresa.email || 'Sin e-mail'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold">RFC: {empresa.rfc || 'Sin registrar'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-72">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estatus</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${empresa.activo ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                <span className="text-white font-bold text-sm">{empresa.activo ? 'Operativo' : 'Inactivo'}</span>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vigencia</p>
                            <span className={`font-bold text-sm ${vigenciaColor}`}>{vigenciaLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm h-auto flex flex-wrap lg:flex-nowrap gap-2">
                    <TabsTrigger value="overview" className="rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <TrendingUp className="w-4 h-4 mr-2" /> Dashboard 360
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <Users className="w-4 h-4 mr-2" /> Contactos B2B
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <FileText className="w-4 h-4 mr-2" /> Contratos & SLA
                    </TabsTrigger>
                    <TabsTrigger value="services" className="rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <Briefcase className="w-4 h-4 mr-2" /> Servicios
                    </TabsTrigger>
                    <TabsTrigger value="hallazgos" className="rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Hallazgos
                    </TabsTrigger>
                    <TabsTrigger value="reportes" className="rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <FileDown className="w-4 h-4 mr-2" /> Reportes STPS
                    </TabsTrigger>
                </TabsList>

                {/* ═══════ TAB: OVERVIEW ═══════ */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-8 space-y-8">
                            {/* KPI Cards — datos reales */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><Users className="w-6 h-6" /></div>
                                            {m.headcountContratado > 0 && <Badge className="bg-blue-100 text-blue-700 border-none font-bold">{m.porcentajeCupo}%</Badge>}
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">{m.headcountReal.toLocaleString()}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Headcount Actual</p>
                                        {m.headcountContratado > 0 && (
                                            <>
                                                <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(m.porcentajeCupo, 100)}%` }} />
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">{m.porcentajeCupo}% del cupo contratado ({m.headcountContratado.toLocaleString()})</p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></div>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">{m.pctAptos}%</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">{m.aptos}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Trabajadores Aptos</p>
                                        <p className="text-[10px] text-slate-400 mt-4 font-medium">
                                            {m.aptosConRestriccion} con restricción · {m.noAptos} no aptos · {m.pendientes} pendientes
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform"><Building2 className="w-6 h-6" /></div>
                                            <Badge className="bg-purple-100 text-purple-700 border-none font-bold">{m.sedesActivas} sedes</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">{m.serviciosActivos.length}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Servicios Activos</p>
                                        <p className="text-[10px] text-slate-400 mt-4 font-medium">
                                            {m.diasParaVencer !== null ? `Contrato vence en ${m.diasParaVencer} días` : 'Sin contrato registrado'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Compliance Chart */}
                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8">
                                <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Evolución de Cumplimiento Normativo</CardTitle>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Basado en certificaciones reales emitidas</p>
                                    </div>
                                </CardHeader>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={complianceData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                                            <Tooltip contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }} />
                                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* Side Panels */}
                        <div className="xl:col-span-4 space-y-8">
                            {/* Indicadores de Aptitud */}
                            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-6 bg-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" /> Indicadores de Aptitud
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Aptos', value: m.pctAptos, count: m.aptos, color: 'bg-emerald-500' },
                                        { label: 'Con Restricción', value: m.pctRestriccion, count: m.aptosConRestriccion, color: 'bg-amber-500' },
                                        { label: 'No Aptos', value: m.pctNoAptos, count: m.noAptos, color: 'bg-rose-500' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                                <span className="text-xs font-black text-slate-900">{stat.count} ({stat.value}%)</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${stat.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</span>
                                        <span className="text-lg font-black text-blue-600">{m.pendientes}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Vigencia del Contrato */}
                            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Contrato & Vigencia</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Vigencia</p>
                                                <p className={`text-[10px] font-bold ${vigenciaColor}`}>
                                                    {m.diasParaVencer !== null ? `${m.diasParaVencer} días restantes` : 'No registrada'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{vigenciaLabel}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Estatus</p>
                                                <p className="text-[10px] text-slate-400 font-bold capitalize">{m.estatusContrato}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ═══════ TAB: CONTACTOS ═══════ */}
                <TabsContent value="contacts">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Directorio Corporativo B2B</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{contactos.length} contactos registrados</p>
                            </div>
                            <Button className="bg-slate-900 text-white rounded-xl font-bold px-6 py-2.5"><Plus className="w-4 h-4 mr-2" /> Agregar Contacto</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nombre</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Área / Puesto</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">E-mail</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Teléfono</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Prioridad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactos.length > 0 ? contactos.map((c, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="p-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">{c.nombre?.substring(0, 1)}</div><span className="font-bold text-slate-900">{c.nombre}</span></div></td>
                                            <td className="p-6"><Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-200 rounded-lg">{c.puesto || 'General'}</Badge></td>
                                            <td className="p-6 text-sm font-medium text-slate-600">{c.email}</td>
                                            <td className="p-6 text-sm font-medium text-slate-600">{c.telefono}</td>
                                            <td className="p-6 text-right">{c.es_principal && <Badge className="bg-emerald-500 font-black text-[9px] uppercase tracking-widest text-white border-none">Principal</Badge>}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="p-12 text-center"><Users className="w-12 h-12 text-slate-200 mx-auto mb-2" /><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay contactos registrados</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                {/* ═══════ TAB: CONTRATOS ═══════ */}
                <TabsContent value="contracts">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documentos.length > 0 ? documentos.map((doc, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-6 group hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><FileText className="w-6 h-6" /></div>
                                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold uppercase text-[9px]">V. {doc.version || '1.0'}</Badge>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{doc.titulo}</h4>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 mb-6">
                                        <div className="flex items-center gap-1.5 uppercase tracking-widest"><Calendar className="w-3.5 h-3.5" /> {doc.fecha_inicio ? new Date(doc.fecha_inicio).toLocaleDateString('es-MX') : 'Sin fecha'}</div>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <div className="uppercase tracking-widest">{doc.tipo || 'SLA'}</div>
                                    </div>
                                    <Button variant="outline" className="w-full rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50"><Download className="w-3.5 h-3.5 mr-2" /> Descargar</Button>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed flex flex-col items-center justify-center gap-4">
                                <Scale className="w-12 h-12 text-slate-200" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay documentos legales cargados</p>
                                <Button className="mt-2 bg-slate-900 rounded-xl px-8 h-12 font-bold text-white">Subir Primer Contrato</Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ═══════ TAB: SERVICIOS ═══════ */}
                <TabsContent value="services">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Servicios Contratados</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{serviciosDetalle.length} servicios · {m.serviciosActivos.length} activos en catálogo</p>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {serviciosDetalle.length > 0 ? serviciosDetalle.map((serv: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Zap className="w-6 h-6" /></div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{serv.nombre_servicio}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{serv.activo ? 'Activo' : 'Inactivo'} · {serv.unidad_medida || 'mensual'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">${(serv.cuota_fija || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{serv.unidad_medida || 'Mensual'}</p>
                                    </div>
                                </div>
                            )) : m.serviciosActivos.length > 0 ? m.serviciosActivos.map((serv: string, i: number) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500"><Zap className="w-6 h-6" /></div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{serv.replace(/_/g, ' ')}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Servicio Activo</p>
                                        </div>
                                    </div>
                                </div>
                            )) : null}
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex items-center justify-center gap-4 group cursor-pointer hover:border-emerald-500 transition-all">
                                <Plus className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500">Contratar nuevo servicio</span>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* ═══════ TAB: HALLAZGOS POR RIESGO ═══════ */}
                <TabsContent value="hallazgos">
                    <div className="space-y-8">
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8">
                            <CardHeader className="p-0 mb-8">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-amber-500" /> Hallazgos por Tipo de Riesgo
                                </CardTitle>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Consolidado de exámenes médicos y alertas de vigilancia</p>
                            </CardHeader>
                            {hallazgos.length > 0 ? (
                                <div className="space-y-4">
                                    {hallazgos.map((h, i) => {
                                        const color = RISK_COLORS[h.nombre] || '#6b7280';
                                        const maxTotal = Math.max(...hallazgos.map(x => x.total));
                                        const pct = maxTotal > 0 ? (h.total / maxTotal) * 100 : 0;
                                        return (
                                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                                className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                                                    <BarChart3 className="w-6 h-6" style={{ color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{h.nombre}</h4>
                                                        <div className="flex items-center gap-3">
                                                            {h.criticos > 0 && <Badge className="bg-rose-100 text-rose-700 border-none font-black text-[9px]">{h.criticos} críticos</Badge>}
                                                            <span className="text-lg font-black text-slate-900">{h.total}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                                                            className="h-full rounded-full" style={{ backgroundColor: color }} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">{h.leves} leves · {h.criticos} críticos</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <CheckCircle className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Sin hallazgos registrados</h3>
                                    <p className="text-sm text-slate-300 mt-2">Los hallazgos se generan conforme se registran exámenes y alertas</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                {/* ═══════ TAB: REPORTES STPS ═══════ */}
                <TabsContent value="reportes">
                    <div className="space-y-8">
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8">
                            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <FileDown className="w-6 h-6 text-blue-500" /> Reportes & Entregables
                                    </CardTitle>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Reportes descargables por periodo — conformidad STPS</p>
                                </div>
                            </CardHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reportes.map((rep, i) => (
                                    <motion.div key={rep.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className={`relative p-6 rounded-3xl border ${rep.disponible ? 'bg-white border-slate-100 hover:shadow-xl hover:border-emerald-200' : 'bg-slate-50 border-slate-100 opacity-60'} transition-all group`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl ${rep.disponible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {rep.normas.slice(0, 2).map((n, j) => (
                                                    <Badge key={j} variant="outline" className="text-[8px] font-black uppercase border-slate-200 rounded-lg">{n}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{rep.titulo}</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{rep.descripcion}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>{rep.periodo}</span>
                                                <span>·</span>
                                                <span>{rep.tipo}</span>
                                            </div>
                                            <Button size="sm" disabled={!rep.disponible} onClick={() => handleDescargarReporte(rep)}
                                                className={`rounded-xl text-[10px] font-black uppercase tracking-widest ${rep.disponible ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400'}`}>
                                                <Download className="w-3.5 h-3.5 mr-1.5" /> Descargar
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
