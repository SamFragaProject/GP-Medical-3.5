// Componente para gestionar medicamentos y prescripciones médicas
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Weight,
  Target,
  BookOpen
} from 'lucide-react'
import { MedicalModal } from '@/components/ui/medical-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Paciente {
  id: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  numero_empleado: string
  alergias?: string
  enfermedades_cronicas?: string
}

interface Medicamento {
  id: string
  nombre_comercial: string
  nombre_generico: string
  concentracion: string
  forma_farmaceutica: string
  categoria: string
  precio: number
  stok_disponible: number
  contraindicaciones: string[]
  alergias_conocidas: string[]
}

interface Prescripcion {
  id: string
  fecha_prescripcion: string
  paciente_id: string
  medico_id: string
  medico_nombre: string
  diagnostico: string
  medicamentos: MedicamentoPrescrito[]
  observaciones?: string
  estado: 'activa' | 'completada' | 'cancelada'
  fecha_inicio: string
  fecha_fin?: string
}

interface MedicamentoPrescrito {
  medicamento_id: string
  nombre: string
  concentracion: string
  dosis: string
  frecuencia: string
  duracion: string
  via_administracion: string
  indicaciones: string
  cantidad_prescrita: number
  cantidad_disponible?: number
}

const medicamentosDisponibles: Omit<Medicamento, 'id'>[] = [
  {
    nombre_comercial: 'Paracetamol',
    nombre_generico: 'Paracetamol',
    concentracion: '500mg',
    forma_farmaceutica: 'Tableta',
    categoria: 'Analgésico',
    precio: 45,
    stok_disponible: 500,
    contraindicaciones: ['Insuficiencia hepática severa', 'Alergia conocida'],
    alergias_conocidas: []
  },
  {
    nombre_comercial: 'Ibuprofeno',
    nombre_generico: 'Ibuprofeno',
    concentracion: '400mg',
    forma_farmaceutica: 'Tableta',
    categoria: 'Antiinflamatorio',
    precio: 75,
    stok_disponible: 300,
    contraindicaciones: ['Úlcera péptica', 'Insuficiencia renal', 'Embarazo tercer trimestre'],
    alergias_conocidas: ['AINE']
  },
  {
    nombre_comercial: 'Loratadina',
    nombre_generico: 'Loratadina',
    concentracion: '10mg',
    forma_farmaceutica: 'Tableta',
    categoria: 'Antihistamínico',
    precio: 120,
    stok_disponible: 200,
    contraindicaciones: ['Insuficiencia hepática severa'],
    alergias_conocidas: []
  },
  {
    nombre_comercial: 'Salbutamol',
    nombre_generico: 'Salbutamol',
    concentracion: '100mcg',
    forma_farmaceutica: 'Inhalador',
    categoria: 'Broncodilatador',
    precio: 180,
    stok_disponible: 50,
    contraindicaciones: ['Hipersensibilidad al fármaco'],
    alergias_conocidas: []
  },
  {
    nombre_comercial: 'Omeprazol',
    nombre_generico: 'Omeprazol',
    concentracion: '20mg',
    forma_farmaceutica: 'Cápsula',
    categoria: 'Protector gástrico',
    precio: 95,
    stok_disponible: 400,
    contraindicaciones: ['Hipersensibilidad conocida'],
    alergias_conocidas: []
  },
  {
    nombre_comercial: 'Metformina',
    nombre_generico: 'Metformina',
    concentracion: '850mg',
    forma_farmaceutica: 'Tableta',
    categoria: 'Antidiabético',
    precio: 65,
    stok_disponible: 600,
    contraindicaciones: ['Insuficiencia renal', 'Cetoacidosis diabética'],
    alergias_conocidas: []
  }
]

interface PrescripcionModalProps {
  open: boolean
  onClose: () => void
  paciente: Paciente | null
  onPrescripcionCreada: (prescripcion: Prescripcion) => void
}

