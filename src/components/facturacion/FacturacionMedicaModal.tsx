// Componente especializado para facturación médica - Vista para Médicos
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Stethoscope, 
  FileText, 
  CreditCard, 
  DollarSign, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Download,
  Send,
  Receipt
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
  empresa?: string
}

interface ServicioMedico {
  id: string
  nombre: string
  categoria: 'consulta' | 'examen' | 'procedimiento' | 'especialidad'
  precio_base: number
  descripcion: string
  duracion_estimada: number // minutos
  requiere_preparacion: boolean
}

interface FacturaMedica {
  id: string
  fecha_creacion: string
  paciente_id: string
  paciente_nombre: string
  medico_id: string
  medico_nombre: string
  servicios: ServicioFacturado[]
  subtotal: number
  impuestos: number
  total: number
  estado: 'borrador' | 'emitida' | 'pagada' | 'cancelada'
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro'
  observaciones?: string
  fecha_pago?: string
  folio_fiscal?: string
}

interface ServicioFacturado {
  servicio_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
  total: number
  fecha_servicio: string
}

const serviciosMedicosDisponibles: Omit<ServicioMedico, 'id'>[] = [
  {
    nombre: 'Consulta Médica General',
    categoria: 'consulta',
    precio_base: 800,
    descripcion: 'Consulta médica general para evaluación de salud',
    duracion_estimada: 30,
    requiere_preparacion: false
  },
  {
    nombre: 'Consulta de Especialidad',
    categoria: 'consulta',
    precio_base: 1200,
    descripcion: 'Consulta médica especializada (cardiología, dermatología, etc.)',
    duracion_estimada: 45,
    requiere_preparacion: false
  },
  {
    nombre: 'Examen Periódico Anual',
    categoria: 'examen',
    precio_base: 2500,
    descripcion: 'Evaluación médica completa anual según NOM-006-STPS',
    duracion_estimada: 90,
    requiere_preparacion: true
  },
  {
    nombre: 'Audiometría',
    categoria: 'examen',
    precio_base: 450,
    descripcion: 'Evaluación auditiva para detección de pérdida auditiva',
    duracion_estimada: 20,
    requiere_preparacion: false
  },
  {
    nombre: 'Espirometría',
    categoria: 'examen',
    precio_base: 380,
    descripcion: 'Evaluación de función pulmonar',
    duracion_estimada: 15,
    requiere_preparacion: false
  },
  {
    nombre: 'Electrocardiograma',
    categoria: 'examen',
    precio_base: 520,
    descripcion: 'Registro de actividad eléctrica del corazón',
    duracion_estimada: 10,
    requiere_preparacion: false
  },
  {
    nombre: 'Rayos X de Tórax',
    categoria: 'examen',
    precio_base: 650,
    descripcion: 'Radiografía de tórax para evaluación pulmonar',
    duracion_estimada: 5,
    requiere_preparacion: false
  },
  {
    nombre: 'Laboratorio Clínico Básico',
    categoria: 'examen',
    precio_base: 850,
    descripcion: 'Panel básico de pruebas de laboratorio',
    duracion_estimada: 0,
    requiere_preparacion: true
  },
  {
    nombre: 'Certificado de Aptitud Médica',
    categoria: 'procedimiento',
    precio_base: 1200,
    descripcion: 'Emisión de certificado médico de aptitud para el trabajo',
    duracion_estimada: 15,
    requiere_preparacion: false
  },
  {
    nombre: 'Evaluación Psicométrica',
    categoria: 'procedimiento',
    precio_base: 1800,
    descripcion: 'Evaluación psicológica para aptitud laboral',
    duracion_estimada: 60,
    requiere_preparacion: true
  }
]

interface FacturacionMedicaModalProps {
  open: boolean
  onClose: () => void
  paciente: Paciente | null
  medico: { id: string; nombre: string }
  onFacturaCreada: (factura: FacturaMedica) => void
}

