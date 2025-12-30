// Componente para integrar todas las funcionalidades médicas desde la gestión de pacientes
// ACTUALIZADO: Ahora respeta los permisos por rol
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TestTube, 
  Pill, 
  Package, 
  Stethoscope, 
  FileText, 
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  Lock
} from 'lucide-react'
import { MedicalModal } from '@/components/ui/medical-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrdenLaboratorioModal } from './OrdenLaboratorioModal'
import { PrescripcionModal } from './PrescripcionModal'
import { OrdenProductosModal } from './OrdenProductosModal'
import { useRolePermissions } from '@/hooks/useRolePermissions'
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

interface AccionMedica {
  id: string
  titulo: string
  descripcion: string
  icono: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
  tipo: 'laboratorio' | 'prescripcion' | 'productos' | 'examenes'
}

const accionesMedicas: AccionMedica[] = [
  {
    id: 'laboratorio',
    titulo: 'Orden de Laboratorio',
    descripcion: 'Solicitar pruebas y estudios de laboratorio',
    icono: TestTube,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    tipo: 'laboratorio'
  },
  {
    id: 'prescripcion',
    titulo: 'Prescripción Médica',
    descripcion: 'Recetar medicamentos y tratamientos',
    icono: Pill,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    tipo: 'prescripcion'
  },
  {
    id: 'productos',
    titulo: 'Productos Médicos',
    descripcion: 'Solicitar equipos y suministros médicos',
    icono: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    tipo: 'productos'
  },
  {
    id: 'examenes',
    titulo: 'Examen Ocupacional',
    descripcion: 'Programar evaluaciones médicas',
    icono: Stethoscope,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    tipo: 'examenes'
  }
]

interface CentroAccionesMedicasProps {
  paciente: Paciente | null
  onAccionCompletada: (tipo: string, datos: any) => void
}

