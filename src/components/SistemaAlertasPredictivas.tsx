// Sistema de Alertas Predictivas con IA para Medicina del Trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  Brain,
  TrendingUp,
  Users,
  Shield,
  Heart,
  Zap,
  Settings,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Star,
  Target,
  Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

// Interfaces para datos de gráficos
interface AlertasPorDiaData {
  fecha: string
  alertas: number
}

interface AlertasPorCategoriaData {
  categoria: string
  cantidad: number
}

interface TooltipFormatterProps {
  value: any
  name: string
}

interface AlertaPredictiva {
  id: string
  tipo: 'critico' | 'advertencia' | 'informativo' | 'urgente'
  categoria: 'ergonomico' | 'psicosocial' | 'seguridad' | 'salud_ocupacional' | 'normativo'
  titulo: string
  descripcion: string
  empleados_afectados: number
  probabilidad_ocurrencia: number
  impacto_estimado: 'bajo' | 'medio' | 'alto' | 'critico'
  tiempo_anticipacion: number // horas
  accion_recomendada: string
  normativos_relacionados: string[]
  estado: 'nueva' | 'en_revision' | 'en_accion' | 'resuelta' | 'archivada'
  prioridad: 1 | 2 | 3 | 4 | 5
  fecha_creacion: string
  asignado_a: string
  evidencia_soporte: string[]
  metodo_deteccion: string
}

interface MetricaAlertas {
  total_activas: number
  criticas: number
  advertencias: number
  resueltas_hoy: number
  tiempo_respuesta_promedio: number
  precision_detccion: number
}