export function PrescripcionModal({ open, onClose, paciente, onPrescripcionCreada }: PrescripcionModalProps) {
  const [paso, setPaso] = useState(1)
  const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState<MedicamentoPrescrito[]>([])
  const [diagnostico, setDiagnostico] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')

  const categorias = ['todas', ...Array.from(new Set(medicamentosDisponibles.map(m => m.categoria)))]

  const medicamentosFiltrados = medicamentosDisponibles.filter(medicamento => {
    const coincideCategoria = categoriaFiltro === 'todas' || medicamento.categoria === categoriaFiltro
    const coincideBusqueda = medicamento.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
                            medicamento.nombre_generico.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  const agregarMedicamento = (medicamento: Omit<Medicamento, 'id'>) => {
    const medicamentoConDosis: MedicamentoPrescrito = {
      medicamento_id: Date.now().toString(),
      nombre: medicamento.nombre_comercial,
      concentracion: medicamento.concentracion,
      dosis: '',
      frecuencia: '',
      duracion: '',
      via_administracion: medicamento.forma_farmaceutica,
      indicaciones: '',
      cantidad_prescrita: 1
    }
    setMedicamentosSeleccionados([...medicamentosSeleccionados, medicamentoConDosis])
    toast.success(`${medicamento.nombre_comercial} agregado a la prescripción`)
  }

  const actualizarMedicamento = (index: number, campo: keyof MedicamentoPrescrito, valor: any) => {
    const nuevos = [...medicamentosSeleccionados]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setMedicamentosSeleccionados(nuevos)
  }

  const quitarMedicamento = (index: number) => {
    const medicamento = medicamentosSeleccionados[index]
    setMedicamentosSeleccionados(medicamentosSeleccionados.filter((_, i) => i !== index))
    toast.success(`${medicamento.nombre} removido de la prescripción`)
  }

  const crearPrescripcion = () => {
    if (!diagnostico.trim()) {
      toast.error('El diagnóstico es obligatorio')
      return
    }

    if (medicamentosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un medicamento')
      return
    }

    // Validar que todos los medicamentos tengan dosis y frecuencia
    const medicamentosIncompletos = medicamentosSeleccionados.filter(med => 
      !med.dosis || !med.frecuencia || !med.duracion
    )

    if (medicamentosIncompletos.length > 0) {
      toast.error('Completa la dosis, frecuencia y duración de todos los medicamentos')
      return
    }

    const nuevaPrescripcion: Prescripcion = {
      id: Date.now().toString(),
      fecha_prescripcion: new Date().toISOString(),
      paciente_id: paciente!.id,
      medico_id: 'medico_actual',
      medico_nombre: 'Dr. Luna Rivera',
      diagnostico: diagnostico.trim(),
      medicamentos: medicamentosSeleccionados,
      observaciones: observaciones.trim() || undefined,
      estado: 'activa',
      fecha_inicio: new Date().toISOString()
    }

    onPrescripcionCreada(nuevaPrescripcion)
    toast.success('Prescripción médica creada exitosamente')
    onClose()
    
    // Resetear formulario
    setPaso(1)
    setMedicamentosSeleccionados([])
    setDiagnostico('')
    setObservaciones('')
    setBusqueda('')
    setCategoriaFiltro('todas')
  }

  if (!paciente) return null

  const renderPaso1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Diagnóstico y Medicamentos
        </h3>
        <p className="text-sm text-gray-600">
          Registra el diagnóstico y selecciona los medicamentos para {paciente.nombre} {paciente.apellido_paterno}
        </p>
      </div>

      {/* Diagnóstico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diagnóstico Médico *
        </label>
        <Textarea
          placeholder="Describe el diagnóstico médico..."
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Alergias del paciente */}
      {(paciente.alergias || paciente.enfermedades_cronicas) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Información Médica Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {paciente.alergias && (
              <p className="text-xs text-yellow-700 mb-1">
                <strong>Alergias:</strong> {paciente.alergias}
              </p>
            )}
            {paciente.enfermedades_cronicas && (
              <p className="text-xs text-yellow-700">
                <strong>Enfermedades crónicas:</strong> {paciente.enfermedades_cronicas}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros de medicamentos */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar medicamento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map(categoria => (
              <SelectItem key={categoria} value={categoria}>
                {categoria === 'todas' ? 'Todas las categorías' : categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de medicamentos disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
        {medicamentosFiltrados.map((medicamento, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{medicamento.nombre_comercial}</h4>
                <p className="text-xs text-gray-500">{medicamento.nombre_generico}</p>
                <p className="text-xs text-gray-500">{medicamento.concentracion}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                ${medicamento.precio}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{medicamento.categoria}</span>
              <span>Stock: {medicamento.stok_disponible}</span>
            </div>
            {medicamento.contraindicaciones.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-red-600 font-medium mb-1">Contraindicaciones:</p>
                <p className="text-xs text-red-500">
                  {medicamento.contraindicaciones.slice(0, 2).join(', ')}
                  {medicamento.contraindicaciones.length > 2 && '...'}
                </p>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => agregarMedicamento(medicamento)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderPaso2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Detalles de Prescripción
        </h3>
        <p className="text-sm text-gray-600">
          Completa los detalles de dosificación para cada medicamento
        </p>
      </div>

      {/* Lista de medicamentos seleccionados */}
      <div className="space-y-4">
        {medicamentosSeleccionados.map((medicamento, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{medicamento.nombre}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => quitarMedicamento(index)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              </div>
              <CardDescription>{medicamento.concentracion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dosis *
                  </label>
                  <Input
                    placeholder="ej: 1 tableta"
                    value={medicamento.dosis}
                    onChange={(e) => actualizarMedicamento(index, 'dosis', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Frecuencia *
                  </label>
                  <Select 
                    value={medicamento.frecuencia} 
                    onValueChange={(value) => actualizarMedicamento(index, 'frecuencia', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cada 6 horas">cada 6 horas</SelectItem>
                      <SelectItem value="cada 8 horas">cada 8 horas</SelectItem>
                      <SelectItem value="cada 12 horas">cada 12 horas</SelectItem>
                      <SelectItem value="cada 24 horas">cada 24 horas</SelectItem>
                      <SelectItem value="cada 8 horas con alimentos">cada 8 horas con alimentos</SelectItem>
                      <SelectItem value="cada 12 horas en ayunas">cada 12 horas en ayunas</SelectItem>
                      <SelectItem value="según necesidad">según necesidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duración *
                  </label>
                  <Input
                    placeholder="ej: 7 días"
                    value={medicamento.duracion}
                    onChange={(e) => actualizarMedicamento(index, 'duracion', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Indicaciones especiales
                </label>
                <Textarea
                  placeholder="ej: Tomar con alimentos, evitar lácteos, etc."
                  value={medicamento.indicaciones}
                  onChange={(e) => actualizarMedicamento(index, 'indicaciones', e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>Vía: {medicamento.via_administracion}</span>
                <span>Cantidad: {medicamento.cantidad_prescrita}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones Médicas (Opcional)
        </label>
        <Textarea
          placeholder="Agregar observaciones adicionales, precauciones, seguimiento..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  )

  return (
    <MedicalModal
      open={open}
      onClose={onClose}
      title={`Prescripción Médica - ${paciente.nombre} ${paciente.apellido_paterno}`}
      size="xl"
      type="success"
      actions={
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          {paso > 1 && (
            <Button variant="outline" onClick={() => setPaso(paso - 1)}>
              Anterior
            </Button>
          )}
          {paso < 2 && (
            <Button 
              onClick={() => setPaso(paso + 1)}
              disabled={!diagnostico.trim() || medicamentosSeleccionados.length === 0}
            >
              Siguiente
            </Button>
          )}
          {paso === 2 && (
            <Button onClick={crearPrescripcion} className="bg-green-600 hover:bg-green-700">
              <Pill className="h-4 w-4 mr-2" />
              Crear Prescripción
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={paso.toString()} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="1" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Diagnóstico</span>
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <span>Prescripción</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="1" className="mt-6">
          {renderPaso1()}
        </TabsContent>
        
        <TabsContent value="2" className="mt-6">
          {renderPaso2()}
        </TabsContent>
      </Tabs>
    </MedicalModal>
  )
}