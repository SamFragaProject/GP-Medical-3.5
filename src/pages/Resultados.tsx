/**
 * Resultados de Exámenes - Portal del Trabajador
 * 
 * Vista para que el trabajador vea y descargue sus resultados
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, Search, Filter, CheckCircle,
  AlertTriangle, Clock, Eye, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'

interface Resultado {
  id: string
  nombre: string
  tipo: string
  fecha: string
  estado: 'normal' | 'alterado' | 'pendiente'
  medico: string
  descargable: boolean
}

export default function Resultados() {
  const [searchQuery, setSearchQuery] = useState('')

  const resultados: Resultado[] = [
    { id: '1', nombre: 'Biometría Hemática Completa', tipo: 'Laboratorio', fecha: '15 Ene 2025', estado: 'normal', medico: 'Lab. Central', descargable: true },
    { id: '2', nombre: 'Química Sanguínea 6 elementos', tipo: 'Laboratorio', fecha: '15 Ene 2025', estado: 'normal', medico: 'Lab. Central', descargable: true },
    { id: '3', nombre: 'Audiometría Tonal', tipo: 'Gabinete', fecha: '10 Ene 2025', estado: 'alterado', medico: 'Dra. López Rivera', descargable: true },
    { id: '4', nombre: 'Espirometría', tipo: 'Gabinete', fecha: '10 Ene 2025', estado: 'normal', medico: 'Dr. Martínez Soto', descargable: true },
    { id: '5', nombre: 'Radiografía de Tórax PA', tipo: 'Imagen', fecha: '08 Ene 2025', estado: 'normal', medico: 'Dr. Rodríguez', descargable: true },
    { id: '6', nombre: 'Electrocardiograma', tipo: 'Gabinete', fecha: '08 Ene 2025', estado: 'normal', medico: 'Dr. García Mendoza', descargable: true },
    { id: '7', nombre: 'Examen General de Orina', tipo: 'Laboratorio', fecha: '15 Ene 2025', estado: 'pendiente', medico: 'Lab. Central', descargable: false },
  ]

  const getEstadoConfig = (estado: Resultado['estado']) => {
    const configs = {
      normal: { label: 'Normal', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      alterado: { label: 'Alterado', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-200' },
      pendiente: { label: 'Pendiente', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    }
    return configs[estado]
  }

  const filteredResultados = resultados.filter(r =>
    r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tipo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = (resultado: Resultado) => {
    toast.success(`Descargando ${resultado.nombre}...`)
  }

  const stats = {
    total: resultados.length,
    normales: resultados.filter(r => r.estado === 'normal').length,
    alterados: resultados.filter(r => r.estado === 'alterado').length,
    pendientes: resultados.filter(r => r.estado === 'pendiente').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 p-6">
      <PremiumPageHeader
        title="Expediente Digital: Resultados"
        subtitle="Analítica médica personalizada y centro de descarga de certificados oficiales."
        icon={FileText}
        badge="SECURE ACCESS"
        actions={
          <Button variant="outline" className="h-11 px-6 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest">
            <Download className="w-4 h-4 mr-2" />
            Descargar Todo
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PremiumMetricCard
          title="Total Exámenes"
          value={stats.total}
          subtitle="Historial Acumulado"
          icon={FileText}
          gradient="emerald"
        />
        <PremiumMetricCard
          title="Resultados Normales"
          value={stats.normales}
          subtitle="Valores en Rango"
          icon={CheckCircle}
          gradient="emerald"
        />
        <PremiumMetricCard
          title="Hallazgos Clínicos"
          value={stats.alterados}
          subtitle="Requieren Atención"
          icon={AlertTriangle}
          gradient={stats.alterados > 0 ? "rose" : "emerald"}
        />
        <PremiumMetricCard
          title="En Proceso"
          value={stats.pendientes}
          subtitle="Pendiente Lab"
          icon={Clock}
          gradient="amber"
        />
      </div>

      {/* Search */}
      <div className="bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Filtrar por biomarcador o especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 border-white/60 h-11 rounded-xl"
          />
        </div>
      </div>

      {/* Lista de resultados */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Resultados de Exámenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredResultados.map((resultado) => {
              const estadoConfig = getEstadoConfig(resultado.estado)
              const EstadoIcon = estadoConfig.icon

              return (
                <motion.div
                  key={resultado.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${resultado.estado === 'normal' ? 'bg-emerald-50 text-emerald-600' :
                      resultado.estado === 'alterado' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{resultado.nombre}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{resultado.tipo}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {resultado.fecha}
                        </span>
                        <span>•</span>
                        <span>{resultado.medico}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${estadoConfig.color} border`}>
                      <EstadoIcon className="w-3 h-3 mr-1" />
                      {estadoConfig.label}
                    </Badge>
                    {resultado.descargable && (
                      <>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-cyan-600"
                          onClick={() => handleDownload(resultado)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre resultados alterados */}
      {stats.alterados > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="bg-rose-50/50 backdrop-blur-md border border-rose-200 rounded-[2.5rem] p-8 shadow-sm flex items-start gap-6">
            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shrink-0">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h4 className="text-xl font-black text-rose-900 tracking-tight mb-2">TELE-CONSULTA REQUERIDA</h4>
              <p className="text-rose-700/80 font-medium leading-relaxed">
                Se han detectado {stats.alterados} hallazgos fuera de los rangos de referencia.
                El equipo médico de <strong>GPMedical</strong> ha sido notificado automáticamente y agendará
                una sesión de interpretación clínica en las próximas 24 horas.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