export function SistemaAlertasPredictivas() {
  const [alertas, setAlertas] = useState<AlertaPredictiva[]>([])
  const [metricas, setMetricas] = useState<MetricaAlertas | null>(null)
  const [loading, setLoading] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  useEffect(() => {
    cargarAlertasPredictivas()
  }, [])

  const cargarAlertasPredictivas = () => {
    // Métricas simuladas
    const metricasSimuladas: MetricaAlertas = {
      total_activas: 8,
      criticas: 2,
      advertencias: 4,
      resueltas_hoy: 3,
      tiempo_respuesta_promedio: 2.5,
      precision_detccion: 94.7
    }

    // Alertas simuladas basadas en análisis de IA
    const alertasSimuladas: AlertaPredictiva[] = [
      {
        id: 'ALT001',
        tipo: 'critico',
        categoria: 'ergonomico',
        titulo: 'Riesgo Crítico de Lesión Musculoesquelética',
        descripcion: 'El sistema ha detectado patrones de riesgo ergonómico críticos en 12 empleados del turno nocturno del área de ensamblaje.',
        empleados_afectados: 12,
        probabilidad_ocurrencia: 87.3,
        impacto_estimado: 'critico',
        tiempo_anticipacion: 48,
        accion_recomendada: 'Intervención inmediata - Evaluación ergonómica y redistribución de cargas de trabajo',
        normativos_relacionados: ['NOM-025-SSA3-2012', 'ISO 45001:2018'],
        estado: 'nueva',
        prioridad: 5,
        fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        asignado_a: 'Dr. García',
        evidencia_soporte: ['Análisis postural automatizado', 'Historial de dolencias', 'Patrones de movimiento'],
        metodo_deteccion: 'IA Ergonómica + Machine Learning'
      },
      {
        id: 'ALT002',
        tipo: 'urgente',
        categoria: 'psicosocial',
        titulo: 'Incremento Súbito en Niveles de Estrés',
        descripcion: 'Aumento del 45% en indicadores de estrés laboral detectado en el departamento administrativo.',
        empleados_afectados: 25,
        probabilidad_ocurrencia: 78.9,
        impacto_estimado: 'alto',
        tiempo_anticipacion: 72,
        accion_recomendada: 'Implementar programa de manejo de estrés y evaluación psicosocial inmediata',
        normativos_relacionados: ['NOM-035-STPS-2018', 'NMX-025-SSA3-2015'],
        estado: 'en_accion',
        prioridad: 4,
        fecha_creacion: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
        asignado_a: 'Dra. López',
        evidencia_soporte: ['Análisis de ausentismo', 'Patrones de consultas médicas', 'Encuestas de clima laboral'],
        metodo_deteccion: 'IA Psicosocial + Análisis Predictivo'
      },
      {
        id: 'ALT003',
        tipo: 'advertencia',
        categoria: 'seguridad',
        titulo: 'Riesgo de Accidente en Zona de Carga',
        descripcion: 'El análisis predictivo indica un incremento en la probabilidad de accidentes en el área de carga y descarga.',
        empleados_afectados: 8,
        probabilidad_ocurrencia: 65.4,
        impacto_estimado: 'alto',
        tiempo_anticipacion: 96,
        accion_recomendada: 'Refuerzo en capacitación de seguridad y revisión de protocolos',
        normativos_relacionados: ['NOM-017-STPS-2008', 'NOM-002-STPS-2010'],
        estado: 'en_revision',
        prioridad: 3,
        fecha_creacion: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 horas atrás
        asignado_a: 'Ing. Martínez',
        evidencia_soporte: ['Análisis de incidentes históricos', 'Fatiga del personal', 'Condiciones ambientales'],
        metodo_deteccion: 'IA de Seguridad + Modelado Predictivo'
      },
      {
        id: 'ALT004',
        tipo: 'advertencia',
        categoria: 'salud_ocupacional',
        titulo: 'Exposición a Agentes Químicos',
        descripcion: 'Detectado aumento en la exposición a vapores químicos en el área de pintura industrial.',
        empleados_afectados: 6,
        probabilidad_ocurrencia: 58.7,
        impacto_estimado: 'medio',
        tiempo_anticipacion: 120,
        accion_recomendada: 'Verificación de equipos de protección y mejora en ventilación',
        normativos_relacionados: ['NOM-010-STPS-2014', 'NOM-121-STPS-1994'],
        estado: 'nueva',
        prioridad: 2,
        fecha_creacion: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
        asignado_a: 'QFB. Rodríguez',
        evidencia_soporte: ['Mediciones ambientales', 'Evaluaciones médicas', 'Sistema de monitoreo continuo'],
        metodo_deteccion: 'IoT + IA Ambiental'
      },
      {
        id: 'ALT005',
        tipo: 'informativo',
        categoria: 'normativo',
        titulo: 'Actualización Normativa OSHA',
        descripcion: 'Nueva actualización en regulaciones OSHA que afecta los protocolos de seguridad industrial.',
        empleados_afectados: 45,
        probabilidad_ocurrencia: 100,
        impacto_estimado: 'medio',
        tiempo_anticipacion: 720,
        accion_recomendada: 'Revisar y actualizar políticas de seguridad según nueva normativa',
        normativos_relacionados: ['OSHA 29 CFR 1910', 'NOM-017-STPS-2008'],
        estado: 'nueva',
        prioridad: 2,
        fecha_creacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        asignado_a: 'Equipo Legal',
        evidencia_soporte: ['Monitoreo normativo automatizado', 'Análisis de impacto', 'Comparativa regulatoria'],
        metodo_deteccion: 'IA Normativa + Monitoreo Regulatorio'
      },
      {
        id: 'ALT006',
        tipo: 'advertencia',
        categoria: 'ergonomico',
        titulo: 'Fatiga Visual en Personal Administrativo',
        descripcion: 'Incremento en reportes de fatiga visual relacionado con trabajo prolongado en pantallas.',
        empleados_afectados: 18,
        probabilidad_ocurrencia: 71.2,
        impacto_estimado: 'medio',
        tiempo_anticipacion: 48,
        accion_recomendada: 'Implementar pausas visuales y ajustar iluminación',
        normativos_relacionados: ['NOM-025-SSA3-2012'],
        estado: 'resuelta',
        prioridad: 2,
        fecha_creacion: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 días atrás
        asignado_a: 'Dra. Morales',
        evidencia_soporte: ['Patrones de consulta oftalmológica', 'Horas de pantalla', 'Evaluaciones visuales'],
        metodo_deteccion: 'IA Visual + Monitoreo de Salud'
      }
    ]

    setMetricas(metricasSimuladas)
    setAlertas(alertasSimuladas)
  }

  const actualizarEstadoAlerta = (alertaId: string, nuevoEstado: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId 
        ? { ...alerta, estado: nuevoEstado as any }
        : alerta
    ))
    
    const estadoText = {
      'en_revision': 'en revisión',
      'en_accion': 'en acción',
      'resuelta': 'resuelta',
      'archivada': 'archivada'
    }
    
    toast.success(`Alerta ${estadoText[nuevoEstado as keyof typeof estadoText] || nuevoEstado}`)
  }

  const procesarAlerta = async (alertaId: string) => {
    setLoading(true)
    toast.loading('Procesando alerta...', { id: 'procesar' })
    
    setTimeout(() => {
      setLoading(false)
      actualizarEstadoAlerta(alertaId, 'en_accion')
      toast.success('Alerta procesada correctamente', { id: 'procesar' })
    }, 1500)
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico': return <XCircle className="h-5 w-5 text-red-500" />
      case 'urgente': return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'advertencia': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'informativo': return <Eye className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'critico': return 'bg-red-500'
      case 'urgente': return 'bg-orange-500'
      case 'advertencia': return 'bg-yellow-500'
      case 'informativo': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'ergonomico': return 'bg-blue-100 text-blue-800'
      case 'psicosocial': return 'bg-purple-100 text-purple-800'
      case 'seguridad': return 'bg-red-100 text-red-800'
      case 'salud_ocupacional': return 'bg-green-100 text-green-800'
      case 'normativo': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'nueva': return 'bg-red-100 text-red-800'
      case 'en_revision': return 'bg-yellow-100 text-yellow-800'
      case 'en_accion': return 'bg-blue-100 text-blue-800'
      case 'resuelta': return 'bg-green-100 text-green-800'
      case 'archivada': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatearTiempo = (horas: number) => {
    if (horas < 24) return `${horas}h`
    const dias = Math.floor(horas / 24)
    const horasRestantes = horas % 24
    return `${dias}d ${horasRestantes}h`
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtros
  const alertasFiltradas = alertas.filter(alerta => {
    if (filtroTipo !== 'todas' && alerta.tipo !== filtroTipo) return false
    if (filtroEstado !== 'todas' && alerta.estado !== filtroEstado) return false
    if (filtroCategoria !== 'todas' && alerta.categoria !== filtroCategoria) return false
    return true
  })

  // Datos para gráficos
  const alertasPorDia: AlertasPorDiaData[] = [
    { fecha: '2025-10-26', alertas: 3 },
    { fecha: '2025-10-27', alertas: 5 },
    { fecha: '2025-10-28', alertas: 2 },
    { fecha: '2025-10-29', alertas: 8 },
    { fecha: '2025-10-30', alertas: 6 },
    { fecha: '2025-11-01', alertas: 4 }
  ]

  const alertasPorCategoriaData: AlertasPorCategoriaData[] = Object.entries(
    alertas.reduce((acc, alerta) => {
      acc[alerta.categoria] = (acc[alerta.categoria] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([categoria, cantidad]) => ({ categoria, cantidad }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Alertas Predictivas IA</h2>
            <p className="text-red-100">
              Sistema de detección temprana de riesgos con inteligencia artificial
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => cargarAlertasPredictivas()}
              disabled={loading}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </motion.button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Reporte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activas</p>
                <p className="text-xl font-bold text-gray-900">{metricas.total_activas}</p>
              </div>
              <Bell className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticas</p>
                <p className="text-xl font-bold text-red-600">{metricas.criticas}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Advertencias</p>
                <p className="text-xl font-bold text-yellow-600">{metricas.advertencias}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltas Hoy</p>
                <p className="text-xl font-bold text-green-600">{metricas.resueltas_hoy}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-xl font-bold text-purple-600">{metricas.tiempo_respuesta_promedio}h</p>
              </div>
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precisión IA</p>
                <p className="text-xl font-bold text-indigo-600">{metricas.precision_detccion}%</p>
              </div>
              <Target className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas por Día</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={alertasPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="fecha" 
                stroke="#666"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                formatter={(value: any, name: string) => [value, 'Alertas']}
                labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <Line 
                type="monotone" 
                dataKey="alertas" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertasPorCategoriaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="categoria" 
                stroke="#666"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                formatter={(value: any, name: string) => [value, 'Alertas']}
                labelFormatter={(value) => value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
              />
              <Bar 
                dataKey="cantidad" 
                fill="#00BFA6"
                cornerRadius={[4, 4, 0, 0]}
                name="Alertas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todos los tipos</option>
              <option value="critico">Crítico</option>
              <option value="urgente">Urgente</option>
              <option value="advertencia">Advertencia</option>
              <option value="informativo">Informativo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todos los estados</option>
              <option value="nueva">Nueva</option>
              <option value="en_revision">En Revisión</option>
              <option value="en_accion">En Acción</option>
              <option value="resuelta">Resuelta</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas las categorías</option>
              <option value="ergonomico">Ergonómico</option>
              <option value="psicosocial">Psicosocial</option>
              <option value="seguridad">Seguridad</option>
              <option value="salud_ocupacional">Salud Ocupacional</option>
              <option value="normativo">Normativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Predictivas</h3>
        
        <div className="space-y-4">
          {alertasFiltradas.map((alerta) => (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`${getTipoColor(alerta.tipo)} rounded-full p-2`}>
                    {getTipoIcon(alerta.tipo)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{alerta.titulo}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alerta.descripcion}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{alerta.id}</span>
                      <span>•</span>
                      <span>{formatearFecha(alerta.fecha_creacion)}</span>
                      <span>•</span>
                      <span>{alerta.metodo_deteccion}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(alerta.categoria)}`}>
                      {alerta.categoria}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(alerta.estado)}`}>
                      {alerta.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Prioridad: {alerta.prioridad}/5
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Empleados Afectados</p>
                  <p className="text-lg font-bold text-gray-900">{alerta.empleados_afectados}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Probabilidad</p>
                  <p className="text-lg font-bold text-blue-600">{alerta.probabilidad_ocurrencia}%</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Impacto</p>
                  <p className={`text-lg font-bold ${
                    alerta.impacto_estimado === 'critico' ? 'text-red-600' :
                    alerta.impacto_estimado === 'alto' ? 'text-orange-600' :
                    alerta.impacto_estimado === 'medio' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {alerta.impacto_estimado}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Anticipación</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatearTiempo(alerta.tiempo_anticipacion)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Acción Recomendada:</h5>
                    <p className="text-sm text-gray-700">{alerta.accion_recomendada}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Normativos:</h5>
                    <div className="flex flex-wrap gap-1">
                      {alerta.normativos_relacionados.map((normativo, index) => (
                        <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                          {normativo}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Asignado a: <span className="font-medium">{alerta.asignado_a}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alerta.estado === 'nueva' && (
                      <>
                        <button
                          onClick={() => actualizarEstadoAlerta(alerta.id, 'en_revision')}
                          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                        >
                          Revisar
                        </button>
                        <button
                          onClick={() => procesarAlerta(alerta.id)}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          Procesar
                        </button>
                      </>
                    )}
                    
                    {(alerta.estado === 'en_revision' || alerta.estado === 'en_accion') && (
                      <button
                        onClick={() => actualizarEstadoAlerta(alerta.id, 'resuelta')}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        Marcar Resuelta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
