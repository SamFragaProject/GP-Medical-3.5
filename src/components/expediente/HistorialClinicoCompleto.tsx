/**
 * HistorialClinicoCompleto — ECE Completo con datos demo
 * 
 * Integra: APNP, AHF, Historia Ocupacional, Exploración Física,
 * Consentimientos, Notas Médicas Versionadas, Línea de Tiempo,
 * y Exportación con filtros.
 */
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Heart, Shield, Briefcase, Stethoscope, FileText,
    Calendar, Download, Clock, AlertTriangle, CheckCircle,
    User, Cigarette, Wine, Dumbbell, Coffee, Moon, Apple,
    Pill, GitBranch, ChevronDown, ChevronUp, Building2,
    Zap, Brain, Bone, Eye as EyeIcon, Ear, MapPin,
    Thermometer, Droplets, Scale, Ruler, Gauge, Pen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
    PACIENTE_DEMO, APNP_DEMO, AHF_DEMO, HISTORIA_OCUPACIONAL_DEMO,
    EXPLORACION_FISICA_DEMO, CONSENTIMIENTOS_DEMO, NOTAS_MEDICAS_DEMO,
    EVENTOS_CLINICOS_DEMO, getExpedienteDemoCompleto
} from '@/data/demoPacienteCompleto'
import { NotasMedicasVersionadas } from '@/components/expediente/NotasMedicasVersionadas'
import { ExportarHistorialDialog } from '@/components/expediente/ExportarHistorialDialog'

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function HistorialClinicoCompleto({ pacienteId }: { pacienteId?: string }) {
    const [activeTab, setActiveTab] = useState('resumen')
    const [exportOpen, setExportOpen] = useState(false)

    // For demo, use mock data. In production, fetch from Supabase
    const isDemoPatient = !pacienteId || pacienteId === 'demo-ecr-001'
    const data = useMemo(() => getExpedienteDemoCompleto(), [])

    const handleExport = (filters: any) => {
        const exportData: any = {
            meta: {
                exportado_por: 'GPMedical ERP Pro',
                fecha_exportacion: new Date().toISOString(),
                paciente: `${data.paciente.nombre} ${data.paciente.apellido_paterno}`,
                filtros_aplicados: filters,
            },
            datos_personales: data.paciente,
        }
        if (filters.includeAPNP) exportData.apnp = data.apnp
        if (filters.includeAHF) exportData.ahf = data.ahf
        if (filters.includeHistoriaOcupacional) exportData.historia_ocupacional = data.historiaOcupacional
        if (filters.includeExploracionFisica) exportData.exploraciones_fisicas = data.exploracionesFisicas
        if (filters.includeConsentimientos) exportData.consentimientos = data.consentimientos
        if (filters.includeNotasMedicas) exportData.notas_medicas = data.notasMedicas
        if (filters.includeEventosClinicos) exportData.eventos_clinicos = data.eventosClinicos

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ECE_${data.paciente.apellido_paterno}_${data.paciente.nombre}_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const TABS = [
        { value: 'resumen', label: 'Resumen', icon: Activity },
        { value: 'apnp', label: 'APNP', icon: Heart },
        { value: 'ahf', label: 'AHF', icon: Shield },
        { value: 'ocupacional', label: 'Ocupacional', icon: Briefcase },
        { value: 'exploracion', label: 'Exploración Física', icon: Stethoscope },
        { value: 'consentimientos', label: 'Consentimientos', icon: Pen },
        { value: 'notas', label: 'Notas Médicas', icon: GitBranch },
        { value: 'timeline', label: 'Línea de Tiempo', icon: Clock },
    ]

    return (
        <div className="space-y-6">
            {/* Export button */}
            <div className="flex justify-end">
                <Button onClick={() => setExportOpen(true)} variant="outline" className="rounded-xl gap-2 text-xs font-bold">
                    <Download className="w-4 h-4" /> Exportar Historial
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
                <TabsList className="bg-white/80 backdrop-blur border border-slate-100 p-1.5 rounded-2xl w-full flex-wrap gap-1 h-auto shadow-sm">
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}
                            className="rounded-xl px-3 py-2 text-xs font-bold data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm gap-1.5">
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

                        {/* ═══ RESUMEN ═══ */}
                        <TabsContent value="resumen" className="mt-0 space-y-4">
                            <ResumenTab data={data} />
                        </TabsContent>

                        {/* ═══ APNP ═══ */}
                        <TabsContent value="apnp" className="mt-0">
                            <APNPTab apnp={data.apnp} />
                        </TabsContent>

                        {/* ═══ AHF ═══ */}
                        <TabsContent value="ahf" className="mt-0">
                            <AHFTab ahf={data.ahf} />
                        </TabsContent>

                        {/* ═══ OCUPACIONAL ═══ */}
                        <TabsContent value="ocupacional" className="mt-0">
                            <OcupacionalTab historias={data.historiaOcupacional} />
                        </TabsContent>

                        {/* ═══ EXPLORACIÓN FÍSICA ═══ */}
                        <TabsContent value="exploracion" className="mt-0">
                            <ExploracionTab exploraciones={data.exploracionesFisicas} />
                        </TabsContent>

                        {/* ═══ CONSENTIMIENTOS ═══ */}
                        <TabsContent value="consentimientos" className="mt-0">
                            <ConsentimientosTab consentimientos={data.consentimientos} />
                        </TabsContent>

                        {/* ═══ NOTAS MÉDICAS ═══ */}
                        <TabsContent value="notas" className="mt-0">
                            <NotasMedicasVersionadas notas={data.notasMedicas} />
                        </TabsContent>

                        {/* ═══ TIMELINE ═══ */}
                        <TabsContent value="timeline" className="mt-0">
                            <TimelineTab eventos={data.eventosClinicos} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            <ExportarHistorialDialog
                open={exportOpen}
                onOpenChange={setExportOpen}
                pacienteNombre={`${data.paciente.nombre} ${data.paciente.apellido_paterno}`}
                onExport={handleExport}
            />
        </div>
    )
}

