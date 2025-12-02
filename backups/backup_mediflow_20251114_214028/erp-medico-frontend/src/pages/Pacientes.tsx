// Página principal del módulo de Pacientes/Empleados
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  Shield,
  Clock,
  Heart,
  UserCheck,
  Briefcase,
  Stethoscope
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TimelineMedico } from '@/components/TimelineMedico'
import { GestionDocumentos } from '@/components/GestionDocumentos'
import { AlertasSeguimiento } from '@/components/AlertasSeguimiento'
import { CentroAccionesMedicas } from '@/components/medicina/CentroAccionesMedicas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

// Esquemas de validación
const empleadoSchema = z.object({
  numero_empleado: z.string().min(1, 'Número de empleado requerido'),
  nss: z.string().optional(),
  curp: z.string().optional(),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido_paterno: z.string().min(1, 'Apellido paterno requerido'),
  apellido_materno: z.string().optional(),
  fecha_nacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  genero: z.string().min(1, 'Género requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_ingreso: z.string().optional(),
  puesto_trabajo_id: z.string().optional(),
  tipo_sangre: z.string().optional(),
  alergias: z.string().optional(),
  enfermedades_cronicas: z.string().optional(),
})

type EmpleadoForm = z.infer<typeof empleadoSchema>

// Tipos para los datos
interface Paciente {
  id: string
  numero_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  genero: string
  fecha_nacimiento: string
  email?: string
  telefono?: string
  fecha_ingreso?: string
  estatus: string
  foto_url?: string
  puesto_trabajo?: {
    nombre: string
    departamento: string
  }
  proximos_examenes?: number
  alertas_activas?: number
}

interface HistorialMedico {
  id: string
  fecha_evento: string
  tipo_evento: string
  descripcion: string
  diagnostico?: string
  aptitud_medica?: string
  estado: 'completado' | 'pendiente' | 'cancelado'
}

// Tipos importados desde los componentes correspondientes
import { TimelineEvent } from '@/components/TimelineMedico'
import { DocumentoMedico } from '@/components/GestionDocumentos'

// Interfaz local para compatibilidad
interface Documento {
  id: string
  tipo_documento: string
  nombre: string
  fecha_subida: string
  url: string
  estado: string
}

// Datos demo para el desarrollo
const DEMO_PACIENTES: Paciente[] = [
  {
    id: '1',
    numero_empleado: 'EMP001',
    nombre: 'Juan Carlos',
    apellido_paterno: 'García',
    apellido_materno: 'López',
    genero: 'masculino',
    fecha_nacimiento: '1985-03-15',
    email: 'juan.garcia@empresa.mx',
    telefono: '555-0123',
    fecha_ingreso: '2020-01-15',
    estatus: 'activo',
    puesto_trabajo: {
      nombre: 'Operario de Producción',
      departamento: 'Producción'
    },
    proximos_examenes: 2,
    alertas_activas: 1
  },
  {
    id: '2',
    numero_empleado: 'EMP002',
    nombre: 'María Elena',
    apellido_paterno: 'Rodríguez',
    apellido_materno: 'Martínez',
    genero: 'femenino',
    fecha_nacimiento: '1990-07-22',
    email: 'maria.rodriguez@empresa.mx',
    telefono: '555-0124',
    fecha_ingreso: '2019-03-10',
    estatus: 'activo',
    puesto_trabajo: {
      nombre: 'Asistente Administrativa',
      departamento: 'Administración'
    },
    proximos_examenes: 0,
    alertas_activas: 0
  }
]

const DEMO_HISTORIAL: HistorialMedico[] = [
  {
    id: '1',
    fecha_evento: '2024-10-15',
    tipo_evento: 'examen_periodico',
    descripcion: 'Examen médico ocupacional anual',
    diagnostico: 'Sin alteraciones patológicas',
    aptitud_medica: 'apto',
    estado: 'completado'
  },
  {
    id: '2',
    fecha_evento: '2024-08-10',
    tipo_evento: 'consulta',
    descripcion: 'Consulta médica general',
    diagnostico: 'Cefalea tensional',
    aptitud_medica: null,
    estado: 'completado'
  }
]

const DEMO_DOCUMENTOS: Documento[] = [
  {
    id: '1',
    tipo_documento: 'examen_medico',
    nombre: 'Examen Ocupacional 2024.pdf',
    fecha_subida: '2024-10-15',
    url: '#',
    estado: 'vigente'
  },
  {
    id: '2',
    tipo_documento: 'certificado_aptitud',
    nombre: 'Certificado de Aptitud.pdf',
    fecha_subida: '2024-10-15',
    url: '#',
    estado: 'vigente'
  }
]

const DEMO_ALERTAS = [
  {
    id: '1',
    tipo_alerta: 'proximo_examen',
    titulo: 'Examen Periódico Vencido',
    descripcion: 'El examen médico ocupacional anual ha vencido',
    paciente_id: '1',
    paciente_nombre: 'Juan Carlos García López',
    numero_empleado: 'EMP001',
    fecha_vencimiento: '2024-10-15',
    prioridad: 'alta' as const,
    estado: 'activa' as const,
    dias_restantes: -15,
    accion_requerida: 'Programar examen médico ocupacional de inmediato',
    fecha_creacion: '2024-10-15'
  },
  {
    id: '2',
    tipo_alerta: 'seguimiento_requerido',
    titulo: 'Seguimiento Post-Consulta',
    descripcion: 'Requiere seguimiento médico según última consulta',
    paciente_id: '2',
    paciente_nombre: 'María Elena Rodríguez Martínez',
    numero_empleado: 'EMP002',
    fecha_programada: '2024-11-10',
    prioridad: 'media' as const,
    estado: 'activa' as const,
    dias_restantes: 7,
    accion_requerida: 'Agendar cita de seguimiento con especialista',
    fecha_creacion: '2024-11-01'
  }
]

const user = {
  id: 'demo-user',
  email: 'demo@mediflow.com',
  name: 'Usuario Demo',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'MediFlow Demo Corp' },
  sede: { nombre: 'Sede Principal' }
}

