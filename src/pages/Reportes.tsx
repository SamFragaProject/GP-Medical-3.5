// Página principal del módulo de Reportes & Analytics avanzados
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Settings,
  Filter,
  Calendar,
  Users,
  Building2,
  Shield,
  Target,
  Award,
  AlertTriangle,
  Brain,
  Zap,
  Activity,
  Clock,
  CheckCircle,
  Eye,
  Layers,
  Globe,
  Database,
  PieChart,
  LineChart
} from 'lucide-react'
import { DashboardKPIs } from '@/components/reportes/DashboardKPIs'
import { AnalyticsPredictivos } from '@/components/reportes/AnalyticsPredictivos'
import { GeneradorReportes } from '@/components/reportes/GeneradorReportes'
import { ExportadorAutomatico } from '@/components/reportes/ExportadorAutomatico'
import { ReportesCompliance } from '@/components/reportes/ReportesCompliance'
import { AnalisisTendencias } from '@/components/reportes/AnalisisTendencias'
import { AlertasPredictivas } from '@/components/reportes/AlertasPredictivas'
import { SegmentacionAvanzada } from '@/components/reportes/SegmentacionAvanzada'
import { Benchmarking } from '@/components/reportes/Benchmarking'
import { DataMining } from '@/components/reportes/DataMining'
import { VisualizacionesAvanzadas } from '@/components/reportes/VisualizacionesAvanzadas'
import { ReportesProgramados } from '@/components/reportes/ReportesProgramados'
import { ROIAnalytics } from '@/components/reportes/ROIAnalytics'
import { ReportsDashboard } from '@/components/reportes/ReportsDashboard'

import toast from 'react-hot-toast'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { Button } from '@/components/ui/button'

export function Reportes() {
  const [vistaActiva, setVistaActiva] = useState('dashboard')
  const [filtrosActivos, setFiltrosActivos] = useState({
    empresa: 'todas',
    sede: 'todas',
    departamento: 'todos',
    fechaInicio: '',
    fechaFin: ''
  })

  const vistas = [
    { id: 'dashboard', nombre: 'Dashboard Principal', icon: Layers, color: 'bg-blue-500' },
    { id: 'kpis', nombre: 'KPIs Detallados', icon: BarChart3, color: 'bg-indigo-500' },
    { id: 'predictivos', nombre: 'Analytics Predictivos', icon: Brain, color: 'bg-purple-500' },
    { id: 'generador', nombre: 'Generador de Reportes', icon: FileText, color: 'bg-green-500' },
    { id: 'exportador', nombre: 'Exportación Automática', icon: Download, color: 'bg-orange-500' },
    { id: 'compliance', nombre: 'Reportes Compliance', icon: Shield, color: 'bg-red-500' },
    { id: 'tendencias', nombre: 'Análisis de Tendencias', icon: TrendingUp, color: 'bg-indigo-500' },
    { id: 'alertas', nombre: 'Alertas Predictivas', icon: Zap, color: 'bg-yellow-500' },
    { id: 'segmentacion', nombre: 'Segmentación Avanzada', icon: Layers, color: 'bg-pink-500' },
    { id: 'benchmarking', nombre: 'Benchmarking', icon: Target, color: 'bg-teal-500' },
    { id: 'datamining', nombre: 'Data Mining', icon: Database, color: 'bg-cyan-500' },
    { id: 'visualizaciones', nombre: 'Visualizaciones 3D', icon: Activity, color: 'bg-violet-500' },
    { id: 'programados', nombre: 'Reportes Programados', icon: Clock, color: 'bg-gray-500' },
    { id: 'roi', nombre: 'ROI Analytics', icon: Award, color: 'bg-amber-500' }
  ]

  const empresas = [
    { id: 'todas', nombre: 'Todas las Empresas' },
    { id: 'constructora', nombre: 'Constructora SA' },
    { id: 'oficinas', nombre: 'Oficinas Corporativas' },
    { id: 'fabrica', nombre: 'Fábrica Industrial' },
    { id: 'laboratorio', nombre: 'Laboratorio Farmacéutico' },
    { id: 'transportes', nombre: 'Transportes Unidos' }
  ]

  const handleCambiarVista = (vista: string) => {
    setVistaActiva(vista)
  }

  const handleActualizarFiltros = (nuevosFiltros: any) => {
    setFiltrosActivos({ ...filtrosActivos, ...nuevosFiltros })
  }



  const renderContenidoVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <ReportsDashboard onNavigate={handleCambiarVista} />
      case 'kpis': // Renamed old dashboard to kpis
        return <DashboardKPIs filtros={filtrosActivos} />
      case 'predictivos':
        return <AnalyticsPredictivos filtros={filtrosActivos} />
      case 'generador':
        return <GeneradorReportes filtros={filtrosActivos} />
      case 'exportador':
        return <ExportadorAutomatico filtros={filtrosActivos} />
      case 'compliance':
        return <ReportesCompliance filtros={filtrosActivos} />
      case 'tendencias':
        return <AnalisisTendencias />
      case 'alertas':
        return <AlertasPredictivas />
      case 'segmentacion':
        return <SegmentacionAvanzada />
      case 'benchmarking':
        return <Benchmarking />
      case 'datamining':
        return <DataMining />
      case 'visualizaciones':
        return <VisualizacionesAvanzadas />
      case 'programados':
        return <ReportesProgramados />
      case 'roi':
        return <ROIAnalytics />
      default:
        return <ReportsDashboard onNavigate={handleCambiarVista} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      <PremiumPageHeader
        title="Predictive Intelligence & Analytics"
        subtitle="Soberanía de datos y análisis avanzado de salud ocupacional impulsado por GPMedical Core IA."
        icon={Brain}
        badge="ENTERPRISE BI"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="premium"
              onClick={() => handleCambiarVista('generador')}
              className="h-11 px-6 shadow-xl shadow-emerald-500/20"
            >
              <FileText className="w-5 h-5 mr-2" />
              Nuevo Reporte
            </Button>

            <Button
              variant="outline"
              onClick={() => handleCambiarVista('exportador')}
              className="h-11 px-6 rounded-xl border-slate-200 hover:border-emerald-200 hover:text-emerald-600 font-bold"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportación
            </Button>
          </div>
        }
      />

      <div className="flex">
        {/* Sidebar de navegación */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm min-h-[calc(100vh-73px)]">
          <div className="p-6">
            {/* Filtros principales */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros Globales</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
                  <select
                    value={filtrosActivos.empresa}
                    onChange={(e) => handleActualizarFiltros({ empresa: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 text-xs cursor-pointer"
                  >
                    {empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={filtrosActivos.fechaInicio}
                      onChange={(e) => handleActualizarFiltros({ fechaInicio: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-xs font-bold text-slate-700"
                      placeholder="Inicio"
                    />
                    <input
                      type="date"
                      value={filtrosActivos.fechaFin}
                      onChange={(e) => handleActualizarFiltros({ fechaFin: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-xs font-bold text-slate-700"
                      placeholder="Fin"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navegación de vistas */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-3">Arquitectura de Datos</h3>
              <div className="space-y-1.5">
                {vistas.map((vista) => {
                  const Icon = vista.icon
                  const isActive = vistaActiva === vista.id

                  return (
                    <motion.button
                      key={vista.id}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCambiarVista(vista.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 ${isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100'
                        }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                      </div>
                      <span className="text-sm font-bold">{vista.nombre}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={vistaActiva}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContenidoVista()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