export function FacturacionMedicaModal({ 
  open, 
  onClose, 
  paciente, 
  medico,
  onFacturaCreada 
}: FacturacionMedicaModalProps) {
  const [paso, setPaso] = useState(1)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<ServicioFacturado[]>([])
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'seguro'>('efectivo')
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')

  const categorias = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'consulta', label: 'Consultas' },
    { value: 'examen', label: 'Exámenes' },
    { value: 'procedimiento', label: 'Procedimientos' },
    { value: 'especialidad', label: 'Especialidades' }
  ]

  const serviciosFiltrados = serviciosMedicosDisponibles.filter(servicio => {
    const coincideCategoria = categoriaFiltro === 'todas' || servicio.categoria === categoriaFiltro
    const coincideBusqueda = servicio.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  const agregarServicio = (servicio: Omit<ServicioMedico, 'id'>) => {
    const servicioExistente = serviciosSeleccionados.find(s => s.servicio_id === servicio.nombre)
    if (servicioExistente) {
      actualizarCantidad(servicio.nombre, servicioExistente.cantidad + 1)
      return
    }

    const nuevoServicio: ServicioFacturado = {
      servicio_id: servicio.nombre,
      nombre: servicio.nombre,
      cantidad: 1,
      precio_unitario: servicio.precio_base,
      total: servicio.precio_base,
      fecha_servicio: new Date().toISOString()
    }
    setServiciosSeleccionados([...serviciosSeleccionados, nuevoServicio])
    toast.success(`${servicio.nombre} agregado a la factura`)
  }

  const actualizarCantidad = (servicioId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      quitarServicio(servicioId)
      return
    }

    const servicios = serviciosSeleccionados.map(servicio => {
      if (servicio.servicio_id === servicioId) {
        return {
          ...servicio,
          cantidad: nuevaCantidad,
          total: servicio.precio_unitario * nuevaCantidad
        }
      }
      return servicio
    })
    setServiciosSeleccionados(servicios)
  }

  const quitarServicio = (servicioId: string) => {
    const servicio = serviciosSeleccionados.find(s => s.servicio_id === servicioId)
    if (servicio) {
      setServiciosSeleccionados(serviciosSeleccionados.filter(s => s.servicio_id !== servicioId))
      toast.success(`${servicio.nombre} removido de la factura`)
    }
  }

  const calcularSubtotal = () => {
    return serviciosSeleccionados.reduce((total, servicio) => total + servicio.total, 0)
  }

  const calcularImpuestos = (subtotal: number) => {
    // IVA 16% para servicios médicos
    return subtotal * 0.16
  }

  const crearFactura = () => {
    if (serviciosSeleccionados.length === 0) {
      toast.error('Agrega al menos un servicio a la factura')
      return
    }

    const subtotal = calcularSubtotal()
    const impuestos = calcularImpuestos(subtotal)
    const total = subtotal + impuestos

    const nuevaFactura: FacturaMedica = {
      id: Date.now().toString(),
      fecha_creacion: new Date().toISOString(),
      paciente_id: paciente!.id,
      paciente_nombre: `${paciente!.nombre} ${paciente!.apellido_paterno}`,
      medico_id: medico.id,
      medico_nombre: medico.nombre,
      servicios: serviciosSeleccionados,
      subtotal,
      impuestos,
      total,
      estado: 'borrador',
      metodo_pago: metodoPago,
      observaciones: observaciones.trim() || undefined
    }

    onFacturaCreada(nuevaFactura)
    toast.success('Factura médica creada exitosamente')
    onClose()
    
    // Resetear formulario
    setPaso(1)
    setServiciosSeleccionados([])
    setMetodoPago('efectivo')
    setObservaciones('')
    setBusqueda('')
    setCategoriaFiltro('todas')
  }

  if (!paciente) return null

  const renderPaso1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccionar Servicios Médicos
        </h3>
        <p className="text-sm text-gray-600">
          Agrega los servicios prestados a {paciente.nombre} {paciente.apellido_paterno}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar servicio..."
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
              <SelectItem key={categoria.value} value={categoria.value}>
                {categoria.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de servicios disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {serviciosFiltrados.map((servicio, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{servicio.nombre}</h4>
                <p className="text-xs text-gray-500 mt-1">{servicio.descripcion}</p>
              </div>
              <Badge variant="outline" className="text-xs ml-2">
                ${servicio.precio_base}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="capitalize">{servicio.categoria}</span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {servicio.duracion_estimada} min
              </span>
            </div>
            {servicio.requiere_preparacion && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-3">
                <strong>Preparación requerida</strong>
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => agregarServicio(servicio)}
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
          Configurar Factura
        </h3>
        <p className="text-sm text-gray-600">
          Revisa los servicios y configura los detalles de la factura
        </p>
      </div>

      {/* Servicios seleccionados */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Servicios Seleccionados ({serviciosSeleccionados.length})</h4>
        {serviciosSeleccionados.map((servicio) => (
          <Card key={servicio.servicio_id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{servicio.nombre}</h5>
                  <p className="text-xs text-gray-500 capitalize">{servicio.servicio_id}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => quitarServicio(servicio.servicio_id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Cantidad:</span>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => actualizarCantidad(servicio.servicio_id, servicio.cantidad - 1)}
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{servicio.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => actualizarCantidad(servicio.servicio_id, servicio.cantidad + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${servicio.total}</p>
                  <p className="text-xs text-gray-500">${servicio.precio_unitario} c/u</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago
        </label>
        <Select value={metodoPago} onValueChange={(value: any) => setMetodoPago(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
            <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
            <SelectItem value="seguro">Seguro Médico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones Médicas (Opcional)
        </label>
        <Textarea
          placeholder="Agregar notas médicas, diagnósticos, observaciones especiales..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
        />
      </div>

      {/* Resumen de costos */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumen de Factura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({serviciosSeleccionados.reduce((total, s) => total + s.cantidad, 0)} servicios)</span>
            <span>${calcularSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (16%)</span>
            <span>${calcularImpuestos(calcularSubtotal()).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t">
            <span>Total</span>
            <span>${(calcularSubtotal() + calcularImpuestos(calcularSubtotal())).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <MedicalModal
      open={open}
      onClose={onClose}
      title={`Factura Médica - ${paciente.nombre} ${paciente.apellido_paterno}`}
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
              disabled={serviciosSeleccionados.length === 0}
            >
              Siguiente
            </Button>
          )}
          {paso === 2 && (
            <Button onClick={crearFactura} className="bg-green-600 hover:bg-green-700">
              <Receipt className="h-4 w-4 mr-2" />
              Crear Factura
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={paso.toString()} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="1" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Servicios</span>
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Factura</span>
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
