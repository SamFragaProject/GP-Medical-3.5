// Componente para gestionar otros productos médicos (equipos, suministros, etc.)
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Shield, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Wrench,
  Stethoscope,
  Activity,
  Zap,
  Thermometer,
  Heart
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
}

interface ProductoMedico {
  id: string
  nombre: string
  categoria: 'equipo_medico' | 'suministro' | 'proteccion' | 'instrumental' | 'diagnostico'
  descripcion: string
  precio: number
  stock_disponible: number
  marca?: string
  modelo?: string
  especificaciones?: string
  requiere_referencia: boolean
  contraindicaciones?: string
}

interface OrdenProducto {
  id: string
  fecha_orden: string
  paciente_id: string
  medico_id: string
  medico_nombre: string
  productos: ProductoOrdenado[]
  motivo: string
  observaciones?: string
  estado: 'pendiente' | 'autorizada' | 'entregada' | 'cancelada'
  fecha_entrega?: string
}

interface ProductoOrdenado {
  producto_id: string
  nombre: string
  categoria: string
  cantidad: number
  precio_unitario: number
  total: number
}

const productosDisponibles: Omit<ProductoMedico, 'id'>[] = [
  {
    nombre: 'Tensiómetro Digital',
    categoria: 'equipo_medico',
    descripcion: 'Monitor de presión arterial automático con memoria',
    precio: 1200,
    stock_disponible: 15,
    marca: 'Omron',
    modelo: 'HEM-7130',
    especificaciones: 'Rango: 0-299 mmHg, Precisión: ±3 mmHg',
    requiere_referencia: true
  },
  {
    nombre: 'Oxímetro de Pulso',
    categoria: 'equipo_medico',
    descripcion: 'Medidor de saturación de oxígeno y frecuencia cardíaca',
    precio: 850,
    stock_disponible: 25,
    marca: 'Contec',
    modelo: 'CMS50D',
    especificaciones: 'Rango SpO2: 70-100%, Precisión: ±2%',
    requiere_referencia: false
  },
  {
    nombre: 'Estetoscopio Littmann Classic III',
    categoria: 'equipo_medico',
    descripcion: 'Estetoscopio de doble campana para auscultación',
    precio: 2200,
    stock_disponible: 8,
    marca: '3M Littmann',
    modelo: 'Classic III',
    especificaciones: 'Acero inoxidable, membrana tunable',
    requiere_referencia: false
  },
  {
    nombre: 'Glucómetro Accu-Chek',
    categoria: 'equipo_medico',
    descripcion: 'Medidor de glucosa en sangre con tiritas incluidas',
    precio: 680,
    stock_disponible: 30,
    marca: 'Roche',
    modelo: 'Accu-Chek Instant',
    especificaciones: 'Memoria: 720 resultados, Tiempo: 5 segundos',
    requiere_referencia: true
  },
  {
    nombre: 'Bata Desechable',
    categoria: 'proteccion',
    descripcion: 'Bata de aislamiento desechable tamaño único',
    precio: 35,
    stock_disponible: 500,
    especificaciones: 'Polipropileno, no estéril, uso único',
    requiere_referencia: false
  },
  {
    nombre: 'Guantes de Nitrilo',
    categoria: 'proteccion',
    descripcion: 'Guantes desechables de nitrilo sin látex',
    precio: 180,
    stock_disponible: 200,
    marca: 'Medline',
    modelo: 'Nitrile Exam',
    especificaciones: 'Talla M, 100 piezas por caja',
    requiere_referencia: false
  },
  {
    nombre: 'Mascarillas Quirúrgicas',
    categoria: 'proteccion',
    descripcion: 'Mascarillas quirúrgicas de 3 capas',
    precio: 120,
    stock_disponible: 300,
    especificaciones: 'EFB >95%, Cómodas y ajustadas',
    requiere_referencia: false
  },
  {
    nombre: 'Alcohol Gel 70%',
    categoria: 'suministro',
    descripcion: 'Gel antibacterial para manos 70% alcohol',
    precio: 95,
    stock_disponible: 150,
    marca: 'Antibacterial Plus',
    especificaciones: '500ml, kills 99.9% bacteria',
    requiere_referencia: false
  },
  {
    nombre: 'Jeringas Desechables 5ml',
    categoria: 'suministro',
    descripcion: 'Jeringas estériles desechables para inyección',
    precio: 45,
    stock_disponible: 1000,
    especificaciones: 'Aguja 23G x 1", estéril, uso único',
    requiere_referencia: true
  },
  {
    nombre: 'Termómetro Digital',
    categoria: 'equipo_medico',
    descripcion: 'Termómetro digital de lectura rápida',
    precio: 320,
    stock_disponible: 40,
    marca: 'Braun',
    modelo: 'ThermoScan',
    especificaciones: 'Rango: 32-42°C, Precisión: ±0.2°C',
    requiere_referencia: false
  },
  {
    nombre: 'Báscula Digital Médica',
    categoria: 'equipo_medico',
    descripcion: 'Báscula digital de precisión para consultorio',
    precio: 1800,
    stock_disponible: 5,
    marca: 'Tanita',
    modelo: 'BF-680W',
    especificaciones: 'Capacidad: 200kg, Precisión: 100g',
    requiere_referencia: true
  },
  {
    nombre: 'Electrocardiógrafo Portátil',
    categoria: 'equipo_medico',
    descripcion: 'Electrocardiógrafo de 6 canales portátil',
    precio: 15000,
    stock_disponible: 2,
    marca: 'Contec',
    modelo: 'ECG600G',
    especificaciones: '6 canales, printer built-in, portable',
    requiere_referencia: true
  }
]

