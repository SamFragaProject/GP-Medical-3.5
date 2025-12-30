// Componente para gestionar órdenes de laboratorio desde la gestión de pacientes
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TestTube, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Download
} from 'lucide-react'
import { MedicalModal } from '@/components/ui/medical-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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

interface OrdenLaboratorio {
  id: string
  fecha_orden: string
  paciente_id: string
  medico_id: string
  medico_nombre: string
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
  urgencia: 'normal' | 'urgente' | 'critica'
  pruebas: PruebaLaboratorio[]
  observaciones?: string
  fecha_resultados?: string
}

interface PruebaLaboratorio {
  id: string
  nombre: string
  categoria: string
  precio: number
  tiempo_entrega: number // horas
  indicaciones?: string
  resultados?: string
  estado: 'pendiente' | 'en_proceso' | 'completado'
}

const pruebasDisponibles: Omit<PruebaLaboratorio, 'id' | 'estado' | 'resultados'>[] = [
  {
    nombre: 'Hemograma Completo',
    categoria: 'Hematología',
    precio: 450,
    tiempo_entrega: 4,
    indicaciones: 'En ayunas de 8 horas'
  },
  {
    nombre: 'Glucosa en Ayunas',
    categoria: 'Bioquímica',
    precio: 180,
    tiempo_entrega: 2,
    indicaciones: 'En ayunas de 8-12 horas'
  },
  {
    nombre: 'Perfil Lipídico',
    categoria: 'Bioquímica',
    precio: 680,
    tiempo_entrega: 6,
    indicaciones: 'En ayunas de 12 horas'
  },
  {
    nombre: 'Función Renal (Creatinina, BUN)',
    categoria: 'Bioquímica',
    precio: 320,
    tiempo_entrega: 4,
    indicaciones: 'Evitar ejercicio intenso 24h antes'
  },
  {
    nombre: 'Examen General de Orina',
    categoria: 'Urinálisis',
    precio: 280,
    tiempo_entrega: 3,
    indicaciones: 'Primera orina de la mañana'
  },
  {
    nombre: 'Audiometría',
    categoria: 'Audiología',
    precio: 850,
    tiempo_entrega: 1,
    indicaciones: 'Evitar exposición a ruidos 24h antes'
  },
  {
    nombre: 'Espirometría',
    categoria: 'Neumología',
    precio: 750,
    tiempo_entrega: 1,
    indicaciones: 'Evitar inhalar humo 2h antes'
  },
  {
    nombre: 'Electrocardiograma',
    categoria: 'Cardiología',
    precio: 520,
    tiempo_entrega: 1,
    indicaciones: 'Reposo 30 min antes del estudio'
  }
]

interface OrdenLaboratorioModalProps {
  open: boolean
  onClose: () => void
  paciente: Paciente | null
  onOrdenCreada: (orden: OrdenLaboratorio) => void
}