export function CentroAccionesMedicas({ paciente, onAccionCompletada }: CentroAccionesMedicasProps) {
  const [accionSeleccionada, setAccionSeleccionada] = useState<string | null>(null)
  const [ordenLaboratorioAbierta, setOrdenLaboratorioAbierta] = useState(false)
  const [prescripcionAbierta, setPrescripcionAbierta] = useState(false)
  const [productosAbierta, setProductosAbierta] = useState(false)
  const { recetas, examenes } = useRolePermissions()

  if (!paciente) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona un paciente para ver las acciones disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const handleAccionClick = (accion: AccionMedica) => {
    // Verificar permisos antes de abrir
    if (accion.tipo === 'prescripcion' && !recetas.canCreate) {
      toast.error('No tienes permiso para crear recetas')
      return
    }
    if (accion.tipo === 'examenes' && !examenes.canCreate) {
      toast.error('No tienes permiso para crear exámenes')
      return
    }
    
    setAccionSeleccionada(accion.id)
    switch (accion.tipo) {
      case 'laboratorio':
        setOrdenLaboratorioAbierta(true)
        break
      case 'prescripcion':
        setPrescripcionAbierta(true)
        break
      case 'productos':
        setProductosAbierta(true)
        break
      default:
        break
    }
  }
  
  // Filtrar acciones según permisos
  const accionesDisponibles = accionesMedicas.filter(accion => {
    if (accion.tipo === 'prescripcion') return recetas.canCreate
    if (accion.tipo === 'examenes') return examenes.canCreate
    return true // laboratorio y productos siempre disponibles para médicos
  })

  const handleOrdenLaboratorioCreada = (orden: any) => {
    onAccionCompletada('laboratorio', orden)
    setOrdenLaboratorioAbierta(false)
    setAccionSeleccionada(null)
  }

  const handlePrescripcionCreada = (prescripcion: any) => {
    onAccionCompletada('prescripcion', prescripcion)
    setPrescripcionAbierta(false)
    setAccionSeleccionada(null)
  }

  const handleProductosCreada = (orden: any) => {
    onAccionCompletada('productos', orden)
    setProductosAbierta(false)
    setAccionSeleccionada(null)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Centro de Acciones Médicas
          </h2>
          <p className="text-gray-600 mb-4">
            Gestiona órdenes médicas, prescripciones y productos para{' '}
            <span className="font-semibold text-primary">
              {paciente.nombre} {paciente.apellido_paterno}
            </span>
          </p>
          
          {/* Información médica relevante del paciente */}
          {(paciente.alergias || paciente.enfermedades_cronicas) && (
            <Card className="border-yellow-200 bg-yellow-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h3 className="font-medium text-yellow-800">Información Médica Importante</h3>
                </div>
                {paciente.alergias && (
                  <p className="text-sm text-yellow-700 mb-1">
                    <strong>Alergias:</strong> {paciente.alergias}
                  </p>
                )}
                {paciente.enfermedades_cronicas && (
                  <p className="text-sm text-yellow-700">
                    <strong>Enfermedades crónicas:</strong> {paciente.enfermedades_cronicas}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Grid de acciones médicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accionesDisponibles.map((accion, index) => {
            const Icon = accion.icono
            const tienePermiso = 
              (accion.tipo === 'prescripcion' && recetas.canCreate) ||
              (accion.tipo === 'examenes' && examenes.canCreate) ||
              accion.tipo === 'laboratorio' ||
              accion.tipo === 'productos'
            
            return (
              <motion.div
                key={accion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={tienePermiso ? { scale: 1.02 } : {}}
                whileTap={tienePermiso ? { scale: 0.98 } : {}}
              >
                <Card 
                  className={`transition-all duration-200 ${tienePermiso ? `cursor-pointer hover:shadow-lg ${accion.borderColor} border-2` : 'opacity-60 border-gray-200'} ${accion.borderColor} border-2`}
                  onClick={() => tienePermiso && handleAccionClick(accion)}
                >
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${accion.bgColor} flex items-center justify-center mb-3 relative`}>
                      <Icon className={`h-6 w-6 ${accion.color}`} />
                      {!tienePermiso && (
                        <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {accion.titulo}
                      {!tienePermiso && (
                        <Badge variant="outline" className="text-xs">Sin permiso</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {accion.descripcion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      className={`w-full ${accion.bgColor} ${accion.color} hover:${accion.bgColor} border-0`}
                      variant="outline"
                      disabled={!tienePermiso}
                    >
                      {tienePermiso ? accion.titulo : 'Sin permiso'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Información adicional */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Información del Proceso</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Orden de Laboratorio</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Selección de pruebas disponibles</li>
                  <li>• Configuración de urgencia</li>
                  <li>• Indicaciones especiales</li>
                  <li>• Estimación de tiempos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prescripción Médica</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Diagnóstico médico</li>
                  <li>• Medicamentos con dosis</li>
                  <li>• Frecuencia y duración</li>
                  <li>• Contraindicaciones verificadas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Productos Médicos</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Equipos y suministros</li>
                  <li>• Control de inventario</li>
                  <li>• Productos que requieren receta</li>
                  <li>• Categorización por tipo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Beneficios del Sistema</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Historial completo integrado</li>
                  <li>• Validaciones automáticas</li>
                  <li>• Seguimiento en tiempo real</li>
                  <li>• Reportes detallados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales de acciones */}
      <OrdenLaboratorioModal
        open={ordenLaboratorioAbierta}
        onClose={() => {
          setOrdenLaboratorioAbierta(false)
          setAccionSeleccionada(null)
        }}
        paciente={paciente}
        onOrdenCreada={handleOrdenLaboratorioCreada}
      />

      <PrescripcionModal
        open={prescripcionAbierta}
        onClose={() => {
          setPrescripcionAbierta(false)
          setAccionSeleccionada(null)
        }}
        paciente={paciente}
        onPrescripcionCreada={handlePrescripcionCreada}
      />

      <OrdenProductosModal
        open={productosAbierta}
        onClose={() => {
          setProductosAbierta(false)
          setAccionSeleccionada(null)
        }}
        paciente={paciente}
        onOrdenCreada={handleProductosCreada}
      />
    </>
  )
}