// Componente para captura y gestión de resultados de exámenes
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Plus,
  Edit,
  Save,
  X,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Eye,
  Clock,
  Bell,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Resultado {
  id: string
  examenId: string
  empleado: string
  tipoExamen: string
  laboratorios: {
    nombre: string
    valor: string
    valorNormal: string
    unidad: string
    estado: 'normal' | 'fuera_rango' | 'critico'
  }[]
  observaciones: string
  diagnostico: string
  aptoParaTrabajar: boolean
  restricciones: string[]
  fechaCaptura: string
  capturadoPor: string
  validado: boolean
  validadoPor?: string
  fechaValidacion?: string
}

interface FormularioResultadoProps {
  examen: any
  onClose: () => void
  onSave: (resultado: Resultado) => void
}

export function FormularioCapturaResultados({ examen, onClose, onSave }: FormularioResultadoProps) {
  const [resultado, setResultado] = useState<Partial<Resultado>>({
    examenId: examen.id,
    empleado: examen.empleado,
    tipoExamen: examen.tipoExamen,
    laboratorios: [],
    observaciones: '',
    diagnostico: '',
    aptoParaTrabajar: true,
    restricciones: [],
    fechaCaptura: new Date().toISOString().split('T')[0],
    capturadoPor: 'Dr. Usuario Actual',
    validado: false
  })

  const [nuevoLaboratorio, setNuevoLaboratorio] = useState({
    nombre: '',
    valor: '',
    valorNormal: '',
    unidad: ''
  })

  const [restriccion, setRestriccion] = useState('')

  // Datos de laboratorios con valores normales
  const laboratoriosBase = {
    'Hemoglobina': { normal: '12-16 g/dL (F), 14-18 g/dL (M)', unidad: 'g/dL' },
    'Glucosa': { normal: '70-110 mg/dL', unidad: 'mg/dL' },
    'Colesterol Total': { normal: '<200 mg/dL', unidad: 'mg/dL' },
    'Presión Arterial': { normal: '120/80 mmHg', unidad: 'mmHg' },
    'Espirometría FVC': { normal: '>80% del predicted', unidad: '%' },
    'Espirometría FEV1': { normal: '>80% del predicted', unidad: '%' },
    'Audiometría 500Hz': { normal: '<25 dB HL', unidad: 'dB HL' },
    'Audiometría 1000Hz': { normal: '<25 dB HL', unidad: 'dB HL' },
    'Audiometría 2000Hz': { normal: '<25 dB HL', unidad: 'dB HL' },
    'Radiografía de tórax': { normal: 'Sin anormalidades', unidad: '' },
    'Electrocardiograma': { normal: 'Rítmo sinusal normal', unidad: '' },
    'Función hepática ALT': { normal: '7-56 U/L', unidad: 'U/L' },
    'Función hepática AST': { normal: '10-40 U/L', unidad: 'U/L' }
  }

  const determinarEstado = (nombre: string, valor: string): 'normal' | 'fuera_rango' | 'critico' => {
    const valorLimpio = valor.toLowerCase().trim()
    
    // Valores que indican estado crítico
    if (valorLimpio.includes('crítico') || valorLimpio.includes('grave') || valorLimpio.includes('anormal')) {
      return 'critico'
    }
    
    // Valores normales por tipo de examen
    switch (nombre) {
      case 'Hemoglobina':
        const hemo = parseFloat(valor)
        if (isNaN(hemo)) return 'normal'
        if (hemo < 8 || hemo > 20) return 'critico'
        if (hemo < 10 || hemo > 18) return 'fuera_rango'
        return 'normal'
        
      case 'Glucosa':
        const glus = parseFloat(valor)
        if (isNaN(glus)) return 'normal'
        if (glus > 400 || glus < 50) return 'critico'
        if (glus > 126 || glus < 70) return 'fuera_rango'
        return 'normal'
        
      case 'Presión Arterial':
        const sistolica = parseInt(valor.split('/')[0])
        if (isNaN(sistolica)) return 'normal'
        if (sistolica > 180 || sistolica < 90) return 'critico'
        if (sistolica > 140 || sistolica < 100) return 'fuera_rango'
        return 'normal'
        
      default:
        return valorLimpio.includes('normal') || valorLimpio.includes('negativo') ? 'normal' : 'fuera_rango'
    }
  }

  const agregarLaboratorio = () => {
    if (!nuevoLaboratorio.nombre || !nuevoLaboratorio.valor) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    const estado = determinarEstado(nuevoLaboratorio.nombre, nuevoLaboratorio.valor)
    
    const laboratorio = {
      nombre: nuevoLaboratorio.nombre,
      valor: nuevoLaboratorio.valor,
      valorNormal: nuevoLaboratorio.valorNormal || laboratoriosBase[nuevoLaboratorio.nombre]?.normal || '',
      unidad: nuevoLaboratorio.unidad || laboratoriosBase[nuevoLaboratorio.nombre]?.unidad || '',
      estado
    }

    setResultado(prev => ({
      ...prev,
      laboratorios: [...(prev.laboratorios || []), laboratorio]
    }))

    setNuevoLaboratorio({ nombre: '', valor: '', valorNormal: '', unidad: '' })
    toast.success('Laboratorio agregado')
  }

  const removerLaboratorio = (index: number) => {
    setResultado(prev => ({
      ...prev,
      laboratorios: prev.laboratorios?.filter((_, i) => i !== index) || []
    }))
  }

  const agregarRestriccion = () => {
    if (restriccion.trim() && !resultado.restricciones?.includes(restriccion.trim())) {
      setResultado(prev => ({
        ...prev,
        restricciones: [...(prev.restricciones || []), restriccion.trim()]
      }))
      setRestriccion('')
    }
  }

  const removerRestriccion = (index: number) => {
    setResultado(prev => ({
      ...prev,
      restricciones: prev.restricciones?.filter((_, i) => i !== index) || []
    }))
  }

  const calcularAlerta = (laboratorios: any[]): 'ninguna' | 'precaucion' | 'alerta' => {
    const criticos = laboratorios.filter(lab => lab.estado === 'critico').length
    const fueraRango = laboratorios.filter(lab => lab.estado === 'fuera_rango').length
    
    if (criticos > 0) return 'alerta'
    if (fueraRango > 0) return 'precaucion'
    return 'ninguna'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resultado.laboratorios?.length) {
      toast.error('Debe agregar al menos un resultado de laboratorio')
      return
    }

    const nuevoResultado: Resultado = {
      id: `RES${Date.now()}`,
      examenId: resultado.examenId!,
      empleado: resultado.empleado!,
      tipoExamen: resultado.tipoExamen!,
      laboratorios: resultado.laboratorios!,
      observaciones: resultado.observaciones || '',
      diagnostico: resultado.diagnostico || '',
      aptoParaTrabajar: resultado.aptoParaTrabajar!,
      restricciones: resultado.restricciones || [],
      fechaCaptura: resultado.fechaCaptura!,
      capturadoPor: resultado.capturadoPor!,
      validado: false
    }

    onSave(nuevoResultado)
    toast.success('Resultados guardados exitosamente')
    onClose()
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'fuera_rango': return 'text-yellow-600 bg-yellow-100'
      case 'critico': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'normal': return <CheckCircle size={16} />
      case 'fuera_rango': return <AlertTriangle size={16} />
      case 'critico': return <X size={16} />
      default: return <Clock size={16} />
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Captura de Resultados</h2>
              <p className="text-sm text-gray-600">{examen.empleado} - {examen.tipoExamen}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Examen */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Examen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Empleado</label>
                <p className="text-gray-900 font-medium">{examen.empleado}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Empresa</label>
                <p className="text-gray-900 font-medium">{examen.empresa}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Realización</label>
                <p className="text-gray-900 font-medium">{examen.fechaRealizacion || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Laboratorios */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Resultados de Laboratorios
            </h3>
            
            {/* Lista de laboratorios existentes */}
            {resultado.laboratorios && resultado.laboratorios.length > 0 && (
              <div className="mb-6">
                <div className="space-y-3">
                  {resultado.laboratorios.map((lab, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{lab.nombre}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getEstadoColor(lab.estado)}`}>
                              {getEstadoIcon(lab.estado)}
                              <span>{lab.estado}</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Resultado:</span>
                              <p className="font-medium">{lab.valor} {lab.unidad}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Valor Normal:</span>
                              <p className="font-medium">{lab.valorNormal}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Estado:</span>
                              <p className={`font-medium ${
                                lab.estado === 'normal' ? 'text-green-600' : 
                                lab.estado === 'fuera_rango' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {lab.estado === 'normal' ? 'Normal' : 
                                 lab.estado === 'fuera_rango' ? 'Fuera de Rango' : 'Crítico'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerLaboratorio(index)}
                          className="text-red-600 hover:text-red-800 ml-4"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulario para agregar nuevo laboratorio */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Agregar Nuevo Resultado</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                  value={nuevoLaboratorio.nombre}
                  onChange={(e) => {
                    const nombre = e.target.value
                    const info = laboratoriosBase[nombre]
                    setNuevoLaboratorio(prev => ({
                      ...prev,
                      nombre,
                      valorNormal: info?.normal || '',
                      unidad: info?.unidad || ''
                    }))
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar examen</option>
                  {Object.keys(laboratoriosBase).map((lab) => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={nuevoLaboratorio.valor}
                  onChange={(e) => setNuevoLaboratorio(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="Valor encontrado"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <input
                  type="text"
                  value={nuevoLaboratorio.valorNormal}
                  onChange={(e) => setNuevoLaboratorio(prev => ({ ...prev, valorNormal: e.target.value }))}
                  placeholder="Valor normal"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <input
                  type="text"
                  value={nuevoLaboratorio.unidad}
                  onChange={(e) => setNuevoLaboratorio(prev => ({ ...prev, unidad: e.target.value }))}
                  placeholder="Unidad"
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <button
                  type="button"
                  onClick={agregarLaboratorio}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Evaluación Médica */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluación Médica</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico Médico
                </label>
                <textarea
                  value={resultado.diagnostico}
                  onChange={(e) => setResultado(prev => ({ ...prev, diagnostico: e.target.value }))}
                  rows={3}
                  placeholder="Diagnóstico médico basado en los resultados..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Clínicas
                </label>
                <textarea
                  value={resultado.observaciones}
                  onChange={(e) => setResultado(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows={3}
                  placeholder="Observaciones adicionales del médico..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="apto"
                    checked={resultado.aptoParaTrabajar}
                    onChange={(e) => setResultado(prev => ({ ...prev, aptoParaTrabajo: e.target.checked }))}
                    className="rounded border-gray-200 text-primary focus:ring-primary"
                  />
                  <label htmlFor="apto" className="text-sm font-medium text-gray-700">
                    Apto para trabajar
                  </label>
                </div>

                {calcularAlerta(resultado.laboratorios || []) !== 'ninguna' && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    calcularAlerta(resultado.laboratorios || []) === 'alerta' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">
                      {calcularAlerta(resultado.laboratorios || []) === 'alerta' ? 'Requiere Atención Inmediata' : 'Requiere Seguimiento'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Restricciones */}
          {!resultado.aptoParaTrabajar && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Restricciones Médicas</h3>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {resultado.restricciones?.map((restric, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {restric}
                      <button
                        type="button"
                        onClick={() => removerRestriccion(index)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={restriccion}
                    onChange={(e) => setRestriccion(e.target.value)}
                    placeholder="Agregar restricción médica..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarRestriccion())}
                  />
                  <button
                    type="button"
                    onClick={agregarRestriccion}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Guardar Resultados</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Componente principal para gestión de resultados
export function GestionResultados() {
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'normalizados' | 'pendientes'>('todos')

  const filteredResultados = resultados.filter(resultado => {
    const matchesSearch = resultado.empleado.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filtroEstado === 'todos' || 
                         (filtroEstado === 'normalizados' && resultado.validado) ||
                         (filtroEstado === 'pendientes' && !resultado.validado)
    return matchesSearch && matchesEstado
  })

  const handleNuevoResultado = (nuevoResultado: Resultado) => {
    setResultados(prev => [...prev, nuevoResultado])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Resultados</h2>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
          <Plus size={16} />
          <span>Nuevo Resultado</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar resultados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="todos">Todos los resultados</option>
          <option value="normalizados">Normalizados</option>
          <option value="pendientes">Pendientes de validación</option>
        </select>
      </div>

      {/* Lista de resultados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Examen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredResultados.map((resultado) => (
                  <motion.tr
                    key={resultado.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resultado.empleado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{resultado.tipoExamen}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resultado.aptoParaTrabajar 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {resultado.aptoParaTrabajar ? 'Apto' : 'No Apto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resultado.validado 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resultado.validado ? 'Validado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{resultado.fechaCaptura}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary hover:text-primary/80">
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Award size={16} />
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

      {filteredResultados.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay resultados</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No se encontraron resultados con ese criterio de búsqueda' : 'Aún no se han capturado resultados de exámenes'}
          </p>
        </div>
      )}
    </div>
  )
}
