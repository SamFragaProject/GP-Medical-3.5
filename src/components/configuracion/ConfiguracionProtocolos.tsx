// Configuración de Protocolos Médicos
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Activity, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Filter
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { ProtocoloMedico, TestProtocolo } from '@/types/configuracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface ProtocoloFormData {
  name: string
  type: string
  description: string
  tests: TestProtocolo[]
  price: number
  isActive: boolean
}

interface TestFormData {
  name: string
  category: string
  isRequired: boolean
  description: string
  normalRanges: string
}

function TestItem({ test, index, onEdit, onDelete }: { 
  test: TestProtocolo
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${test.isRequired ? 'bg-red-500' : 'bg-yellow-500'}`} />
        <div>
          <h4 className="font-medium text-gray-900">{test.name}</h4>
          <p className="text-sm text-gray-600">{test.category}</p>
          {test.normalRanges && (
            <p className="text-xs text-gray-500 mt-1">Normal: {test.normalRanges}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={test.isRequired ? 'destructive' : 'secondary'}>
          {test.isRequired ? 'Obligatorio' : 'Opcional'}
        </Badge>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit size={14} />
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600">
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}

function TestForm({ test, onSave, onCancel }: { 
  test?: TestProtocolo
  onSave: (data: TestFormData) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<TestFormData>({
    name: test?.name || '',
    category: test?.category || '',
    isRequired: test?.isRequired ?? true,
    description: test?.description || '',
    normalRanges: test?.normalRanges || ''
  })

  const categories = [
    'Vitales',
    'Antropométrica',
    'Oftalmológica',
    'Audiométrica',
    'Cardiológica',
    'Respiratoria',
    'Neurológica',
    'Laboratorio',
    'Toxicológica',
    'Psicológica',
    'Ergonómica',
    'Otra'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del examen *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Presión arterial"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del examen y sus objetivos"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valores normales
        </label>
        <Input
          value={formData.normalRanges}
          onChange={(e) => setFormData({ ...formData, normalRanges: e.target.value })}
          placeholder="120/80 mmHg, 18.5-24.9, etc."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isRequired"
          checked={formData.isRequired}
          onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700">
          Examen obligatorio
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {test ? 'Actualizar' : 'Agregar'} Examen
        </Button>
      </div>
    </form>
  )
}

function ProtocoloForm({ protocolo, onSave, onCancel }: { 
  protocolo?: ProtocoloMedico
  onSave: (data: ProtocoloFormData) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<ProtocoloFormData>({
    name: protocolo?.name || '',
    type: protocolo?.type || '',
    description: protocolo?.description || '',
    tests: protocolo?.tests || [],
    price: protocolo?.price || 0,
    isActive: protocolo?.isActive ?? true
  })

  const [showTestModal, setShowTestModal] = useState(false)
  const [testEditIndex, setTestEditIndex] = useState<number | null>(null)
  const [testEditData, setTestEditData] = useState<TestProtocolo | null>(null)

  const types = [
    'Medicina General',
    'Examen Ingreso',
    'Examen Periódico',
    'Examen Post-Incapacidad',
    'Examen Retiro',
    'Examen Especial',
    'Evaluación Ergonómica',
    'Evaluación Psicológica',
    'Evaluación Toxicológica'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.type || formData.tests.length === 0) {
      toast.error('Completa todos los campos y agrega al menos un examen')
      return
    }
    onSave(formData)
  }

  const handleAddTest = (testData: TestFormData) => {
    const newTest: TestProtocolo = {
      id: Date.now().toString(),
      name: testData.name,
      category: testData.category,
      isRequired: testData.isRequired,
      description: testData.description,
      normalRanges: testData.normalRanges
    }

    const updatedTests = testEditIndex !== null 
      ? formData.tests.map((test, index) => 
          index === testEditIndex ? newTest : test
        )
      : [...formData.tests, newTest]

    setFormData({ ...formData, tests: updatedTests })
    setShowTestModal(false)
    setTestEditIndex(null)
    setTestEditData(null)
  }

  const handleEditTest = (test: TestProtocolo, index: number) => {
    setTestEditIndex(index)
    setTestEditData(test)
    setShowTestModal(true)
  }

  const handleDeleteTest = (index: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este examen?')) {
      const updatedTests = formData.tests.filter((_, i) => i !== index)
      setFormData({ ...formData, tests: updatedTests })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del protocolo *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Examen Médico General"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de protocolo *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Seleccionar tipo</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio (MXN)
          </label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            placeholder="800"
            min="0"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Protocolo activo
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del protocolo médico y sus objetivos"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Exámenes incluidos *
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTestModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agregar examen</span>
          </Button>
        </div>

        {formData.tests.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No hay exámenes agregados</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTestModal(true)}
              className="mt-3"
            >
              Agregar primer examen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.tests.map((test, index) => (
              <TestItem
                key={index}
                test={test}
                index={index}
                onEdit={() => handleEditTest(test, index)}
                onDelete={() => handleDeleteTest(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {protocolo ? 'Actualizar' : 'Crear'} Protocolo
        </Button>
      </div>

      {/* Modal para agregar/editar examen */}
      <Dialog open={showTestModal} onOpenChange={(open) => !open && setShowTestModal(false)}>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {testEditIndex !== null ? 'Editar Examen' : 'Agregar Nuevo Examen'}
            </h2>
            <TestForm
              test={testEditData}
              onSave={handleAddTest}
              onCancel={() => setShowTestModal(false)}
            />
          </Card>
        </div>
      </Dialog>
    </form>
  )
}

export function ConfiguracionProtocolos() {
  const { settings } = useConfiguracion()
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [protocoloSeleccionado, setProtocoloSeleccionado] = useState<ProtocoloMedico | null>(null)

  const protocolosFiltrados = settings.protocolos.filter(protocolo => {
    const matchesSearch = protocolo.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                         protocolo.description.toLowerCase().includes(busqueda.toLowerCase())
    const matchesType = !filtroTipo || protocolo.type === filtroTipo
    const matchesState = filtroEstado === '' || 
                        (filtroEstado === 'active' && protocolo.isActive) ||
                        (filtroEstado === 'inactive' && !protocolo.isActive)
    
    return matchesSearch && matchesType && matchesState
  })

  const tiposUnicos = [...new Set(settings.protocolos.map(p => p.type))]

  const handleCrearProtocolo = () => {
    setModalType('create')
    setProtocoloSeleccionado(null)
    setShowModal(true)
  }

  const handleEditarProtocolo = (protocolo: ProtocoloMedico) => {
    setModalType('edit')
    setProtocoloSeleccionado(protocolo)
    setShowModal(true)
  }

  const handleGuardarProtocolo = (data: ProtocoloFormData) => {
    console.log('Guardar protocolo:', data)
    setShowModal(false)
    toast.success('Protocolo guardado exitosamente')
  }

  const renderModal = () => {
    if (!showModal) return null

    return (
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {modalType === 'create' ? 'Crear Nuevo Protocolo' : 'Editar Protocolo'}
            </h2>
            <ProtocoloForm
              protocolo={modalType === 'edit' ? protocoloSeleccionado : undefined}
              onSave={handleGuardarProtocolo}
              onCancel={() => setShowModal(false)}
            />
          </Card>
        </div>
      </Dialog>
    )
  }

  const protocolosActivos = protocolosFiltrados.filter(p => p.isActive)
  const protocolosInactivos = protocolosFiltrados.filter(p => !p.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Protocolos Médicos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona plantillas de exámenes y evaluaciones médicas
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar protocolos..."
              className="pl-10 w-64"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <Button onClick={handleCrearProtocolo} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Nuevo Protocolo</span>
        </Button>
      </div>

      {/* Protocolos activos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Protocolos Activos ({protocolosActivos.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {protocolosActivos.map((protocolo) => (
            <Card key={protocolo.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{protocolo.name}</h3>
                    <p className="text-sm text-gray-600">{protocolo.type}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle size={12} className="mr-1" />
                  Activo
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {protocolo.description}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{protocolo.tests.length}</div>
                  <div className="text-xs text-gray-500">Exámenes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {protocolo.tests.filter(t => t.isRequired).length}
                  </div>
                  <div className="text-xs text-gray-500">Obligatorios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${protocolo.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Precio</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-gray-500">
                  Creado: {protocolo.createdAt.toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditarProtocolo(protocolo)}
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Protocolos inactivos */}
      {protocolosInactivos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Protocolos Inactivos ({protocolosInactivos.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {protocolosInactivos.map((protocolo) => (
              <Card key={protocolo.id} className="p-6 bg-gray-50 opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{protocolo.name}</h3>
                      <p className="text-sm text-gray-600">{protocolo.type}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <XCircle size={12} className="mr-1" />
                    Inactivo
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {protocolo.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{protocolo.tests.length}</div>
                    <div className="text-xs text-gray-500">Exámenes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">
                      {protocolo.tests.filter(t => t.isRequired).length}
                    </div>
                    <div className="text-xs text-gray-500">Obligatorios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">
                      ${protocolo.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Precio</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Creado: {protocolo.createdAt.toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarProtocolo(protocolo)}
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {protocolosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">No se encontraron protocolos</p>
          <Button onClick={handleCrearProtocolo} className="mt-4">
            Crear primer protocolo
          </Button>
        </div>
      )}

      {renderModal()}
    </div>
  )
}
