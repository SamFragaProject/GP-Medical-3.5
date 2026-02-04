// Página principal del módulo de Exámenes Ocupacionales
// Vista Dual: Super Admin (God Mode) vs Operativa
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Bell,
  Calendar,
  User,
  Stethoscope,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Send,
  Phone,
  Mail,
  Printer,
  FileDown,
  Building2,
  MapPin,
  PhoneCall,
  FileSearch,
  Award,
  Target,
  Brain,
  Heart,
  EyeIcon,
  Activity as HeartIcon,
  Shield,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import toast from 'react-hot-toast'
import { FormularioNuevoExamen } from '@/components/FormularioNuevoExamen'
import { FormularioNuevoProtocolo } from '@/components/FormularioNuevoProtocolo'
import { GestionResultados } from '@/components/GestionResultados'
import { GestionCertificados } from '@/components/GestionCertificados'
import { ReportesAvanzados } from '@/components/ReportesAvanzados'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'

interface Examen {
  id: string
  empleado: string
  empresa: string
  puesto: string
  tipoExamen: string
  fechaProgramacion: string
  fechaRealizacion?: string
  estado: 'programado' | 'en_proceso' | 'completado' | 'vencido' | 'cancelado'
  resultado?: 'apto' | 'apto_con_restricciones' | 'no_apto' | 'pendiente'
  laboratorios?: string[]
  proximoVencimiento?: string
  prioridad: 'alta' | 'media' | 'baja'
  observaciones?: string
}

interface Protocolo {
  id: string
  nombre: string
  tipoPuesto: string
  descripcion: string
  examenesIncluidos: string[]
  periodicidad: string
  activo: boolean
}

interface Estadisticas {
  totalExamenes: number
  realizadosHoy: number
  proximosVencer: number
  vencidos: number
  aptos: number
  noAptos: number
  enProceso: number
}

const user = {
  id: 'demo-user',
  email: 'demo@GPMedical.com',
  name: 'Usuario Demo',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'GPMedical Demo Corp' },
  sede: { nombre: 'Sede Principal' }
}