export function Pacientes() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<Paciente[]>(DEMO_PACIENTES)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [tabPaciente, setTabPaciente] = useState<string>('informacion')
  const [showForm, setShowForm] = useState(false)
  const [filtroEstatus, setFiltroEstatus] = useState<string>('todos')
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const form = useForm<EmpleadoForm>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      numero_empleado: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      genero: '',
      fecha_nacimiento: '',
    }
  })

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(paciente => {
    const matchesSearch = paciente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paciente.apellido_paterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paciente.numero_empleado.includes(searchQuery)
    
    const matchesEstatus = filtroEstatus === 'todos' || paciente.estatus === filtroEstatus
    
    const matchesDepartamento = filtroDepartamento === 'todos' || 
                               paciente.puesto_trabajo?.departamento === filtroDepartamento

    return matchesSearch && matchesEstatus && matchesDepartamento
  })

  const onSubmit = async (data: EmpleadoForm) => {
    try {
      // Aquí se implementaría la lógica para guardar en Supabase
      console.log('Datos del empleado:', data)
      toast.success('Empleado registrado exitosamente')
      setShowForm(false)
      form.reset()
    } catch (error) {
      toast.error('Error al registrar empleado')
    }
  }

  const eliminarPaciente = async (id: string) => {
    try {
      setPacientes(pacientes.filter(p => p.id !== id))
      toast.success('Empleado eliminado exitosamente')
    } catch (error) {
      toast.error('Error al eliminar empleado')
    }
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Pacientes y Empleados
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona el registro completo de empleados y su historial médico laboral
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
              <DialogDescription>
                Completa la información personal, laboral y médica del empleado
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="laboral">Laboral</TabsTrigger>
                <TabsTrigger value="medico">Médico</TabsTrigger>
                <TabsTrigger value="imss">IMSS/ISSSTE</TabsTrigger>
              </TabsList>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Número de Empleado *</label>
                      <Input {...form.register('numero_empleado')} />
                      {form.formState.errors.numero_empleado && (
                        <p className="text-sm text-red-600">{form.formState.errors.numero_empleado.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">NSS</label>
                      <Input {...form.register('nss')} placeholder="12345678901" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nombre *</label>
                      <Input {...form.register('nombre')} />
                      {form.formState.errors.nombre && (
                        <p className="text-sm text-red-600">{form.formState.errors.nombre.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Apellido Materno</label>
                      <Input {...form.register('apellido_materno')} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Apellido Paterno *</label>
                      <Input {...form.register('apellido_paterno')} />
                      {form.formState.errors.apellido_paterno && (
                        <p className="text-sm text-red-600">{form.formState.errors.apellido_paterno.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">CURP</label>
                      <Input {...form.register('curp')} placeholder="GAML850315HDFRRL09" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Fecha de Nacimiento *</label>
                      <Input type="date" {...form.register('fecha_nacimiento')} />
                      {form.formState.errors.fecha_nacimiento && (
                        <p className="text-sm text-red-600">{form.formState.errors.fecha_nacimiento.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Género *</label>
                      <Select onValueChange={(value) => form.setValue('genero', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.genero && (
                        <p className="text-sm text-red-600">{form.formState.errors.genero.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" {...form.register('email')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Teléfono</label>
                      <Input {...form.register('telefono')} placeholder="555-0123" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Dirección</label>
                    <Input {...form.register('direccion')} placeholder="Calle, número, colonia" />
                  </div>
                </TabsContent>
                
                <TabsContent value="laboral" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Fecha de Ingreso</label>
                    <Input type="date" {...form.register('fecha_ingreso')} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Puesto de Trabajo</label>
                    <Select onValueChange={(value) => form.setValue('puesto_trabajo_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar puesto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Operario de Producción</SelectItem>
                        <SelectItem value="2">Asistente Administrativa</SelectItem>
                        <SelectItem value="3">Supervisor de Calidad</SelectItem>
                        <SelectItem value="4">Técnico de Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Departamento</label>
                    <Select onValueChange={(value) => setFiltroDepartamento(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produccion">Producción</SelectItem>
                        <SelectItem value="administracion">Administración</SelectItem>
                        <SelectItem value="calidad">Calidad</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="medico" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tipo de Sangre</label>
                      <Select onValueChange={(value) => form.setValue('tipo_sangre', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de sangre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Estado Civil</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soltero">Soltero(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viudo">Viudo(a)</SelectItem>
                          <SelectItem value="union_libre">Unión Libre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Alergias</label>
                    <Input {...form.register('alergias')} placeholder="Especificar alergias conocidas" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Enfermedades Crónicas</label>
                    <Input {...form.register('enfermedades_cronicas')} placeholder="Especificar enfermedades crónicas" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Medicamentos Actuales</label>
                    <Input placeholder="Especificar medicamentos en uso" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Antecedentes Familiares</label>
                    <Input placeholder="Antecedentes médicos familiares relevantes" />
                  </div>
                </TabsContent>
                
                <TabsContent value="imss" className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Los datos del IMSS/ISSSTE son requeridos para la integración con las instituciones de seguridad social.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Número IMSS</label>
                      <Input {...form.register('nss')} placeholder="Número de seguridad social" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ISSSTE</label>
                      <Input placeholder="Número ISSSTE (si aplica)" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Fecha Alta IMSS</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Salario Diario Integrado</label>
                      <Input type="number" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Enfermedad de Trabajo</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="¿Ha tenido enfermedad de trabajo?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="si_actual">Sí, actual</SelectItem>
                        <SelectItem value="si_historica">Sí, histórica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Registrar Empleado
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, apellido o número de empleado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroEstatus} onValueChange={setFiltroEstatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estatus</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los departamentos</SelectItem>
                <SelectItem value="produccion">Producción</SelectItem>
                <SelectItem value="administracion">Administración</SelectItem>
                <SelectItem value="calidad">Calidad</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{pacientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pacientes.filter(p => p.estatus === 'activo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próximos Exámenes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pacientes.reduce((acc, p) => acc + (p.proximos_examenes || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pacientes.reduce((acc, p) => acc + (p.alertas_activas || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listado de pacientes */}
      <div className="grid gap-6">
        {pacientesFiltrados.map((paciente) => (
          <Card key={paciente.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={paciente.foto_url} />
                    <AvatarFallback>
                      {paciente.nombre[0]}{paciente.apellido_paterno[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg">
                      {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Briefcase className="mr-1 h-4 w-4" />
                        {paciente.numero_empleado}
                      </span>
                      {paciente.puesto_trabajo && (
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {paciente.puesto_trabajo.departamento}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(paciente.fecha_nacimiento), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      {paciente.email && (
                        <span className="flex items-center">
                          <Mail className="mr-1 h-4 w-4" />
                          {paciente.email}
                        </span>
                      )}
                      {paciente.telefono && (
                        <span className="flex items-center">
                          <Phone className="mr-1 h-4 w-4" />
                          {paciente.telefono}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <Badge 
                      variant={paciente.estatus === 'activo' ? 'default' : 'secondary'}
                      className={paciente.estatus === 'activo' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {paciente.estatus}
                    </Badge>
                    
                    {paciente.puesto_trabajo && (
                      <p className="text-sm text-gray-600 mt-1">
                        {paciente.puesto_trabajo.nombre}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2">
                      {paciente.proximos_examenes && paciente.proximos_examenes > 0 && (
                        <Badge variant="outline" className="text-blue-600">
                          <Stethoscope className="mr-1 h-3 w-3" />
                          {paciente.proximos_examenes} examen{paciente.proximos_examenes > 1 ? 'es' : ''}
                        </Badge>
                      )}
                      
                      {paciente.alertas_activas && paciente.alertas_activas > 0 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {paciente.alertas_activas} alerta{paciente.alertas_activas > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPacienteSeleccionado(paciente); setTabPaciente('informacion') }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => eliminarPaciente(paciente.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Ingresar a Historial Clínico */}
                    <Button 
                      size="sm"
                      className="bg-primary text-white hover:bg-primary/90"
                      onClick={() => navigate(`/pacientes/${paciente.id}/historial`, { state: { paciente } })}
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Ingresar a Historial Clínico
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {pacientesFiltrados.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron empleados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filtroEstatus !== 'todos' || filtroDepartamento !== 'todos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Comienza registrando un nuevo empleado'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de detalle del paciente */}
      {pacienteSeleccionado && (
        <Dialog open={!!pacienteSeleccionado} onOpenChange={(open) => !open && setPacienteSeleccionado(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={pacienteSeleccionado.foto_url} />
                  <AvatarFallback>
                    {pacienteSeleccionado.nombre[0]}{pacienteSeleccionado.apellido_paterno[0]}
                  </AvatarFallback>
                </Avatar>
                {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido_paterno} {pacienteSeleccionado.apellido_materno}
              </DialogTitle>
              <DialogDescription>
                Información completa del empleado y su historial médico laboral
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={tabPaciente} onValueChange={setTabPaciente} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="informacion">Información</TabsTrigger>
                <TabsTrigger value="historial">Historial Médico</TabsTrigger>
                <TabsTrigger value="examenes">Exámenes</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="incapacidades">Incapacidades</TabsTrigger>
                <TabsTrigger value="certificados">Certificados</TabsTrigger>
                <TabsTrigger value="acciones" className="bg-primary/10 text-primary">Acciones Médicas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="informacion" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Datos Personales</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Número de Empleado:</span>
                        <span>{pacienteSeleccionado.numero_empleado}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Nacimiento:</span>
                        <span>{format(new Date(pacienteSeleccionado.fecha_nacimiento), 'dd/MM/yyyy', { locale: es })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Género:</span>
                        <span className="capitalize">{pacienteSeleccionado.genero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{pacienteSeleccionado.email || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teléfono:</span>
                        <span>{pacienteSeleccionado.telefono || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Datos Laborales</h3>
                    <div className="space-y-2 text-sm">
                      {pacienteSeleccionado.puesto_trabajo && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Puesto:</span>
                            <span>{pacienteSeleccionado.puesto_trabajo.nombre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Departamento:</span>
                            <span>{pacienteSeleccionado.puesto_trabajo.departamento}</span>
                          </div>
                        </>
                      )}
                      {pacienteSeleccionado.fecha_ingreso && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha de Ingreso:</span>
                          <span>{format(new Date(pacienteSeleccionado.fecha_ingreso), 'dd/MM/yyyy', { locale: es })}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estatus:</span>
                        <Badge variant={pacienteSeleccionado.estatus === 'activo' ? 'default' : 'secondary'}>
                          {pacienteSeleccionado.estatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <DialogClose asChild>
                    <Button variant="outline">
                      Cerrar
                    </Button>
                  </DialogClose>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Información
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="historial">
                <TimelineMedico eventos={DEMO_HISTORIAL} maxEventos={15} />
              </TabsContent>
              
              <TabsContent value="examenes">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Exámenes Ocupacionales</h3>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Calendar className="mr-2 h-4 w-4" />
                      Programar Examen
                    </Button>
                  </div>
                  
                  <Alert>
                    <Stethoscope className="h-4 w-4" />
                    <AlertDescription>
                      Próximo examen programado: 15 de enero de 2025
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center py-8 text-gray-500">
                    No hay exámenes registrados aún
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documentos">
                <GestionDocumentos 
                  pacienteId={pacienteSeleccionado?.id || ''}
                  documentos={DEMO_DOCUMENTOS.map(doc => ({
                    id: doc.id,
                    nombre: doc.nombre,
                    tipo_documento: doc.tipo_documento,
                    fecha_subida: doc.fecha_subida,
                    url: doc.url,
                    estado: 'vigente' as const,
                    tamaño: 2048576, // 2MB demo
                    extension: 'pdf',
                    subido_por: 'Dr. Sistema',
                    categoria: doc.tipo_documento === 'examen_medico' ? 'examen_medico' : 
                               doc.tipo_documento === 'certificado_aptitud' ? 'certificado' : 'otro'
                  } as DocumentoMedico))}
                  onUpload={(files) => {
                    toast.success(`${files.length} archivo(s) subido(s) correctamente`)
                  }}
                  onDelete={(id) => {
                    toast.success('Documento eliminado')
                  }}
                  onView={(doc) => {
                    toast.success(`Visualizando: ${doc.nombre}`)
                  }}
                  onDownload={(doc) => {
                    toast.success(`Descargando: ${doc.nombre}`)
                  }}
                />
              </TabsContent>
              
              <TabsContent value="incapacidades">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Incapacidades Laborales</h3>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Incapacidad
                    </Button>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    No se han registrado incapacidades
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="certificados">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Certificados de Aptitud</h3>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Shield className="mr-2 h-4 w-4" />
                      Generar Certificado
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Certificado de Aptitud Médica</p>
                            <p className="text-sm text-gray-600">Vigente hasta: 15/10/2025</p>
                          </div>
                          <Badge variant="default">Vigente</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="acciones">
                <CentroAccionesMedicas 
                  paciente={pacienteSeleccionado}
                  onAccionCompletada={(tipo, datos) => {
                    // Aquí se puede manejar la respuesta de las acciones médicas
                    console.log(`Acción ${tipo} completada:`, datos)
                    toast.success(`${tipo === 'laboratorio' ? 'Orden de laboratorio' : tipo === 'prescripcion' ? 'Prescripción médica' : 'Orden de productos'} creada exitosamente`)
                  }}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}