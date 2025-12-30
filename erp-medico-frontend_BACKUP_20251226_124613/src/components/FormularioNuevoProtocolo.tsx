// Formulario para crear nuevo protocolo ocupacional
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Plus,
  Trash2,
  Save,
  FileText,
  Users,
  Clock,
  Shield,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FormularioNuevoProtocoloProps {
  onClose: () => void
  onSave: (protocolo: any) => void
}

interface FormData {
  nombre: string
  tipoPuesto: string
  descripcion: string
  examenesIncluidos: string[]
  periodicidad: string
  requisitosPrecios: string[]
  normativas: string[]
  duracionEstimada: number
  active: boolean
}

export function FormularioNuevoProtocolo({ onClose, onSave }: FormularioNuevoProtocoloProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipoPuesto: '',
    descripcion: '',
    examenesIncluidos: [],
    periodicidad: '',
    requisitosPrecios: [],
    normativas: [],
    duracionEstimada: 2,
    active: true
  })

  const [nuevoExamen, setNuevoExamen] = useState('')
  const [nuevoRequisito, setNuevoRequisito] = useState('')
  const [nuevaNormativa, setNuevaNormativa] = useState('')

  // Datos predefinidos
  const tiposPuesto = [
    'Oficina',
    'Soldadura',
    'Construcción',
    'Químico',
    'Conductor',
    'Minero',
    'Supervisor',
    'Mecánico',
    'Eléctrico',
    'Plomero'
  ]

  const examenesDisponibles = [
    'Exploración clínica general',
    'Radiografía de tórax',
    'Espirometría',
    'Audiometría',
    'Electrocardiograma',
    'Electroencefalograma',
    'Hemograma completo',
    'Análisis de orina',
    'Función hepática',
    'Función renal',
    'Biomarcadores químicos',
    'Examen de visión',
    'Examen de equilibrio',
    'Evaluación sicológica',
    'Test de vértigo',
    'Biometría hemática',
    'Perfil lipídico',
    'Glucosa en ayunas',
    'Prueba de esfuerzo',
    'Examen dermatológico'
  ]

  const periodicidades = [
    'Cada 3 meses',
    'Cada 6 meses',
    'Anual',
    'Cada 2 años',
    'Cada 3 años',
    'Según exposición',
    'Post-incidente'
  ]

  const requisitosPreciosDisponibles = [
    'Examen físico completo: $300',
    'Radiografía de tórax: $450',
    'Espirometría: $250',
    'Audiometría: $200',
    'Electrocardiograma: $350',
    'Análisis de laboratorio: $400',
    'Evaluación especializada: $500'
  ]

  const normativasMexicanas = [
    'NOM-006-STPS-2014',
    'NOM-009-STPS-2014',
    'NOM-010-STPS-2014',
    'NOM-017-STPS-2008',
    'NOM-025-STPS-2008',
    'NOM-030-STPS-2009',
    'NOM-043-STPS-2015',
    'NOM-047-STPS-2015',
    'Ley Federal del Trabajo',
    'Reglamento Federal de Seguridad'
  ]

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const agregarExamen = () => {
    if (nuevoExamen.trim() && !formData.examenesIncluidos.includes(nuevoExamen)) {
      setFormData(prev => ({
        ...prev,
        examenesIncluidos: [...prev.examenesIncluidos, nuevoExamen]
      }))
      setNuevoExamen('')
    }
  }

  const removerExamen = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examenesIncluidos: prev.examenesIncluidos.filter((_, i) => i !== index)
    }))
  }

  const agregarRequisito = () => {
    if (nuevoRequisito.trim() && !formData.requisitosPrecios.includes(nuevoRequisito)) {
      setFormData(prev => ({
        ...prev,
        requisitosPrecios: [...prev.requisitosPrecios, nuevoRequisito]
      }))
      setNuevoRequisito('')
    }
  }

  const removerRequisito = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requisitosPrecios: prev.requisitosPrecios.filter((_, i) => i !== index)
    }))
  }

  const agregarNormativa = () => {
    if (nuevaNormativa.trim() && !formData.normativas.includes(nuevaNormativa)) {
      setFormData(prev => ({
        ...prev,
        normativas: [...prev.normativas, nuevaNormativa]
      }))
      setNuevaNormativa('')
    }
  }

  const removerNormativa = (index: number) => {
    setFormData(prev => ({
      ...prev,
      normativas: prev.normativas.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.tipoPuesto || !formData.examenesIncluidos.length) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    const nuevoProtocolo = {
      id: `PROT${Date.now()}`,
      nombre: formData.nombre,
      tipoPuesto: formData.tipoPuesto,
      descripcion: formData.descripcion,
      examenesIncluidos: formData.examenesIncluidos,
      periodicidad: formData.periodicidad,
      requisitosPrecios: formData.requisitosPrecios,
      normativas: formData.normativas,
      duracionEstimada: formData.duracionEstimada,
      activo: formData.active,
      fechaCreacion: new Date().toISOString().split('T')[0],
      creadoPor: 'Usuario Actual'
    }

    onSave(nuevoProtocolo)
    toast.success('Protocolo creado exitosamente')
    onClose()
  }

  const calcularCostoTotal = () => {
    let costoTotal = 0
    formData.requisitosPrecios.forEach(requisito => {
      const precio = requisito.match(/\$(\d+)/)
      if (precio) {
        costoTotal += parseInt(precio[1])
      }
    })
    return costoTotal
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuevo Protocolo</h2>
              <p className="text-sm text-gray-600">Crear protocolo médico personalizado</p>
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
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Protocolo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Protocolo Soldador Industrial"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Puesto *
                </label>
                <select
                  value={formData.tipoPuesto}
                  onChange={(e) => handleInputChange('tipoPuesto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposPuesto.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periodicidad
                </label>
                <select
                  value={formData.periodicidad}
                  onChange={(e) => handleInputChange('periodicidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar periodicidad</option>
                  {periodicidades.map((periodo) => (
                    <option key={periodo} value={periodo}>{periodo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración Estimada (horas)
                </label>
                <input
                  type="number"
                  value={formData.duracionEstimada}
                  onChange={(e) => handleInputChange('duracionEstimada', parseInt(e.target.value))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                placeholder="Descripción detallada del protocolo y sus objetivos..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <input
                type="checkbox"
                id="activo"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="rounded border-gray-200 text-primary focus:ring-primary"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Protocolo activo (disponible para usar)
              </label>
            </div>
          </div>

          {/* Exámenes Incluidos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Exámenes Incluidos *
            </h3>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.examenesIncluidos.map((examen, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary text-white rounded-full text-sm"
                  >
                    {examen}
                    <button
                      type="button"
                      onClick={() => removerExamen(index)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <select
                  value={nuevoExamen}
                  onChange={(e) => setNuevoExamen(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar examen</option>
                  {examenesDisponibles.filter(examen => !formData.examenesIncluidos.includes(examen)).map((examen) => (
                    <option key={examen} value={examen}>{examen}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={agregarExamen}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.examenesIncluidos.length} examen(es) seleccionado(s)
              </p>
            </div>
          </div>

          {/* Costos y Requisitos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-primary" />
              Costos y Requisitos
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Requisitos y Precios
                </label>
                <div className="text-lg font-bold text-primary">
                  Total: ${calcularCostoTotal().toLocaleString()} MXN
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                {formData.requisitosPrecios.map((requisito, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <span className="text-sm text-gray-700">{requisito}</span>
                    <button
                      type="button"
                      onClick={() => removerRequisito(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <select
                  value={nuevoRequisito}
                  onChange={(e) => setNuevoRequisito(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar requisito</option>
                  {requisitosPreciosDisponibles.filter(req => !formData.requisitosPrecios.includes(req)).map((req) => (
                    <option key={req} value={req}>{req}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={agregarRequisito}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Normativas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Normativas Mexicanas
            </h3>
            
            <div className="mb-4">
              <div className="space-y-2 mb-3">
                {formData.normativas.map((normativa, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <span className="text-sm text-gray-700">{normativa}</span>
                    <button
                      type="button"
                      onClick={() => removerNormativa(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <select
                  value={nuevaNormativa}
                  onChange={(e) => setNuevaNormativa(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar normativa</option>
                  {normativasMexicanas.filter(norm => !formData.normativas.includes(norm)).map((norm) => (
                    <option key={norm} value={norm}>{norm}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={agregarNormativa}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

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
              <span>Crear Protocolo</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}