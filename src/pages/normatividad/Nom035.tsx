import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Brain,
    ClipboardList,
    BarChart3,
    AlertTriangle,
    Users,
    Send,
    Download,
    FileText,
    CheckCircle2,
    Calendar,
    ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'

import { EvaluacionNom035 } from '@/components/normatividad/EvaluacionNom035'
import { normatividadService } from '@/services/normatividadService'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

// Mock Data (Opcional: podrías reemplazar esto con useEffect y normatividadService.getCampanas)
const metricasGenerales = {
    totalEmpleados: 450,
    encuestasCompletadas: 385,
    porcentajeParticipacion: 85,
    riesgoAlto: 45,
    riesgoMuyAlto: 12,
    ultimaEvaluacion: 'Octubre 2025'
}

const encuestasActivas = [
    {
        id: 1,
        uuid: 'campana-demo-1', // ID simulado, en prod vendría de la BD
        nombre: 'Guía de Referencia I - Acontecimientos Traumáticos Severos',
        estado: 'activa',
        avance: 85,
        fechaInicio: '2025-10-01',
        fechaFin: '2025-10-31',
        tipo: 'guia_i'
    },
    {
        id: 2,
        uuid: 'campana-demo-2',
        nombre: 'Guía de Referencia II - Riesgo Psicosocial',
        estado: 'activa',
        avance: 92,
        fechaInicio: '2025-10-01',
        fechaFin: '2025-10-31',
        tipo: 'guia_ii'
    }
]

const dominiosRiesgo = [
    { nombre: 'Carga de trabajo', nivel: 'alto', score: 35 },
    { nombre: 'Jornada de trabajo', nivel: 'medio', score: 20 },
    { nombre: 'Liderazgo negativo', nivel: 'bajo', score: 10 },
    { nombre: 'Violencia laboral', nivel: 'nulo', score: 2 },
    { nombre: 'Interferencia trabajo-familia', nivel: 'muy_alto', score: 45 }
]