export function ExamenesOcupacionales() {
  const { user } = useAuth()
  const isSuperAdmin = user?.rol === 'super_admin'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'examenes' | 'protocolos' | 'resultados' | 'certificados' | 'reportes'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [showNuevoExamen, setShowNuevoExamen] = useState(false)
  const [showNuevoProtocolo, setShowNuevoProtocolo] = useState(false)
  const navigate = useNavigate()

  // Estados para datos simulados
  const [examenes, setExamenes] = useState<Examen[]>([
    {
      id: 'EX001',
      empleado: 'Juan Pérez García',
      empresa: 'Constructora SA',
      puesto: 'Soldador',
      tipoExamen: 'Periódico',
      fechaProgramacion: '2025-11-15',
      estado: 'programado',
      resultado: 'pendiente',
      proximoVencimiento: '2026-11-15',
      prioridad: 'media'
    },
    {
      id: 'EX002',
      empleado: 'María López Hernández',
      empresa: 'Oficinas Corporativas',
      puesto: 'Analista',
      tipoExamen: 'Ingreso',
      fechaProgramacion: '2025-10-28',
      fechaRealizacion: '2025-10-28',
      estado: 'completado',
      resultado: 'apto',
      laboratorios: ['Hemograma completo', 'Audiometría'],
      proximoVencimiento: '2026-10-28',
      prioridad: 'baja'
    },
    {
      id: 'EX003',
      empleado: 'Carlos Rodríguez Silva',
      empresa: 'Fábrica Industrial',
      puesto: 'Operador de maquinaria',
      tipoExamen: 'Post-incidente',
      fechaProgramacion: '2025-10-25',
      fechaRealizacion: '2025-10-25',
      estado: 'completado',
      resultado: 'apto_con_restricciones',
      laboratorios: ['Rayos X de tórax', 'Espirometría'],
      observaciones: 'Requiere control en 3 meses',
      proximoVencimiento: '2026-01-25',
      prioridad: 'alta'
    },
    {
      id: 'EX004',
      empleado: 'Ana Martínez Flores',
      empresa: 'Laboratorio Farmacéutico',
      puesto: 'Químico',
      tipoExamen: 'Específico por exposición',
      fechaProgramacion: '2025-10-20',
      estado: 'vencido',
      laboratorios: ['Biomarcadores químicos', 'Función hepática'],
      proximoVencimiento: '2025-10-20',
      prioridad: 'alta'
    }
  ])

  const [protocolos, setProtocolos] = useState<Protocolo[]>([
    {
      id: 'PROT001',
      nombre: 'Protocolo Oficinista',
      tipoPuesto: 'Oficina',
      descripcion: 'Exámenes básicos para personal administrativo',
      examenesIncluidos: ['Exploración clínica', 'Visión', 'Audiometría', 'Hemograma'],
      periodicidad: 'Anual',
      activo: true
    },
    {
      id: 'PROT002',
      nombre: 'Protocolo Soldador',
      tipoPuesto: 'Soldadura',
      descripcion: 'Exámenes especializados para soldadores',
      examenesIncluidos: ['Radiografía de tórax', 'Espirometría', 'Función respiratoria', 'Biomarcadores'],
      periodicidad: 'Cada 6 meses',
      activo: true
    },
    {
      id: 'PROT003',
      nombre: 'Protocolo Alturas',
      tipoPuesto: 'Construcción',
      descripcion: 'Evaluación médica para trabajos en altura',
      examenesIncluidos: ['Exploración cardiovascular', 'Vértigo', 'Visión', 'Equilibrio'],
      periodicidad: 'Cada 6 meses',
      activo: true
    }
  ])

  const estadisticas: Estadisticas = {
    totalExamenes: examenes.length,
    realizadosHoy: examenes.filter(e => e.fechaRealizacion === new Date().toISOString().split('T')[0]).length,
    proximosVencer: examenes.filter(e => e.estado === 'programado' && new Date(e.fechaProgramacion) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length,
    vencidos: examenes.filter(e => e.estado === 'vencido').length,
    aptos: examenes.filter(e => e.resultado === 'apto').length,
    noAptos: examenes.filter(e => e.resultado === 'no_apto').length,
    enProceso: examenes.filter(e => e.estado === 'en_proceso').length
  }

  const tiposExamen = [
    'Ingreso',
    'Periódico',
    'Post-incidente',
    'Retorno al trabajo',
    'Específico por exposición',
    'Reingreso',
    'Cambio de puesto'
  ]

  const empresas = [
    'Constructora SA',
    'Oficinas Corporativas',
    'Fábrica Industrial',
    'Laboratorio Farmacéutico',
    'Transportes Unidos',
    'Minas del Norte'
  ]

  const puestos = [
    'Soldador',
    'Operador de maquinaria',
    'Analista',
    'Químico',
    'Conductor',
    'Minero',
    'Supervisor',
    'Mecánico'
  ]

  const laboratoriosDisponibles = [
    'Hemograma completo',
    'Radiografía de tórax',
    'Audiometría',
    'Espirometría',
    'Electrocardiograma',
    'Función hepática',
    'Biomarcadores químicos',
    'Análisis de orina',
    'Visión',
    'Función renal'
  ]

  const filteredExamenes = examenes.filter(examen => {
    const matchesSearch = examen.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.puesto.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'todos' || examen.estado === filterEstado
    const matchesTipo = filterTipo === 'todos' || examen.tipoExamen === filterTipo

    return matchesSearch && matchesEstado && matchesTipo
  })

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programado': return 'bg-blue-100 text-blue-800'
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800'
      case 'completado': return 'bg-green-100 text-green-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      case 'cancelado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResultadoColor = (resultado: string) => {
    switch (resultado) {
      case 'apto': return 'bg-green-100 text-green-800'
      case 'apto_con_restricciones': return 'bg-yellow-100 text-yellow-800'
      case 'no_apto': return 'bg-red-100 text-red-800'
      case 'pendiente': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600'
      case 'media': return 'text-yellow-600'
      case 'baja': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleNuevoExamen = () => {
    setShowNuevoExamen(true)
  }

  const handleNuevoProtocolo = () => {
    setShowNuevoProtocolo(true)
  }

  const handleSaveExamen = (nuevoExamen: any) => {
    setExamenes(prev => [...prev, nuevoExamen])
    setShowNuevoExamen(false)
  }

  const handleSaveProtocolo = (nuevoProtocolo: any) => {
    setProtocolos(prev => [...prev, nuevoProtocolo])
    setShowNuevoProtocolo(false)
  }

  const handleCloseNuevoExamen = () => {
    setShowNuevoExamen(false)
  }

  const handleCloseNuevoProtocolo = () => {
    setShowNuevoProtocolo(false)
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      {/* Tarjetas de estadísticas - Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumMetricCard
          title="Salud Ocupacional Global"
          value={estadisticas.totalExamenes}
          subtitle="Registros Digitales"
          icon={Stethoscope}
          gradient="emerald"
        />

        <PremiumMetricCard
          title="Daily Throughput"
          value={estadisticas.realizadosHoy}
          subtitle="Completados Hoy"
          icon={CheckCircle}
          gradient="emerald"
          trend={{ value: 15, isPositive: true }}
        />

        <PremiumMetricCard
          title="Vigilancia Próxima"
          value={estadisticas.proximosVencer}
          subtitle="Vencimientos inminentes"
          icon={Clock}
          gradient="amber"
        />

        <PremiumMetricCard
          title="Alertas Críticas"
          value={estadisticas.vencidos}
          subtitle="Acción Inmediata"
          icon={XCircle}
          gradient="rose"
        />
      </div>

      {/* Alertas y notificaciones */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary" />
          Alertas Médicas Recientes
        </h3>
        <div className="space-y-3">
          {examenes.filter(e => e.estado === 'vencido').map((examen) => (
            <motion.div
              key={examen.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">{examen.empleado}</p>
                  <p className="text-sm text-gray-600">
                    {examen.estado === 'vencido' ? 'Examen vencido' : 'Próximo a vencer'} - {examen.tipoExamen}
                  </p>
                </div>
              </div>
              <button className="text-primary hover:text-primary/80 font-medium text-sm">
                Ver detalles
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Resultado</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Aptos</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full"
                    style={{ width: `${(estadisticas.aptos / examenes.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.aptos}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">No Aptos</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-danger h-2 rounded-full"
                    style={{ width: `${(estadisticas.noAptos / examenes.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.noAptos}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {examenes.slice(0, 4).map((examen, index) => (
              <div key={examen.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{examen.empleado}</p>
                  <p className="text-xs text-gray-600">{examen.tipoExamen} - {examen.empresa}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(examen.estado)}`}>
                  {examen.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderExamenes = () => (
    <div className="space-y-6">
      {/* Barra de herramientas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar exámenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_proceso">En proceso</option>
            <option value="completado">Completado</option>
            <option value="vencido">Vencido</option>
          </select>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los tipos</option>
            {tiposExamen.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button
            variant="premium"
            onClick={handleNuevoExamen}
            className="h-11 px-8 shadow-xl shadow-emerald-500/20"
          >
            <Plus size={16} className="mr-2" />
            Nuevo Examen
          </Button>
        </div>
      </div>

      {/* Tabla de exámenes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado / Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Examen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Programación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredExamenes.map((examen) => (
                  <motion.tr
                    key={examen.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{examen.empleado}</div>
                        <div className="text-sm text-gray-500">{examen.empresa} - {examen.puesto}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{examen.tipoExamen}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{examen.fechaProgramacion}</div>
                      {examen.fechaRealizacion && (
                        <div className="text-sm text-gray-500">Realizado: {examen.fechaRealizacion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(examen.estado)}`}>
                        {examen.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getResultadoColor(examen.resultado || 'pendiente')}`}>
                        {examen.resultado || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${getPrioridadColor(examen.prioridad)}`}>
                        {examen.prioridad === 'alta' && <AlertTriangle className="h-4 w-4 mr-1" />}
                        {examen.prioridad === 'media' && <Clock className="h-4 w-4 mr-1" />}
                        {examen.prioridad === 'baja' && <CheckCircle className="h-4 w-4 mr-1" />}
                        <span className="text-sm font-medium">{examen.prioridad}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary hover:text-primary/80">
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderProtocolos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Protocolos Personalizados</h2>
        <button
          onClick={handleNuevoProtocolo}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus size={16} />
          <span>Nuevo Protocolo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {protocolos.map((protocolo) => (
            <motion.div
              key={protocolo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{protocolo.nombre}</h3>
                <div className="flex items-center space-x-2">
                  {protocolo.activo ? (
                    <div className="bg-success/10 px-2 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ) : (
                    <div className="bg-gray-100 px-2 py-1 rounded-full">
                      <XCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipo de Puesto:</span>
                  <p className="text-sm text-gray-900">{protocolo.tipoPuesto}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Descripción:</span>
                  <p className="text-sm text-gray-900">{protocolo.descripcion}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Periodicidad:</span>
                  <p className="text-sm text-gray-900">{protocolo.periodicidad}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Exámenes Incluidos:</span>
                  <div className="mt-1 space-y-1">
                    {protocolo.examenesIncluidos.slice(0, 3).map((examen, index) => (
                      <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {examen}
                      </div>
                    ))}
                    {protocolo.examenesIncluidos.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{protocolo.examenesIncluidos.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-primary hover:text-primary/80">
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {protocolo.id}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )

  const renderResultados = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Resultados Digitales</h2>
      <GestionResultados />
    </div>
  )

  const renderCertificados = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Certificados Médicos</h2>
      <GestionCertificados />
    </div>
  )

  const renderReportes = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reportes & Analytics</h2>
      <ReportesAvanzados />
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'examenes': return renderExamenes()
      case 'protocolos': return renderProtocolos()
      case 'resultados': return renderResultados()
      case 'certificados': return renderCertificados()
      case 'reportes': return renderReportes()
      default: return renderDashboard()
    }
  }

  return (
    <>
      <PremiumPageHeader
        title={isSuperAdmin ? "Intelligence Center: Exámenes" : "Exámenes Ocupacionales"}
        subtitle={isSuperAdmin ? "Supervisión clínica global y monitoreo epidemiológico preventivo." : "Gestión integral de protocolos médicos y certificados laborales."}
        icon={Stethoscope}
        badge={isSuperAdmin ? "GOD MODE ACTIVATED" : `${estadisticas.vencidos} ALERTAS`}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest"
              onClick={() => { toast.success('Exportando datos...') }}
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>

            <Button
              variant="premium"
              onClick={handleNuevoExamen}
              className="h-11 px-8 shadow-xl shadow-emerald-500/20 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Examen
            </Button>
          </div>
        }
      />

      <div className="pb-12">

        {/* Stats Grid para Super Admin */}
        {isSuperAdmin && (
          <div className="w-full px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { icon: Stethoscope, title: 'Total Exámenes', value: estadisticas.totalExamenes, color: 'from-blue-500 to-indigo-600' },
                { icon: CheckCircle, title: 'Completados', value: filteredExamenes.filter(e => e.estado === 'completado').length, color: 'from-emerald-500 to-teal-600' },
                { icon: Clock, title: 'Pendientes', value: estadisticas.proximosVencer, color: 'from-purple-500 to-indigo-600' },
                { icon: XCircle, title: 'Vencidos', value: estadisticas.vencidos, color: 'from-rose-500 to-pink-600' },
                { icon: CheckCircle, title: 'Aptos', value: estadisticas.aptos, color: 'from-cyan-500 to-blue-600' },
                { icon: AlertTriangle, title: 'No Aptos', value: estadisticas.noAptos, color: 'from-orange-500 to-amber-500' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 shadow-lg text-white`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-3xl font-black">{stat.value}</h3>
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Navegación por tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: Activity },
                { id: 'examenes', name: 'Exámenes', icon: Stethoscope },
                { id: 'protocolos', name: 'Protocolos', icon: FileText },
                { id: 'resultados', name: 'Resultados', icon: Activity },
                { id: 'certificados', name: 'Certificados', icon: Award },
                { id: 'reportes', name: 'Reportes', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'} />
                  <span>{tab.name}</span>
                </button>

              ))}
            </nav>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-6 py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>

        {/* Modales */}
        {
          showNuevoExamen && (
            <FormularioNuevoExamen />
          )
        }

        {
          showNuevoProtocolo && (
            <FormularioNuevoProtocolo
              onClose={handleCloseNuevoProtocolo}
              onSave={handleSaveProtocolo}
            />
          )
        }
      </div>
    </>
  )
}
