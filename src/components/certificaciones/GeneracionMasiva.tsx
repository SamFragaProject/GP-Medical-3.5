// Generación Masiva de Certificaciones
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Users,
  Building,
  Filter,
  Settings,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Briefcase,
  Mail,
  Phone,
  Shield,
  Zap,
  BarChart3,
  Download as DownloadIcon,
  RefreshCw,
  X,
  Plus
} from 'lucide-react'
import { Empresa, Paciente, TipoCertificado, type GeneracionMasiva } from '@/types/certificacion'

interface GeneracionMasivaProps {
  empresas: Empresa[]
  pacientes: Paciente[]
  tiposCertificado: TipoCertificado[]
  onGenerar: (configuracion: ConfiguracionGeneracion) => Promise<void>
}

interface ConfiguracionGeneracion {
  empresaId: string
  tipoCertificadoId: string
  filtros: {
    puestosTrabajo: string[]
    examenesCompletos: boolean
    vigenciaVencida: boolean
    fechaExamenDesde: string
    fechaExamenHasta: string
  }
  opciones: {
    enviarNotificaciones: boolean
    visibilidadEmpresa: boolean
    fechaVencimientoPersonalizada: string
    notificacionesDiasAntes: number
  }
}

export function GeneracionMasiva({ empresas, pacientes, tiposCertificado, onGenerar }: GeneracionMasivaProps) {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [tipoCertificado, setTipoCertificado] = useState('')
  const [filtros, setFiltros] = useState({
    puestosTrabajo: [] as string[],
    examenesCompletos: false,
    vigenciaVencida: false,
    fechaExamenDesde: '',
    fechaExamenHasta: ''
  })
  const [opciones, setOpciones] = useState({
    enviarNotificaciones: true,
    visibilidadEmpresa: true,
    fechaVencimientoPersonalizada: '',
    notificacionesDiasAntes: 30
  })
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [resultado, setResultado] = useState<GeneracionMasiva | null>(null)
  const [mostrarPreview, setMostrarPreview] = useState(false)

  // Obtener puestos de trabajo únicos
  const puestosDisponibles = [...new Set(pacientes.map(p => p.puestoTrabajo))].sort()

  // Filtrar pacientes según configuración
  const pacientesFiltrados = pacientes.filter(paciente => {
    if (empresaSeleccionada && paciente.empresa.id !== empresaSeleccionada) return false
    if (filtros.puestosTrabajo.length > 0 && !filtros.puestosTrabajo.includes(paciente.puestoTrabajo)) return false
    if (filtros.fechaExamenDesde && new Date(paciente.createdAt) < new Date(filtros.fechaExamenDesde)) return false
    if (filtros.fechaExamenHasta && new Date(paciente.createdAt) > new Date(filtros.fechaExamenHasta)) return false
    return true
  })

  const actualizarFiltroPuesto = (puesto: string, incluir: boolean) => {
    setFiltros(prev => ({
      ...prev,
      puestosTrabajo: incluir 
        ? [...prev.puestosTrabajo, puesto]
        : prev.puestosTrabajo.filter(p => p !== puesto)
    }))
  }

  const iniciarGeneracion = async () => {
    setGenerando(true)
    setProgreso(0)

    try {
      const configuracion: ConfiguracionGeneracion = {
        empresaId: empresaSeleccionada,
        tipoCertificadoId: tipoCertificado,
        filtros,
        opciones
      }

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setProgreso(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      await onGenerar(configuracion)
      setResultado({
        id: 'gen_' + Date.now(),
        empresaId: empresaSeleccionada,
        tipoCertificadoId: tipoCertificado,
        filtrosPacientes: filtros,
        totalGenerados: pacientesFiltrados.length,
        fechaGeneracion: new Date().toISOString(),
        estado: 'completado',
        certificadosGenerados: Array(pacientesFiltrados.length).fill('cert_' + Date.now())
      })
    } catch (error) {
      console.error('Error en generación masiva:', error)
    } finally {
      setGenerando(false)
    }
  }

  const exportarResultados = () => {
    // Simular exportación de Excel
    const elemento = document.createElement('a')
    elemento.href = '#'
    elemento.download = `generacion_masiva_${new Date().toISOString().split('T')[0]}.xlsx`
    elemento.click()
  }

  const empresa = empresas.find(e => e.id === empresaSeleccionada)
  const tipo = tiposCertificado.find(t => t.id === tipoCertificado)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generación Masiva de Certificados</h2>
              <p className="text-gray-600">Crear múltiples certificados de forma automatizada</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              <span>Filtros Avanzados</span>
            </button>
            <button
              onClick={() => setMostrarPreview(!mostrarPreview)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 size={16} />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuración Básica */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración Básica</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <select
                  value={empresaSeleccionada}
                  onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seleccionar empresa</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre} - {empresa.razonSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Certificado *
                </label>
                <select
                  value={tipoCertificado}
                  onChange={(e) => setTipoCertificado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seleccionar tipo de certificado</option>
                  {tiposCertificado.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre} - {tipo.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {empresa && tipo && (
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Resumen de Selección</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Empresa:</span>
                    <p className="font-medium">{empresa.nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Certificado:</span>
                    <p className="font-medium">{tipo.nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vigencia:</span>
                    <p className="font-medium">{tipo.vigenciaDias} días</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Firma Requerida:</span>
                    <p className="font-medium">{tipo.requiereFirma ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filtros de Empleados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtros de Empleados</h3>
              <span className="text-sm text-gray-500">
                {pacientesFiltrados.length} empleados encontrados
              </span>
            </div>

            {/* Filtros Básicos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Puestos de Trabajo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {puestosDisponibles.map(puesto => (
                    <label key={puesto} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.puestosTrabajo.includes(puesto)}
                        onChange={(e) => actualizarFiltroPuesto(puesto, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{puesto}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtros Avanzados */}
              {mostrarFiltrosAvanzados && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Examen (Desde)
                      </label>
                      <input
                        type="date"
                        value={filtros.fechaExamenDesde}
                        onChange={(e) => setFiltros({...filtros, fechaExamenDesde: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Examen (Hasta)
                      </label>
                      <input
                        type="date"
                        value={filtros.fechaExamenHasta}
                        onChange={(e) => setFiltros({...filtros, fechaExamenHasta: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.examenesCompletos}
                        onChange={(e) => setFiltros({...filtros, examenesCompletos: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Solo empleados con exámenes completos
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.vigenciaVencida}
                        onChange={(e) => setFiltros({...filtros, vigenciaVencida: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Incluir certificados vencidos
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Opciones Adicionales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Opciones Adicionales</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enviar Notificaciones
                  </label>
                  <p className="text-xs text-gray-500">Notificar a empleadores por email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opciones.enviarNotificaciones}
                    onChange={(e) => setOpciones({...opciones, enviarNotificaciones: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Visible para Empresa
                  </label>
                  <p className="text-xs text-gray-500">Hacer certificados visibles en el portal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opciones.visibilidadEmpresa}
                    onChange={(e) => setOpciones({...opciones, visibilidadEmpresa: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento Personalizada
                  </label>
                  <input
                    type="date"
                    value={opciones.fechaVencimientoPersonalizada}
                    onChange={(e) => setOpciones({...opciones, fechaVencimientoPersonalizada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notificar Días Antes
                  </label>
                  <select
                    value={opciones.notificacionesDiasAntes}
                    onChange={(e) => setOpciones({...opciones, notificacionesDiasAntes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={7}>7 días</option>
                    <option value={15}>15 días</option>
                    <option value={30}>30 días</option>
                    <option value={60}>60 días</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Generación */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generar Certificados</h3>
                <p className="text-gray-600 text-sm">
                  Se generarán {pacientesFiltrados.length} certificados
                </p>
              </div>
              <button
                onClick={iniciarGeneracion}
                disabled={!empresaSeleccionada || !tipoCertificado || generando}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generando ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Iniciar Generación</span>
                  </>
                )}
              </button>
            </div>

            {/* Barra de Progreso */}
            {generando && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso de Generación</span>
                  <span>{progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Vista Previa y Resultados */}
        <div className="space-y-6">
          {/* Vista Previa */}
          {mostrarPreview && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Vista Previa</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen de Filtros</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Empresa: {empresa?.nombre || 'No seleccionada'}</p>
                    <p>• Tipo: {tipo?.nombre || 'No seleccionado'}</p>
                    <p>• Empleados: {pacientesFiltrados.length}</p>
                    <p>• Puestos: {filtros.puestosTrabajo.length > 0 ? filtros.puestosTrabajo.join(', ') : 'Todos'}</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">Estadísticas Estimadas</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Tiempo estimado: ~{Math.ceil(pacientesFiltrados.length / 10)} min</p>
                    <p>• PDFs a generar: {pacientesFiltrados.length}</p>
                    <p>• Emails a enviar: {opciones.enviarNotificaciones ? pacientesFiltrados.length : 0}</p>
                    <p>• Notificaciones: {opciones.notificacionesDiasAntes} días antes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resultados */}
          {resultado && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Resultados</h3>
              
              <div className="space-y-4">
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <h4 className="font-semibold text-success">Generación Completada</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Certificados generados: {resultado.totalGenerados}</p>
                    <p>• Fecha: {new Date(resultado.fechaGeneracion).toLocaleString()}</p>
                    <p>• Estado: {resultado.estado}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={exportarResultados}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                  >
                    <DownloadIcon size={16} />
                    <span>Exportar</span>
                  </button>
                  <button
                    onClick={() => setResultado(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empleados que serán procesados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Empleados a Procesar ({pacientesFiltrados.length})
            </h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {pacientesFiltrados.map(paciente => (
                <div key={paciente.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <User className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {paciente.nombre} {paciente.apellidos}
                    </p>
                    <p className="text-xs text-gray-500">{paciente.puestoTrabajo}</p>
                  </div>
                  <div className="w-2 h-2 bg-success rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