export default function Nom035() {
    const { user } = useAuth()
    const [modoEncuesta, setModoEncuesta] = useState<'guia_i' | 'guia_ii' | null>(null)
    const [campanaSeleccionadaId, setCampanaSeleccionadaId] = useState<string>('')

    const handleIniciarEncuesta = (tipo: 'guia_i' | 'guia_ii', idCampana: string) => {
        setCampanaSeleccionadaId(idCampana)
        setModoEncuesta(tipo)
    }

    if (modoEncuesta) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                    variant="ghost"
                    onClick={() => setModoEncuesta(null)}
                    className="mb-4"
                >
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Volver al Dashboard
                </Button>
                <EvaluacionNom035
                    tipo={modoEncuesta}
                    onCancel={() => setModoEncuesta(null)}
                    onComplete={async (res) => {
                        console.log("Resultado encuesta:", res)
                        try {
                            // Guardar en Supabase usando el servicio
                            // Nota: En un entorno real, usar campanaSeleccionadaId real
                            // Por ahora simulamos si no hay ID válido
                            if (campanaSeleccionadaId) {
                                await normatividadService.saveRespuesta({
                                    campana_id: campanaSeleccionadaId,
                                    empleado_id: user?.id, // Asumiendo que el usuario logueado responde
                                    respuestas: res.respuestas,
                                    resultado_calculado: res.resultado
                                })
                                toast.success("Respuesta guardada en la nube")
                            } else {
                                toast("Modo Demo: Respuesta procesada localmente", { icon: 'ℹ️' })
                            }
                        } catch (err) {
                            console.error("Error guardando respuesta:", err)
                            toast.error("Error al guardar respuesta")
                        }
                        setModoEncuesta(null)
                    }}
                />
            </div>
        )
    }

    return (
        <>
            <PremiumPageHeader
                title="NOM-035-STPS-2018"
                subtitle="Factores de Riesgo Psicosocial y Entorno Organizacional"
                icon={Brain}
                badge="Cumplimiento Activo"
                actions={
                    <div className="flex gap-2">
                        <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl shadow-xl shadow-emerald-500/20">
                            Exportar Evidencia
                        </Button>
                    </div>
                }
            />

            <div className="space-y-8 pb-12">

                {/* KPIs Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PremiumMetricCard
                        title="Participación"
                        value={`${metricasGenerales.porcentajeParticipacion}%`}
                        subtitle={`${metricasGenerales.encuestasCompletadas} de ${metricasGenerales.totalEmpleados}`}
                        icon={Users}
                        gradient="blue"
                        trend={{ value: 5, isPositive: true }}
                    />
                    <PremiumMetricCard
                        title="Riesgo Muy Alto"
                        value={metricasGenerales.riesgoMuyAlto}
                        subtitle="Colaboradores críticos"
                        icon={AlertTriangle}
                        gradient="rose"
                    />
                    <PremiumMetricCard
                        title="Riesgo Alto"
                        value={metricasGenerales.riesgoAlto}
                        subtitle="Atención prioritaria"
                        icon={Brain}
                        gradient="amber"
                    />
                    <PremiumMetricCard
                        title="Cumplimiento"
                        value="92%"
                        subtitle="Evidencia documental"
                        icon={ClipboardList}
                        gradient="emerald"
                    />
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="bg-white border p-1 rounded-xl">
                        <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="encuestas" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Encuestas
                        </TabsTrigger>
                        <TabsTrigger value="resultados" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <FileText className="w-4 h-4 mr-2" />
                            Resultados & Reportes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Mapa de Calor de Riesgos */}
                            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        Dominios de Riesgo Crítico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {dominiosRiesgo.map((dominio, idx) => {
                                            const color =
                                                dominio.nivel === 'muy_alto' ? 'bg-red-500' :
                                                    dominio.nivel === 'alto' ? 'bg-orange-500' :
                                                        dominio.nivel === 'medio' ? 'bg-yellow-400' :
                                                            dominio.nivel === 'bajo' ? 'bg-green-400' : 'bg-blue-300'

                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="text-slate-700">{dominio.nombre}</span>
                                                        <span className={`uppercase text-xs font-bold px-2 py-0.5 rounded-full text-white ${color}`}>
                                                            {dominio.nivel.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(dominio.score / 50) * 100}%` }}
                                                            className={`h-full rounded-full ${color}`}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Estado de Encuestas */}
                            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-blue-500" />
                                        Ciclo de Evaluación Actual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {encuestasActivas.map((encuesta) => (
                                            <div key={encuesta.id} className="p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">{encuesta.nombre}</h4>
                                                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {encuesta.fechaInicio} al {encuesta.fechaFin}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                        Activa
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                                                        <span>Progreso Global</span>
                                                        <span>{encuesta.avance}%</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${encuesta.avance}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        <Send className="w-3 h-3 mr-2" /> Enviar Recordatorio
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-slate-900 text-white"
                                                        onClick={() => handleIniciarEncuesta(encuesta.tipo as any, encuesta.uuid)}
                                                    >
                                                        Responder Encuesta <ArrowRight className="w-3 h-3 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="encuestas">
                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <Users className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">Gestión de Campañas</h3>
                            <p className="text-slate-500 max-w-md text-center mb-6">
                                Configura nuevas campañas de evaluación, asigna cuestionarios a departamentos específicos y gestiona los tokens de acceso.
                            </p>
                            <Button className="bg-blue-600 text-white">
                                <Send className="w-4 h-4 mr-2" /> Nueva Campaña
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="resultados">
                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">Centro de Informes</h3>
                            <p className="text-slate-500 max-w-md text-center mb-6">
                                Genera reportes ejecutivos, análisis detallados por departamento y exporta la evidencia documental para inspecciones STPS.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline">
                                    <Download className="w-4 h-4 mr-2" /> Reporte Global PDF
                                </Button>
                                <Button variant="outline">
                                    <Download className="w-4 h-4 mr-2" /> Excel de Resultados
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
