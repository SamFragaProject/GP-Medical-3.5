// Sistema de exportación automática de reportes
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Mail,
  Clock,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Building2,
  Zap,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ExportadorAutomaticoProps {
  filtros: any
}

interface ExportacionProgramada {
  id: string
  nombre: string
  tipoReporte: string
  formato: 'pdf' | 'excel' | 'csv'
  frecuencia: 'diario' | 'semanal' | 'mensual'
  activo: boolean
  ultimaEjecucion: string
  proximaEjecucion: string
  destinatarios: string[]
  filtros: any
}

export function ExportadorAutomatico({ filtros }: ExportadorAutomaticoProps) {
  const [exportaciones, setExportaciones] = useState<ExportacionProgramada[]>([
    {
      id: '1',
      nombre: 'Reporte Empresarial Semanal',
      tipoReporte: 'Resumen Ejecutivo',
      formato: 'pdf',
      frecuencia: 'semanal',
      activo: true,
      ultimaEjecucion: '2025-10-28 08:00',
      proximaEjecucion: '2025-11-04 08:00',
      destinatarios: ['direccion@empresa.com', 'rrhh@empresa.com'],
      filtros: { empresa: 'todas' }
    },
    {
      id: '2',
      nombre: 'Analytics de Cumplimiento',
      tipoReporte: 'Cumplimiento Normativo',
      formato: 'excel',
      frecuencia: 'mensual',
      activo: true,
      ultimaEjecucion: '2025-10-01 09:00',
      proximaEjecucion: '2025-11-01 09:00',
      destinatarios: ['compliance@empresa.com'],
      filtros: { empresa: 'todas' }
    },
    {
      id: '3',
      nombre: 'Datos de Empleados',
      tipoReporte: 'Base de Datos',
      formato: 'csv',
      frecuencia: 'diario',
      activo: false,
      ultimaEjecucion: '2025-10-31 10:00',
      proximaEjecucion: '2025-11-01 10:00',
      destinatarios: ['admin@empresa.com'],
      filtros: { empresa: 'todas' }
    }
  ])

  const [nuevaExportacion, setNuevaExportacion] = useState({
    nombre: '',
    tipoReporte: '',
    formato: 'pdf',
    frecuencia: 'mensual',
    emailDestino: ''
  })

  const formatos = [
    { id: 'pdf', nombre: 'PDF', icon: FileText, descripcion: 'Documento para lectura' },
    { id: 'excel', nombre: 'Excel', icon: FileSpreadsheet, descripcion: 'Hoja de cálculo' },
    { id: 'csv', nombre: 'CSV', icon: FileImage, descripcion: 'Datos tabulares' }
  ]

  const tiposReporte = [
    'Resumen Ejecutivo',
    'Cumplimiento Normativo',
    'Análisis de Riesgos',
    'Base de Datos Empleados',
    'Analytics Predictivos',
    'Reporte de Ausentismo'
  ]

  const ejecutarAhora = async (exportacion: ExportacionProgramada) => {
    toast.success(`Ejecutando exportación: ${exportacion.nombre}...`)
    
    // Simular ejecución
    setTimeout(() => {
      toast.success(`Exportación completada: ${exportacion.nombre}`)
      setExportaciones(prev => prev.map(exp => 
        exp.id === exportacion.id 
          ? { ...exp, ultimaEjecucion: new Date().toLocaleString('es-MX') }
          : exp
      ))
    }, 2000)
  }

  const crearExportacion = () => {
    if (!nuevaExportacion.nombre || !nuevaExportacion.tipoReporte) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    const nuevaExp: ExportacionProgramada = {
      id: Date.now().toString(),
      nombre: nuevaExportacion.nombre,
      tipoReporte: nuevaExportacion.tipoReporte,
      formato: nuevaExportacion.formato as any,
      frecuencia: nuevaExportacion.frecuencia as any,
      activo: true,
      ultimaEjecucion: 'Nunca',
      proximaEjecucion: new Date().toLocaleDateString('es-MX'),
      destinatarios: nuevaExportacion.emailDestino.split(',').map(e => e.trim()),
      filtros: filtros
    }

    setExportaciones([...exportaciones, nuevaExp])
    setNuevaExportacion({
      nombre: '',
      tipoReporte: '',
      formato: 'pdf',
      frecuencia: 'mensual',
      emailDestino: ''
    })
    toast.success('Exportación programada exitosamente')
  }

  const toggleActivo = (id: string) => {
    setExportaciones(prev => prev.map(exp =>
      exp.id === id ? { ...exp, activo: !exp.activo } : exp
    ))
    toast.success('Estado de exportación actualizado')
  }

  const eliminarExportacion = (id: string) => {
    setExportaciones(prev => prev.filter(exp => exp.id !== id))
    toast.success('Exportación eliminada')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Download className="h-6 w-6 text-orange-600 mr-2" />
            Exportación Automática
          </h2>
          <p className="text-gray-600">Programación y gestión de exportaciones automáticas</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Exportaciones activas</p>
            <p className="text-2xl font-bold text-primary">
              {exportaciones.filter(e => e.activo).length}
            </p>
          </div>
        </div>
      </div>

      {/* Crear nueva exportación */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Exportación Programada</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nuevaExportacion.nombre}
              onChange={(e) => setNuevaExportacion({ ...nuevaExportacion, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nombre del reporte"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
            <select
              value={nuevaExportacion.tipoReporte}
              onChange={(e) => setNuevaExportacion({ ...nuevaExportacion, tipoReporte: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar tipo</option>
              {tiposReporte.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
            <select
              value={nuevaExportacion.formato}
              onChange={(e) => setNuevaExportacion({ ...nuevaExportacion, formato: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {formatos.map(formato => (
                <option key={formato.id} value={formato.id}>{formato.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
            <select
              value={nuevaExportacion.frecuencia}
              onChange={(e) => setNuevaExportacion({ ...nuevaExportacion, frecuencia: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Emails de destino</label>
          <input
            type="text"
            value={nuevaExportacion.emailDestino}
            onChange={(e) => setNuevaExportacion({ ...nuevaExportacion, emailDestino: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="email1@empresa.com, email2@empresa.com"
          />
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={crearExportacion}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Crear Exportación
          </button>
        </div>
      </div>

      {/* Lista de exportaciones programadas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportaciones Programadas</h3>
        <div className="space-y-4">
          {exportaciones.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                exp.activo ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    exp.activo ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {exp.formato === 'pdf' && <FileText className={`h-6 w-6 ${
                      exp.activo ? 'text-green-600' : 'text-gray-600'
                    }`} />}
                    {exp.formato === 'excel' && <FileSpreadsheet className={`h-6 w-6 ${
                      exp.activo ? 'text-green-600' : 'text-gray-600'
                    }`} />}
                    {exp.formato === 'csv' && <FileImage className={`h-6 w-6 ${
                      exp.activo ? 'text-green-600' : 'text-gray-600'
                    }`} />}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">{exp.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      {exp.tipoReporte} • {exp.formato.toUpperCase()} • {exp.frecuencia}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Última: {exp.ultimaEjecucion}
                      </span>
                      <span className="text-xs text-gray-500">
                        Próxima: {exp.proximaEjecucion}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Estado */}
                  <div className="flex items-center space-x-2">
                    {exp.activo ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      exp.activo ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {exp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  {/* Controles */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActivo(exp.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        exp.activo 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={exp.activo ? 'Pausar' : 'Activar'}
                    >
                      {exp.activo ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    
                    <button
                      onClick={() => ejecutarAhora(exp)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                      title="Ejecutar ahora"
                    >
                      <Zap size={16} />
                    </button>
                    
                    <button
                      onClick={() => eliminarExportacion(exp.id)}
                      className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Destinatarios */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Destinatarios: {exp.destinatarios.join(', ')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estadísticas de exportación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-3xl font-bold text-green-600">
                {exportaciones.length * 4}
              </p>
              <p className="text-sm text-gray-600">Exportaciones realizadas</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximas</p>
              <p className="text-3xl font-bold text-blue-600">
                {exportaciones.filter(e => e.activo).length}
              </p>
              <p className="text-sm text-gray-600">Exportaciones pendientes</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa Éxito</p>
              <p className="text-3xl font-bold text-purple-600">98.7%</p>
              <p className="text-sm text-gray-600">Exportaciones exitosas</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}