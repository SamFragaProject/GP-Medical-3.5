import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    FileText,
    ShieldCheck,
    Activity,
    ArrowLeft,
    TrendingUp,
    Clock,
    UserPlus,
    Plus,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Briefcase,
    Zap,
    Scale,
    PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Empresa, b2bService, empresasService } from '@/services/dataService';
import toast from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

interface Company360ViewProps {
    empresaId: string;
    onBack: () => void;
}

export function Company360View({ empresaId, onBack }: Company360ViewProps) {
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [contactos, setContactos] = useState<any[]>([]);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAllData() {
            setLoading(true);
            try {
                const [empData, contData, docsData, servsData] = await Promise.all([
                    empresasService.getAll().then(all => all.find(e => e.id === empresaId)),
                    b2bService.getContactos(empresaId),
                    b2bService.getDocumentos(empresaId),
                    b2bService.getServicios(empresaId)
                ]);

                if (empData) setEmpresa(empData as Empresa);
                setContactos(contData || []);
                setDocumentos(docsData || []);
                setServicios(servsData || []);
            } catch (error) {
                console.error('Error loading company 360 data:', error);
                toast.error('Error al cargar datos 360');
            } finally {
                setLoading(false);
            }
        }

        loadAllData();
    }, [empresaId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Activity className="w-12 h-12 text-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Generando Vista 360°...</p>
            </div>
        );
    }

    if (!empresa) return <div>Empresa no encontrada</div>;

    // Datos simulados para gráficos de cumplimiento
    const complianceData = [
        { name: 'Ene', value: 85 },
        { name: 'Feb', value: 88 },
        { name: 'Mar', value: 92 },
        { name: 'Abr', value: 90 },
        { name: 'May', value: 95 },
        { name: 'Jun', value: 98 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Banner 360 */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="hover:bg-slate-100 rounded-xl px-4 py-2 text-slate-600 font-bold flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Ecosistema
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold">
                        <Download className="w-4 h-4 mr-2" /> Reporte Anual
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">
                        <Zap className="w-4 h-4 mr-2" /> Forzar Sincronización
                    </Button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 to-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
                    {/* Logo/Abstract */}
                    <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/40 border-4 border-white/10 ring-8 ring-emerald-500/10">
                        {empresa.nombre.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">{empresa.nombre}</h1>
                            <Badge className="bg-blue-500/20 text-blue-300 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                {empresa.plan || 'Plan Básico'}
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
                                <span className="text-sm font-bold">{empresa.email || 'contacto@empresa.com'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-bold">RFC: {empresa.rfc || 'XAXX010101000'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Banner */}
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
                            <span className="text-white font-bold text-sm">31 Dic 2026</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm h-auto flex flex-wrap lg:flex-nowrap gap-2">
                    <TabsTrigger value="overview" className="rounded-xl px-6 py-3 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <TrendingUp className="w-4 h-4 mr-2" /> Vista 360 Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="rounded-xl px-6 py-3 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <Users className="w-4 h-4 mr-2" /> Capital Humano & RH
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="rounded-xl px-6 py-3 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <FileText className="w-4 h-4 mr-2" /> Contratos & SLA
                    </TabsTrigger>
                    <TabsTrigger value="services" className="rounded-xl px-6 py-3 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                        <Briefcase className="w-4 h-4 mr-2" /> Servicios Activos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* KPI Cards */}
                        <div className="xl:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 border-none font-bold">+12%</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">1,250</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Headcount Actual</p>
                                        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium">85% del cupo contratado (1,500)</p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">98%</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">98.4%</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Cumplimiento SLA</p>
                                        <p className="text-[10px] text-emerald-500 mt-4 font-bold">Excelencia en Servicio</p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <Badge className="bg-purple-100 text-purple-700 border-none font-bold">Sano</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">8.2</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Índice Salud Empresa</p>
                                        <p className="text-[10px] text-slate-400 mt-4 font-medium">Basado en hallazgos médicos recientes</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts Wrapper */}
                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8">
                                <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Evolución de Cumplimiento Normativo</CardTitle>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cumplimiento total (Estándar GPMedical)</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="rounded-lg font-bold border-slate-200">NOM-011</Badge>
                                        <Badge variant="outline" className="rounded-lg font-bold border-slate-200">NOM-035</Badge>
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
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'black' }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'black' }}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#10b981"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* Recent Activity / Side Panels */}
                        <div className="xl:col-span-4 space-y-8">
                            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-6 bg-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" /> Alertas Predictivas IA
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { title: 'Incremento en Hipoacusia', desc: 'Sedes: Planta Norte', level: 'danger', icon: AlertTriangle },
                                        { title: 'Revisión NOM-035', desc: 'Personal Administrativo', level: 'warning', icon: Clock },
                                        { title: 'SLA al límite', desc: 'Respuesta en ambulancia', level: 'warning', icon: Briefcase },
                                    ].map((alert, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 items-start">
                                            <div className={`p-2 rounded-xl shrink-0 ${alert.level === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                                                <alert.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{alert.title}</h4>
                                                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{alert.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-6 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 rounded-xl py-6">
                                    Abrir Intelligence Hub <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                </Button>
                            </Card>

                            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Próximos Vencimientos</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">SLA de Respuesta</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Vence en 12 días</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white border-slate-200 text-slate-500 text-[10px] rounded-lg">Renovar</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Plan Anual Meds</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Vence en 30 días</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white border-slate-200 text-slate-500 text-[10px] rounded-lg">Cotizar</Badge>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="contacts">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Directorio Corporativo B2B</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Contactos clave para la operación empresarial.</p>
                            </div>
                            <Button className="bg-slate-900 text-white rounded-xl font-bold px-6 py-2.5">
                                <Plus className="w-4 h-4 mr-2" /> Agregar Contacto
                            </Button>
                        </div>

                        {/* Aptitud Overview */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/30">
                            {[
                                { label: 'Aptos', value: '85%', color: 'bg-emerald-500', icon: CheckCircle },
                                { label: 'Aptos con Restricción', value: '12%', color: 'bg-amber-500', icon: AlertTriangle },
                                { label: 'No Aptos', value: '3%', color: 'bg-rose-500', icon: XCircle },
                                { label: 'Pendientes', value: '45', valueIsAbsolute: true, color: 'bg-blue-500', icon: Clock }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <h4 className="text-lg font-black text-slate-900">{stat.value}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nombre / Identidad</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Área / Puesto</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">E-mail Contacto</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Teléfono</th>
                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Prioridad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactos.length > 0 ? contactos.map((c, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                        {c.nombre.substring(0, 1)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{c.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-200 rounded-lg">
                                                    {c.puesto || 'General'}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-sm font-medium text-slate-600">{c.email}</td>
                                            <td className="p-6 text-sm font-medium text-slate-600">{c.telefono}</td>
                                            <td className="p-6 text-right">
                                                {c.es_principal && (
                                                    <Badge className="bg-emerald-500 font-black text-[9px] uppercase tracking-widest text-white border-none">
                                                        Principal
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users className="w-12 h-12 text-slate-200" />
                                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay contactos registrados</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="contracts">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documentos.length > 0 ? documentos.map((doc, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-6 group hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold uppercase text-[9px]">V. {doc.version || '1.0'}</Badge>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{doc.titulo}</h4>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 mb-6">
                                        <div className="flex items-center gap-1.5 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" /> {doc.fecha_inicio || 'Indeterminado'}
                                        </div>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <div className="uppercase tracking-widest">{doc.tipo || 'SLA'}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                                            <Download className="w-3.5 h-3.5 mr-2" /> Descargar
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed flex flex-col items-center justify-center gap-4">
                                <Scale className="w-12 h-12 text-slate-200" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay documentos legales cargados</p>
                                <Button className="mt-2 bg-slate-900 rounded-xl px-8 h-12 font-bold text-white shadow-xl shadow-slate-900/10">
                                    Subir Primer Contrato
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="services">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Servicios Contratados</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración técnica de precios y alcances.</p>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(empresa.servicios_activos || ['staff_medico', 'checkups']).map((serv: string, i: number) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{serv.replace('_', ' ')}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Servicio Activo • Premium</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">$4,500.00</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Mensual</p>
                                    </div>
                                </div>
                            ))}
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex items-center justify-center gap-4 group cursor-pointer hover:border-emerald-500 transition-all">
                                <Plus className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500">Contratar nuevo servicio</span>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