// =====================================================
// RESUMEN TAB
// =====================================================
function ResumenTab({ data }: { data: ReturnType<typeof getExpedienteDemoCompleto> }) {
    const latestEF = data.exploracionesFisicas[0]
    const p = data.paciente
    return (
        <div className="space-y-4">
            {/* Alergias Alert */}
            {p.alergias && (
                <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-md">
                    <CardContent className="py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-700">ALERGIAS</p>
                            <p className="text-sm font-semibold text-red-800">{p.alergias}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Presión Arterial', value: `${latestEF.ta_sistolica}/${latestEF.ta_diastolica}`, unit: 'mmHg', icon: Activity, color: 'blue' },
                    { label: 'FC', value: latestEF.fc, unit: 'lpm', icon: Heart, color: 'rose' },
                    { label: 'Temperatura', value: latestEF.temperatura, unit: '°C', icon: Thermometer, color: 'amber' },
                    { label: 'SpO₂', value: latestEF.spo2, unit: '%', icon: Droplets, color: 'cyan' },
                    { label: 'IMC', value: latestEF.imc, unit: 'kg/m²', icon: Scale, color: 'purple' },
                    { label: 'Glucosa', value: latestEF.glucosa, unit: 'mg/dL', icon: Gauge, color: 'emerald' },
                ].map(v => (
                    <Card key={v.label} className="border-0 shadow-md">
                        <CardContent className="p-3 text-center">
                            <v.icon className={`w-4 h-4 mx-auto mb-1 text-${v.color}-500`} />
                            <p className="text-xl font-black text-slate-800">{v.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{v.label}</p>
                            <p className="text-[9px] text-slate-300">{v.unit}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <div>
                            <p className="text-lg font-black text-emerald-700">{data.consentimientos.length}</p>
                            <p className="text-xs text-emerald-600">Consentimientos Firmados</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-lg font-black text-blue-700">{data.historiaOcupacional.length}</p>
                            <p className="text-xs text-blue-600">Empleos Registrados</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <GitBranch className="w-8 h-8 text-indigo-500" />
                        <div>
                            <p className="text-lg font-black text-indigo-700">{data.notasMedicas.length}</p>
                            <p className="text-xs text-indigo-600">Notas Médicas (versiones)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// =====================================================
// APNP TAB
// =====================================================
function APNPTab({ apnp }: { apnp: typeof APNP_DEMO }) {
    const habits = [
        { icon: Cigarette, label: 'Tabaco', active: apnp.tabaco, detail: apnp.tabaco ? `${apnp.tabaco_cantidad} — ${apnp.tabaco_frecuencia}. ${apnp.tabaco_tiempo}` : 'Negado', color: apnp.tabaco ? 'amber' : 'emerald' },
        { icon: Wine, label: 'Alcohol', active: apnp.alcohol, detail: apnp.alcohol ? `${apnp.alcohol_frecuencia}. ${apnp.alcohol_cantidad}` : 'Negado', color: apnp.alcohol ? 'amber' : 'emerald' },
        { icon: Pill, label: 'Drogas', active: apnp.drogas, detail: apnp.drogas_tipo || 'Negado', color: apnp.drogas ? 'rose' : 'emerald' },
        { icon: Coffee, label: 'Café', active: apnp.cafe, detail: apnp.cafe ? `${apnp.cafe_tazas_diarias} tazas/día` : 'No consume', color: 'blue' },
        { icon: Dumbbell, label: 'Ejercicio', active: apnp.ejercicio, detail: apnp.ejercicio ? `${apnp.ejercicio_frecuencia}. ${apnp.ejercicio_tipo}` : 'Sedentario', color: apnp.ejercicio ? 'emerald' : 'amber' },
        { icon: Moon, label: 'Sueño', active: true, detail: `${apnp.sueno_horas}h — ${apnp.sueno_calidad}`, color: 'indigo' },
        { icon: Apple, label: 'Alimentación', active: true, detail: apnp.alimentacion_tipo, color: 'green' },
    ]

    return (
        <div className="space-y-3">
            <SectionHeader icon={Heart} title="Antecedentes Personales No Patológicos" subtitle="Hábitos y estilo de vida" color="rose" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {habits.map(h => (
                    <Card key={h.label} className={`border shadow-sm ${h.active && h.color === 'rose' ? 'border-rose-200 bg-rose-50/30' : ''}`}>
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-${h.color}-100`}>
                                <h.icon className={`w-4 h-4 text-${h.color}-600`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-800">{h.label}</p>
                                    <Badge variant="outline" className={`text-[9px] ${h.active && h.color !== 'emerald' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {h.active ? (h.color === 'emerald' || h.color === 'green' || h.color === 'blue' || h.color === 'indigo' ? '✓' : '⚠') : '✓ Negado'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{h.detail}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {apnp.otros_habitos && (
                <Card className="border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Otros Hábitos</p>
                        <p className="text-sm text-slate-700">{apnp.otros_habitos}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// =====================================================
// AHF TAB
// =====================================================
function AHFTab({ ahf }: { ahf: typeof AHF_DEMO }) {
    const items = [
        { label: 'Diabetes', present: ahf.diabetes, who: ahf.diabetes_quien, color: 'amber' },
        { label: 'Hipertensión', present: ahf.hipertension, who: ahf.hipertension_quien, color: 'rose' },
        { label: 'Cáncer', present: ahf.cancer, who: `${ahf.cancer_tipo} — ${ahf.cancer_quien}`, color: 'purple' },
        { label: 'Cardiopatías', present: ahf.cardiopatias, who: ahf.cardiopatias_quien, color: 'red' },
        { label: 'Enf. Mentales', present: ahf.enfermedades_mentales, who: ahf.enfermedades_mentales_quien, color: 'indigo' },
        { label: 'Enf. Respiratorias', present: ahf.enfermedades_respiratorias, who: ahf.enfermedades_respiratorias_quien, color: 'cyan' },
    ]

    return (
        <div className="space-y-3">
            <SectionHeader icon={Shield} title="Antecedentes Heredofamiliares" subtitle="Carga genética y familiar" color="blue" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(item => (
                    <Card key={item.label} className={`border shadow-sm ${item.present ? `border-${item.color}-200 bg-${item.color}-50/20` : ''}`}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.present ? `bg-${item.color}-500` : 'bg-slate-200'}`} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                                    <Badge variant="outline" className={`text-[9px] ${item.present ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {item.present ? 'Positivo' : 'Negado'}
                                    </Badge>
                                </div>
                                {item.present && item.who && <p className="text-xs text-slate-600 mt-0.5">{item.who}</p>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {ahf.otros && (
                <Card className="border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Otros Antecedentes Familiares</p>
                        <p className="text-sm text-slate-700">{ahf.otros}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// =====================================================
// OCUPACIONAL TAB
// =====================================================
function OcupacionalTab({ historias }: { historias: typeof HISTORIA_OCUPACIONAL_DEMO }) {
    const [expanded, setExpanded] = useState<string | null>(historias[historias.length - 1]?.id || null)
    return (
        <div className="space-y-3">
            <SectionHeader icon={Briefcase} title="Historia Ocupacional" subtitle={`${historias.length} registros de empleo con riesgos y exposiciones`} color="amber" />
            {historias.map((h, idx) => {
                const isCurrent = !h.fecha_fin
                const isExp = expanded === h.id
                return (
                    <Card key={h.id} className={`border shadow-sm ${isCurrent ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200' : ''}`}>
                        <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(isExp ? null : h.id)}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                    <Building2 className={`w-5 h-5 ${isCurrent ? 'text-emerald-600' : 'text-slate-500'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-slate-800">{h.empresa_anterior}</p>
                                        {isCurrent && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[9px]">Actual</Badge>}
                                    </div>
                                    <p className="text-xs text-slate-500">{h.puesto} · {h.antiguedad}</p>
                                </div>
                            </div>
                            {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                        <AnimatePresence>
                            {isExp && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <Separator />
                                    <CardContent className="p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <RiskField label="Riesgos Físicos" value={h.riesgos_fisicos} color="blue" />
                                            <RiskField label="Riesgos Químicos" value={h.riesgos_quimicos} color="amber" />
                                            <RiskField label="Riesgos Biológicos" value={h.riesgos_biologicos} color="green" />
                                            <RiskField label="Riesgos Ergonómicos" value={h.riesgos_ergonomicos} color="purple" />
                                            <RiskField label="Riesgos Psicosociales" value={h.riesgos_psicosociales} color="rose" />
                                            <RiskField label="Exposiciones" value={h.exposiciones} color="red" />
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">EPP Utilizado</p><p className="text-slate-700">{h.epp_utilizado}</p></div>
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">Accidentes Laborales</p><p className="text-slate-700">{h.accidentes_laborales}</p></div>
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">Enfermedades Laborales</p><p className="text-slate-700">{h.enfermedades_laborales}</p></div>
                                            <div><p className="font-black text-slate-400 uppercase text-[10px] mb-0.5">Motivo de Separación</p><p className="text-slate-700">{h.motivo_separacion || 'Empleo actual'}</p></div>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                )
            })}
        </div>
    )
}

function RiskField({ label, value, color }: { label: string; value?: string; color: string }) {
    if (!value || value === 'No aplica') return (
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="font-black text-slate-300 uppercase text-[10px] mb-0.5">{label}</p>
            <p className="text-slate-400 text-xs">No aplica</p>
        </div>
    )
    return (
        <div className={`p-2 rounded-lg bg-${color}-50/50 border border-${color}-100`}>
            <p className={`font-black text-${color}-400 uppercase text-[10px] mb-0.5`}>{label}</p>
            <p className="text-slate-700 text-xs leading-relaxed">{value}</p>
        </div>
    )
}

// =====================================================
// EXPLORACIÓN FÍSICA TAB
// =====================================================
function ExploracionTab({ exploraciones }: { exploraciones: typeof EXPLORACION_FISICA_DEMO }) {
    const [selectedIdx, setSelectedIdx] = useState(0)
    const ef = exploraciones[selectedIdx]
    if (!ef) return null

    return (
        <div className="space-y-4">
            <SectionHeader icon={Stethoscope} title="Exploración Física Estructurada" subtitle="Signos vitales, somatometría, exploración por aparatos y sistemas" color="purple" />
            {/* Date selector */}
            <div className="flex gap-2 flex-wrap">
                {exploraciones.map((e, i) => (
                    <Button key={e.id} variant={selectedIdx === i ? 'default' : 'outline'}
                        size="sm" className={`rounded-xl text-xs ${selectedIdx === i ? 'bg-emerald-600' : ''}`}
                        onClick={() => setSelectedIdx(i)}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(e.fecha_exploracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {i === 0 && <Badge className="ml-1 bg-white/20 text-[8px]">Última</Badge>}
                    </Button>
                ))}
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                    { l: 'TA', v: `${ef.ta_sistolica}/${ef.ta_diastolica}`, u: 'mmHg' },
                    { l: 'FC', v: ef.fc, u: 'lpm' },
                    { l: 'FR', v: ef.fr, u: 'rpm' },
                    { l: 'Temp', v: ef.temperatura, u: '°C' },
                    { l: 'SpO₂', v: ef.spo2, u: '%' },
                    { l: 'IMC', v: ef.imc, u: 'kg/m²' },
                    { l: 'Glucosa', v: ef.glucosa, u: 'mg/dL' },
                ].map(s => (
                    <Card key={s.l} className="border-0 shadow-sm bg-slate-50">
                        <CardContent className="p-2.5 text-center">
                            <p className="text-lg font-black text-slate-800">{s.v}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{s.l} <span className="text-slate-300">({s.u})</span></p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Somatometría */}
            <Card className="border-slate-200">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><Scale className="w-4 h-4 text-purple-500" /> Somatometría</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Peso</p><p className="font-bold">{ef.peso_kg} kg</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Talla</p><p className="font-bold">{ef.talla_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">IMC</p><p className={`font-bold ${(ef.imc || 0) > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>{ef.imc} ({(ef.imc || 0) > 30 ? 'Obesidad' : (ef.imc || 0) > 25 ? 'Sobrepeso' : 'Normal'})</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Cintura</p><p className="font-bold">{ef.cintura_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Cadera</p><p className="font-bold">{ef.cadera_cm} cm</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">ICC</p><p className="font-bold">{ef.icc}</p></div>
                </CardContent>
            </Card>

            {/* By System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                    { l: 'Aspecto General', v: ef.aspecto_general, i: User },
                    { l: 'Piel', v: ef.piel, i: User },
                    { l: 'Cabeza', v: ef.cabeza, i: User },
                    { l: 'Ojos', v: ef.ojos, i: EyeIcon },
                    { l: 'Oídos', v: ef.oidos, i: Ear },
                    { l: 'Nariz y Boca', v: `${ef.nariz || ''} ${ef.boca || ''}`.trim(), i: User },
                    { l: 'Cuello', v: ef.cuello, i: User },
                    { l: 'Tórax', v: ef.torax, i: Activity },
                    { l: 'Abdomen', v: ef.abdomen, i: User },
                    { l: 'Columna Vertebral', v: ef.columna, i: Bone },
                    { l: 'Extremidades Superiores', v: ef.extremidades_superiores, i: User },
                    { l: 'Extremidades Inferiores', v: ef.extremidades_inferiores, i: User },
                    { l: 'Neurológico', v: ef.neurologico, i: Brain },
                    { l: 'Musculoesquelético', v: ef.osteomuscular_detalle, i: Bone },
                ].filter(s => s.v).map(s => (
                    <Card key={s.l} className="border-slate-100 shadow-sm">
                        <CardContent className="p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><s.i className="w-3 h-3" />{s.l}</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{s.v}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {ef.hallazgos_relevantes && (
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">⚠ Hallazgos Relevantes</p>
                        <p className="text-sm text-amber-800 font-medium">{ef.hallazgos_relevantes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// =====================================================
// CONSENTIMIENTOS TAB
// =====================================================
function ConsentimientosTab({ consentimientos }: { consentimientos: typeof CONSENTIMIENTOS_DEMO }) {
    return (
        <div className="space-y-3">
            <SectionHeader icon={Pen} title="Consentimientos Informados" subtitle="Firma digital con trazabilidad legal" color="cyan" />
            {consentimientos.map(c => (
                <Card key={c.id} className={`border shadow-sm ${c.firmado ? 'border-emerald-200' : 'border-amber-200'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-bold text-sm text-slate-800">{c.titulo}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.contenido}</p>
                                <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                                    <Badge variant="outline" className="bg-slate-50">v{c.version}</Badge>
                                    <Badge variant="outline" className="bg-slate-50">Testigo: {c.testigo_nombre}</Badge>
                                    {c.ip_firma && <Badge variant="outline" className="bg-slate-50 font-mono">IP: {c.ip_firma}</Badge>}
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 text-center">
                                {c.firmado ? (
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-bold text-emerald-700">Firmado</p>
                                        <p className="text-[9px] text-emerald-500">{c.fecha_firma ? new Date(c.fecha_firma).toLocaleDateString('es-MX') : ''}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-bold text-amber-700">Pendiente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// =====================================================
// TIMELINE TAB
// =====================================================
function TimelineTab({ eventos }: { eventos: typeof EVENTOS_CLINICOS_DEMO }) {
    const sorted = [...eventos].sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime())
    const typeConfig: Record<string, { color: string; icon: any }> = {
        consulta: { color: 'emerald', icon: Stethoscope },
        examen: { color: 'blue', icon: FileText },
        prescripcion: { color: 'purple', icon: Pill },
        alerta: { color: 'amber', icon: AlertTriangle },
    }
    return (
        <div className="space-y-3">
            <SectionHeader icon={Clock} title="Línea de Tiempo Clínica" subtitle={`${eventos.length} eventos registrados`} color="slate" />
            <div className="relative pl-6 space-y-3">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 to-slate-200" />
                {sorted.map((e, i) => {
                    const conf = typeConfig[e.tipo_evento] || typeConfig.consulta
                    const Icon = conf.icon
                    return (
                        <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="relative">
                            <div className={`absolute -left-3 w-6 h-6 rounded-full bg-${conf.color}-100 border-2 border-${conf.color}-300 flex items-center justify-center z-10`}>
                                <Icon className={`w-3 h-3 text-${conf.color}-600`} />
                            </div>
                            <Card className="ml-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 leading-relaxed">{e.descripcion}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{e.medico}</p>
                                        </div>
                                        <div className="text-right ml-3 flex-shrink-0">
                                            <p className="text-[10px] font-bold text-slate-500">{new Date(e.fecha_evento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <Badge variant="outline" className={`text-[9px] bg-${conf.color}-50 text-${conf.color}-700 border-${conf.color}-200 mt-0.5`}>
                                                {e.tipo_evento}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

// =====================================================
// SHARED SECTION HEADER
// =====================================================
function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: any; title: string; subtitle: string; color: string }) {
    return (
        <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
        </div>
    )
}