export function OrdenLaboratorioModal({ open, onClose, paciente, onOrdenCreada }: OrdenLaboratorioModalProps) {
  const [paso, setPaso] = useState(1)
  const [urgencia, setUrgencia] = useState<'normal' | 'urgente' | 'critica'>('normal')
  const [pruebasSeleccionadas, setPruebasSeleccionadas] = useState<PruebaLaboratorio[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')

  const categorias = ['todas', ...Array.from(new Set(pruebasDisponibles.map(p => p.categoria)))]

  const pruebasFiltradas = pruebasDisponibles.filter(prueba => {
    const coincideCategoria = categoriaFiltro === 'todas' || prueba.categoria === categoriaFiltro
    const coincideBusqueda = prueba.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  const agregarPrueba = (prueba: Omit<PruebaLaboratorio, 'id' | 'estado' | 'resultados'>) => {
    const nuevaPrueba: PruebaLaboratorio = {
      ...prueba,
      id: Date.now().toString(),
      estado: 'pendiente'
    }
    setPruebasSeleccionadas([...pruebasSeleccionadas, nuevaPrueba])
    toast.success(`${prueba.nombre} agregada a la orden`)
  }

  const quitarPrueba = (pruebaId: string) => {
    const prueba = pruebasSeleccionadas.find(p => p.id === pruebaId)
    if (prueba) {
      setPruebasSeleccionadas(pruebasSeleccionadas.filter(p => p.id !== pruebaId))
      toast.success(`${prueba.nombre} removida de la orden`)
    }
  }

  const calcularTotal = () => {
    return pruebasSeleccionadas.reduce((total, prueba) => total + prueba.precio, 0)
  }

  const calcularTiempoMaximo = () => {
    if (pruebasSeleccionadas.length === 0) return 0
    return Math.max(...pruebasSeleccionadas.map(p => p.tiempo_entrega))
  }

  const crearOrden = () => {
    if (pruebasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una prueba')
      return
    }

    const nuevaOrden: OrdenLaboratorio = {
      id: Date.now().toString(),
      fecha_orden: new Date().toISOString(),
      paciente_id: paciente!.id,
      medico_id: 'medico_actual', // En producción vendría del contexto
      medico_nombre: 'Dr. Luna Rivera', // En producción vendría del contexto
      estado: 'pendiente',
      urgencia,
      pruebas: pruebasSeleccionadas,
      observaciones: observaciones.trim() || undefined
    }

    onOrdenCreada(nuevaOrden)
    toast.success('Orden de laboratorio creada exitosamente')
    onClose()
    
    // Resetear formulario
    setPaso(1)
    setUrgencia('normal')
    setPruebasSeleccionadas([])
    setObservaciones('')
    setBusqueda('')
    setCategoriaFiltro('todas')
  }

  if (!paciente) return null

  const renderPaso1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccionar Pruebas de Laboratorio
        </h3>
        <p className="text-sm text-gray-600">
          Elige las pruebas necesarias para {paciente.nombre} {paciente.apellido_paterno}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar prueba..."
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

      {/* Lista de pruebas disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {pruebasFiltradas.map((prueba, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{prueba.nombre}</h4>
                <p className="text-xs text-gray-500 mt-1">{prueba.categoria}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                ${prueba.precio}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {prueba.tiempo_entrega}h
              </span>
            </div>
            {prueba.indicaciones && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-3">
                <strong>Indicaciones:</strong> {prueba.indicaciones}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => agregarPrueba(prueba)}
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
          Configurar Orden
        </h3>
        <p className="text-sm text-gray-600">
          Revisa las pruebas seleccionadas y configura la orden
        </p>
      </div>

      {/* Resumen de pruebas seleccionadas */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Pruebas Seleccionadas ({pruebasSeleccionadas.length})</h4>
        {pruebasSeleccionadas.map((prueba) => (
          <div key={prueba.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 text-sm">{prueba.nombre}</h5>
              <p className="text-xs text-gray-500">{prueba.categoria}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">${prueba.precio}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => quitarPrueba(prueba.id)}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Urgencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel de Urgencia
        </label>
        <Select value={urgencia} onValueChange={(value: any) => setUrgencia(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal - Entrega estándar</SelectItem>
            <SelectItem value="urgente">Urgente - Entrega prioritaria</SelectItem>
            <SelectItem value="critica">Crítica - Resultado inmediato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones Médicas (Opcional)
        </label>
        <Textarea
          placeholder="Agregar observaciones clínicas, síntomas, etc..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
        />
      </div>

      {/* Resumen de costos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumen de la Orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({pruebasSeleccionadas.length} pruebas)</span>
            <span>${calcularTotal()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tiempo de entrega estimado</span>
            <span>{calcularTiempoMaximo()} horas</span>
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
      title={`Orden de Laboratorio - ${paciente.nombre} ${paciente.apellido_paterno}`}
      size="xl"
      type="info"
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
              disabled={pruebasSeleccionadas.length === 0}
            >
              Siguiente
            </Button>
          )}
          {paso === 2 && (
            <Button onClick={crearOrden} className="bg-primary hover:bg-primary/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Crear Orden
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={paso.toString()} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="1" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Pruebas</span>
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Configurar</span>
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