interface OrdenProductosModalProps {
  open: boolean
  onClose: () => void
  paciente: Paciente | null
  onOrdenCreada: (orden: OrdenProducto) => void
}

export function OrdenProductosModal({ open, onClose, paciente, onOrdenCreada }: OrdenProductosModalProps) {
  const [paso, setPaso] = useState(1)
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoOrdenado[]>([])
  const [motivo, setMotivo] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')

  const categorias = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'equipo_medico', label: 'Equipos Médicos' },
    { value: 'suministro', label: 'Suministros' },
    { value: 'proteccion', label: 'Protección' },
    { value: 'instrumental', label: 'Instrumental' },
    { value: 'diagnostico', label: 'Diagnóstico' }
  ]

  const getIconoCategoria = (categoria: string) => {
    switch (categoria) {
      case 'equipo_medico': return <Stethoscope className="h-4 w-4" />
      case 'suministro': return <Package className="h-4 w-4" />
      case 'proteccion': return <Shield className="h-4 w-4" />
      case 'instrumental': return <Wrench className="h-4 w-4" />
      case 'diagnostico': return <Activity className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const productosFiltrados = productosDisponibles.filter(producto => {
    const coincideCategoria = categoriaFiltro === 'todas' || producto.categoria === categoriaFiltro
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  const agregarProducto = (producto: Omit<ProductoMedico, 'id'>) => {
    const productoExistente = productosSeleccionados.find(p => p.producto_id === producto.nombre)
    if (productoExistente) {
      actualizarCantidad(producto.nombre, productoExistente.cantidad + 1)
      return
    }

    const nuevoProducto: ProductoOrdenado = {
      producto_id: producto.nombre,
      nombre: producto.nombre,
      categoria: producto.categoria,
      cantidad: 1,
      precio_unitario: producto.precio,
      total: producto.precio
    }
    setProductosSeleccionados([...productosSeleccionados, nuevoProducto])
    toast.success(`${producto.nombre} agregado a la orden`)
  }

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      quitarProducto(productoId)
      return
    }

    const productos = productosSeleccionados.map(producto => {
      if (producto.producto_id === productoId) {
        return {
          ...producto,
          cantidad: nuevaCantidad,
          total: producto.precio_unitario * nuevaCantidad
        }
      }
      return producto
    })
    setProductosSeleccionados(productos)
  }

  const quitarProducto = (productoId: string) => {
    const producto = productosSeleccionados.find(p => p.producto_id === productoId)
    if (producto) {
      setProductosSeleccionados(productosSeleccionados.filter(p => p.producto_id !== productoId))
      toast.success(`${producto.nombre} removido de la orden`)
    }
  }

  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, producto) => total + producto.total, 0)
  }

  const crearOrden = () => {
    if (!motivo.trim()) {
      toast.error('El motivo es obligatorio')
      return
    }

    if (productosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    const nuevaOrden: OrdenProducto = {
      id: Date.now().toString(),
      fecha_orden: new Date().toISOString(),
      paciente_id: paciente!.id,
      medico_id: 'medico_actual',
      medico_nombre: 'Dr. Luna Rivera',
      productos: productosSeleccionados,
      motivo: motivo.trim(),
      observaciones: observaciones.trim() || undefined,
      estado: 'pendiente'
    }

    onOrdenCreada(nuevaOrden)
    toast.success('Orden de productos médicos creada exitosamente')
    onClose()
    
    // Resetear formulario
    setPaso(1)
    setProductosSeleccionados([])
    setMotivo('')
    setObservaciones('')
    setBusqueda('')
    setCategoriaFiltro('todas')
  }

  if (!paciente) return null

  const renderPaso1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccionar Productos Médicos
        </h3>
        <p className="text-sm text-gray-600">
          Elige los productos necesarios para {paciente.nombre} {paciente.apellido_paterno}
        </p>
      </div>

      {/* Motivo de la orden */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motivo de la Orden *
        </label>
        <Select value={motivo} onValueChange={setMotivo}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el motivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="evaluacion_ocupacional">Evaluación Ocupacional</SelectItem>
            <SelectItem value="tratamiento_medico">Tratamiento Médico</SelectItem>
            <SelectItem value="medidas_preventivas">Medidas Preventivas</SelectItem>
            <SelectItem value="seguimiento">Seguimiento Médico</SelectItem>
            <SelectItem value="emergencia">Emergencia Médica</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar producto..."
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

      {/* Lista de productos disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {productosFiltrados.map((producto, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{producto.nombre}</h4>
                <p className="text-xs text-gray-500 mt-1">{producto.descripcion}</p>
                {producto.marca && (
                  <p className="text-xs text-gray-400">{producto.marca} {producto.modelo}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs ml-2">
                ${producto.precio}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div className="flex items-center space-x-2">
                {getIconoCategoria(producto.categoria)}
                <span className="capitalize">{producto.categoria.replace('_', ' ')}</span>
              </div>
              <span>Stock: {producto.stock_disponible}</span>
            </div>
            {producto.especificaciones && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-3">
                <strong>Specs:</strong> {producto.especificaciones}
              </p>
            )}
            {producto.requiere_referencia && (
              <div className="flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded mb-3">
                <AlertCircle className="h-3 w-3 mr-1" />
                Requiere referencia médica
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => agregarProducto(producto)}
              className="w-full"
              disabled={producto.stock_disponible === 0}
            >
              {producto.stock_disponible === 0 ? (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Sin Stock
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </>
              )}
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
          Revisar Orden
        </h3>
        <p className="text-sm text-gray-600">
          Confirma los productos seleccionados y agrega observaciones
        </p>
      </div>

      {/* Productos seleccionados */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Productos Seleccionados ({productosSeleccionados.length})</h4>
        {productosSeleccionados.map((producto) => (
          <Card key={producto.producto_id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{producto.nombre}</h5>
                  <p className="text-xs text-gray-500 capitalize">
                    {producto.categoria.replace('_', ' ')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => quitarProducto(producto.producto_id)}
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
                      onClick={() => actualizarCantidad(producto.producto_id, producto.cantidad - 1)}
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{producto.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => actualizarCantidad(producto.producto_id, producto.cantidad + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${producto.total}</p>
                  <p className="text-xs text-gray-500">${producto.precio_unitario} c/u</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (Opcional)
        </label>
        <Textarea
          placeholder="Agregar instrucciones especiales, precauciones, etc..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
        />
      </div>

      {/* Resumen de costos */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumen de la Orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({productosSeleccionados.reduce((total, p) => total + p.cantidad, 0)} productos)</span>
            <span>${calcularTotal()}</span>
          </div>
          <div className="flex justify-between text-sm text-amber-600">
            <span>Productos que requieren referencia</span>
            <span>{productosSeleccionados.filter(p => productosDisponibles.find(pd => pd.nombre === p.nombre)?.requiere_referencia).length}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t">
            <span>Total</span>
            <span>${calcularTotal()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <MedicalModal
      open={open}
      onClose={onClose}
      title={`Orden de Productos Médicos - ${paciente.nombre} ${paciente.apellido_paterno}`}
      size="xl"
      type="warning"
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
              disabled={!motivo.trim() || productosSeleccionados.length === 0}
            >
              Siguiente
            </Button>
          )}
          {paso === 2 && (
            <Button onClick={crearOrden} className="bg-orange-600 hover:bg-orange-700">
              <Package className="h-4 w-4 mr-2" />
              Crear Orden
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={paso.toString()} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="1" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Productos</span>
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Revisar</span>
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
