// Generador de reportes personalizados para medicina del trabajo
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText,
  Download,
  Settings,
  Plus,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Users,
  Building2,
  Shield,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Filter,
  Grid,
  List,
  Save,
  Send,
  Printer,
  Share
} from 'lucide-react'
import toast from 'react-hot-toast'

interface GeneradorReportesProps {
  filtros: {
    empresa: string
    sede: string
    departamento: string
    fechaInicio: string
    fechaFin: string
  }
}

interface SeccionReporte {
  id: string
  tipo: 'metricas' | 'graficos' | 'tablas' | 'alertas' | 'tendencias' | 'compliance'
  titulo: string
  visible: boolean
  configuracion: any
}

interface PlantillaReporte {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  secciones: SeccionReporte[]
  formato: 'pdf' | 'excel' | 'html'
  programado: boolean
}

export function GeneradorReportes({ filtros }: GeneradorReportesProps) {
  const [plantillaActiva, setPlantillaActiva] = useState<PlantillaReporte | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevaPlantilla, setNuevaPlantilla] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'personalizado'
  })

  const tiposSecciones = [
    { 
      id: 'metricas', 
      nombre: 'Métricas Clave', 
      icon: Target,
      descripcion: 'KPIs principales y indicadores',
      color: 'bg-blue-500'
    },
    { 
      id: 'graficos', 
      nombre: 'Gráficos', 
      icon: BarChart3,
      descripcion: 'Visualizaciones y charts',
      color: 'bg-green-500'
    },
    { 
      id: 'tablas', 
      nombre: 'Tablas de Datos', 
      icon: List,
      descripcion: 'Datos tabulares detallados',
      color: 'bg-purple-500'
    },
    { 
      id: 'alertas', 
      nombre: 'Alertas', 
      icon: Activity,
      descripcion: 'Notificaciones y avisos',
      color: 'bg-red-500'
    },
    { 
      id: 'tendencias', 
      nombre: 'Tendencias', 
      icon: LineChart,
      descripcion: 'Análisis de tendencias',
      color: 'bg-indigo-500'
    },
    { 
      id: 'compliance', 
      nombre: 'Cumplimiento', 
      icon: Shield,
      descripcion: 'Estado normativo',
      color: 'bg-yellow-500'
    }
  ]

  const plantillasPredefinidas: PlantillaReporte[] = [
    {
      id: 'empresarial_mensual',
      nombre: 'Reporte Empresarial Mensual',
      descripcion: 'Resumen ejecutivo mensual para dirección',
      categoria: 'ejecutivo',
      formato: 'pdf',
      programado: true,
      secciones: [
        { id: '1', tipo: 'metricas', titulo: 'KPIs Generales', visible: true, configuracion: {} },
        { id: '2', tipo: 'graficos', titulo: 'Tendencias Principales', visible: true, configuracion: {} },
        { id: '3', tipo: 'alertas', titulo: 'Alertas Críticas', visible: true, configuracion: {} }
      ]
    },
    {
      id: 'cumplimiento_normativo',
      nombre: 'Cumplimiento Normativo',
      descripcion: 'Estado de cumplimiento con normativas mexicanas',
      categoria: 'compliance',
      formato: 'pdf',
      programado: false,
      secciones: [
        { id: '1', tipo: 'compliance', titulo: 'Estado por Norma', visible: true, configuracion: {} },
        { id: '2', tipo: 'tablas', titulo: 'Detalle de Cumplimiento', visible: true, configuracion: {} },
        { id: '3', tipo: 'alertas', titulo: 'Infracciones', visible: true, configuracion: {} }
      ]
    },
    {
      id: 'riesgo_ocupacional',
      nombre: 'Análisis de Riesgo Ocupacional',
      descripcion: 'Evaluación completa de riesgos por área',
      categoria: 'seguridad',
      formato: 'excel',
      programado: false,
      secciones: [
        { id: '1', tipo: 'metricas', titulo: 'Distribución de Riesgos', visible: true, configuracion: {} },
        { id: '2', tipo: 'graficos', titulo: 'Mapa de Riesgos', visible: true, configuracion: {} },
        { id: '3', tipo: 'tendencias', titulo: 'Evolución de Riesgos', visible: true, configuracion: {} }
      ]
    },
    {
      id: 'ausentismo',
      nombre: 'Análisis de Ausentismo',
      descripcion: 'Patrones y tendencias de ausentismo laboral',
      categoria: 'recursos_humanos',
      formato: 'excel',
      programado: true,
      secciones: [
        { id: '1', tipo: 'metricas', titulo: 'Métricas de Ausentismo', visible: true, configuracion: {} },
        { id: '2', tipo: 'graficos', titulo: 'Tendencias Temporales', visible: true, configuracion: {} },
        { id: '3', tipo: 'tablas', titulo: 'Desglose por Departamento', visible: true, configuracion: {} }
      ]
    }
  ]

  const crearNuevaPlantilla = () => {
    if (!nuevaPlantilla.nombre.trim()) {
      toast.error('Ingrese un nombre para la plantilla')
      return
    }

    const plantilla: PlantillaReporte = {
      id: `custom_${Date.now()}`,
      nombre: nuevaPlantilla.nombre,
      descripcion: nuevaPlantilla.descripcion,
      categoria: nuevaPlantilla.categoria,
      formato: 'pdf',
      programado: false,
      secciones: []
    }

    setPlantillaActiva(plantilla)
    setNuevaPlantilla({ nombre: '', descripcion: '', categoria: 'personalizado' })
    toast.success('Plantilla creada exitosamente')
  }

  const agregarSeccion = (tipo: string) => {
    if (!plantillaActiva) return

    const nuevaSeccion: SeccionReporte = {
      id: Date.now().toString(),
      tipo: tipo as any,
      titulo: tiposSecciones.find(t => t.id === tipo)?.nombre || 'Nueva Sección',
      visible: true,
      configuracion: {}
    }

    setPlantillaActiva({
      ...plantillaActiva,
      secciones: [...plantillaActiva.secciones, nuevaSeccion]
    })
  }

  const eliminarSeccion = (seccionId: string) => {
    if (!plantillaActiva) return

    setPlantillaActiva({
      ...plantillaActiva,
      secciones: plantillaActiva.secciones.filter(s => s.id !== seccionId)
    })
  }

  const guardarPlantilla = async () => {
    if (!plantillaActiva || !plantillaActiva.secciones.length) {
      toast.error('La plantilla debe tener al menos una sección')
      return
    }

    setGuardando(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Plantilla guardada exitosamente')
      setPlantillaActiva(null)
    } catch (error) {
      toast.error('Error al guardar la plantilla')
    } finally {
      setGuardando(false)
    }
  }

  const generarReporte = async (plantilla: PlantillaReporte) => {
    toast.success(`Generando reporte: ${plantilla.nombre}...`)
    
    // Simular generación
    setTimeout(() => {
      toast.success('Reporte generado exitosamente')
      // Aquí se descargaría el archivo real
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 text-green-600 mr-2" />
            Generador de Reportes
          </h2>
          <p className="text-gray-600">Crea reportes personalizados para medicina del trabajo</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setVistaPrevia(!vistaPrevia)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium text-sm"
          >
            <Eye size={16} />
            <span>Vista Previa</span>
          </button>
          
          <button
            onClick={() => setPlantillaActiva({} as any)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 font-medium text-sm"
          >
            <Plus size={16} />
            <span>Nueva Plantilla</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de plantillas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Crear nueva plantilla */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Plantilla</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nuevaPlantilla.nombre}
                  onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre del reporte"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={nuevaPlantilla.descripcion}
                  onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Descripción del reporte"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={nuevaPlantilla.categoria}
                  onChange={(e) => setNuevaPlantilla({ ...nuevaPlantilla, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="personalizado">Personalizado</option>
                  <option value="ejecutivo">Ejecutivo</option>
                  <option value="compliance">Compliance</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="recursos_humanos">Recursos Humanos</option>
                </select>
              </div>
              
              <button
                onClick={crearNuevaPlantilla}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Crear Plantilla
              </button>
            </div>
          </div>

          {/* Plantillas predefinidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas Predefinidas</h3>
            <div className="space-y-3">
              {plantillasPredefinidas.map((plantilla) => (
                <motion.div
                  key={plantilla.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    plantillaActiva?.id === plantilla.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPlantillaActiva(plantilla)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{plantilla.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{plantilla.descripcion}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {plantilla.categoria}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {plantilla.formato.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        generarReporte(plantilla)
                      }}
                      className="ml-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor de plantilla */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {plantillaActiva ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {/* Header de la plantilla */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plantillaActiva.id?.startsWith('custom') ? 'Editando Plantilla' : plantillaActiva.nombre}
                    </h3>
                    {plantillaActiva.id?.startsWith('custom') && (
                      <p className="text-gray-600">Crea tu plantilla personalizada</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Formato:</label>
                      <select
                        value={plantillaActiva.formato}
                        onChange={(e) => setPlantillaActiva({ ...plantillaActiva, formato: e.target.value as any })}
                        className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="html">HTML</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={guardarPlantilla}
                      disabled={guardando || plantillaActiva.id?.startsWith('custom_')}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 font-medium text-sm disabled:opacity-50"
                    >
                      {guardando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Guardar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Secciones de la plantilla */}
                <div className="space-y-4">
                  {plantillaActiva.secciones.map((seccion, index) => {
                    const tipoSeccion = tiposSecciones.find(t => t.id === seccion.tipo)
                    const Icon = tipoSeccion?.icon || FileText
                    
                    return (
                      <motion.div
                        key={seccion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${tipoSeccion?.color} bg-opacity-20`}>
                              <Icon className={`h-5 w-5 text-gray-700`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{seccion.titulo}</h4>
                              <p className="text-sm text-gray-600">{tipoSeccion?.descripcion}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={seccion.visible}
                                onChange={(e) => {
                                  const nuevasSecciones = plantillaActiva.secciones.map(s =>
                                    s.id === seccion.id ? { ...s, visible: e.target.checked } : s
                                  )
                                  setPlantillaActiva({ ...plantillaActiva, secciones: nuevasSecciones })
                                }}
                                className="rounded border-gray-200 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-700">Visible</span>
                            </label>
                            
                            <button
                              onClick={() => eliminarSeccion(seccion.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Agregar nuevas secciones */}
                {plantillaActiva.id?.startsWith('custom') && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Agregar Sección</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tiposSecciones.map((tipo) => {
                        const Icon = tipo.icon
                        return (
                          <button
                            key={tipo.id}
                            onClick={() => agregarSeccion(tipo.id)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <Icon className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">{tipo.nombre}</span>
                            </div>
                            <p className="text-xs text-gray-600">{tipo.descripcion}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md p-12 text-center"
              >
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Generador de Reportes
                </h3>
                <p className="text-gray-600 mb-6">
                  Selecciona una plantilla predefinida o crea tu propia plantilla personalizada
                </p>
                <button
                  onClick={() => setNuevaPlantilla({ nombre: '', descripcion: '', categoria: 'personalizado' })}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Crear Primera Plantilla
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}