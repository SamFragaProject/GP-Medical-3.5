// Componente de Gestión de Usuarios con Jerarquías SaaS
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Building,
  UserCog,
  UserPlus,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Activity,
  Clock
} from 'lucide-react'

import {
  SaaSUser,
  UserHierarchy,
  SaaSEnterprise,
  Department,
  Clinic,
  HIERARCHY_CONSTANTS,
  HIERARCHY_LEVELS
} from '@/types/saas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'

// Datos demo para departamentos y clínicas
const DEMO_DEPARTMENTS: Department[] = [
  {
    id: 'department_1',
    name: 'Medicina Especializada',
    enterpriseId: 'enterprise_1',
    manager: '2',
    description: 'Departamento de medicina especializada',
    settings: {
      workingHours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isWorking: true }
      ],
      specialties: ['Cardiología', 'Neurología', 'Endocrinología'],
      protocols: ['Consulta General', 'Examen Cardiovascular'],
      complianceRequirements: ['NOM-024-SSA3-2012']
    },
    clinics: ['clinic_1'],
    users: ['2', '3', '5', '7'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'department_2',
    name: 'Medicina del Trabajo',
    enterpriseId: 'enterprise_1',
    manager: '2',
    description: 'Departamento de medicina ocupacional',
    settings: {
      workingHours: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 2, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 3, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 4, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 5, startTime: '07:00', endTime: '15:00', isWorking: true }
      ],
      specialties: ['Medicina del Trabajo', 'Ergonomía'],
      protocols: ['Examen Pre-ocupacional', 'Examen Periódico'],
      complianceRequirements: ['NOM-017-STPS-2008', 'NOM-036-STPS-2018']
    },
    clinics: ['clinic_2'],
    users: ['4'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'department_3',
    name: 'Diagnóstico',
    enterpriseId: 'enterprise_1',
    manager: '4',
    description: 'Departamento de diagnóstico',
    settings: {
      workingHours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isWorking: true }
      ],
      specialties: ['Audiometría', 'Rayos X', 'Laboratorio'],
      protocols: ['Audiometría', 'Radiografía de Tórax'],
      complianceRequirements: ['NOM-004-SSA3-2012']
    },
    clinics: ['clinic_3'],
    users: ['6'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
]

const DEMO_CLINICS: Clinic[] = [
  {
    id: 'clinic_1',
    name: 'Clínica Roma',
    departmentId: 'department_1',
    enterpriseId: 'enterprise_1',
    address: {
      street: 'Av. Álvaro Obregón',
      number: '123',
      colony: 'Roma Norte',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '06700'
    },
    contact: {
      phone: '+52 55 1234 5678',
      email: 'roma@clinica-demo.com'
    },
    settings: {
      allowOnlineBooking: true,
      requireApproval: false,
      maxAdvanceBooking: 30,
      cancellationPolicy: '24 horas de anticipación',
      protocols: ['Consulta General', 'Examen Cardiovascular']
    },
    capacity: {
      maxPatientsPerDay: 50,
      maxExaminationsPerDay: 30,
      workingHours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isWorking: true }
      ]
    },
    staff: ['3', '5', '7'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'clinic_2',
    name: 'Clínica Polanco',
    departmentId: 'department_2',
    enterpriseId: 'enterprise_1',
    address: {
      street: 'Av. Presidente Masaryk',
      number: '456',
      colony: 'Polanco',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '11560'
    },
    contact: {
      phone: '+52 55 2345 6789',
      email: 'polanco@clinica-demo.com'
    },
    settings: {
      allowOnlineBooking: true,
      requireApproval: true,
      maxAdvanceBooking: 7,
      cancellationPolicy: '48 horas de anticipación',
      protocols: ['Examen Pre-ocupacional', 'Examen Periódico']
    },
    capacity: {
      maxPatientsPerDay: 40,
      maxExaminationsPerDay: 25,
      workingHours: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 2, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 3, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 4, startTime: '07:00', endTime: '15:00', isWorking: true },
        { dayOfWeek: 5, startTime: '07:00', endTime: '15:00', isWorking: true }
      ]
    },
    staff: ['4'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'clinic_3',
    name: 'Clínica Santa Fe',
    departmentId: 'department_3',
    enterpriseId: 'enterprise_1',
    address: {
      street: 'Av. Santa Fe',
      number: '789',
      colony: 'Santa Fe',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '01219'
    },
    contact: {
      phone: '+52 55 3456 7890',
      email: 'santa.fe@clinica-demo.com'
    },
    settings: {
      allowOnlineBooking: true,
      requireApproval: false,
      maxAdvanceBooking: 15,
      cancellationPolicy: '24 horas de anticipación',
      protocols: ['Audiometría', 'Radiografía de Tórax']
    },
    capacity: {
      maxPatientsPerDay: 30,
      maxExaminationsPerDay: 20,
      workingHours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isWorking: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isWorking: true }
      ]
    },
    staff: ['6'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
]

interface UserFormData {
  name: string
  email: string
  hierarchy: UserHierarchy
  departmentId?: string
  clinicId?: string
  reportsTo?: string
  phone?: string
  metadata: Record<string, any>
  status: 'active' | 'inactive' | 'suspended' | 'pending'
}

interface HierarchyInfoProps {
  hierarchy: UserHierarchy
  department?: Department
  clinic?: Clinic
  reportsTo?: SaaSUser
}

function HierarchyInfo({ hierarchy, department, clinic, reportsTo }: HierarchyInfoProps) {
  const getHierarchyIcon = (hierarchy: UserHierarchy) => {
    switch (hierarchy) {
      case HIERARCHY_CONSTANTS.SUPER_ADMIN:
        return <Crown className="w-4 h-4 text-purple-500" />
      case HIERARCHY_CONSTANTS.ADMIN_EMPRESA:
        return <Building className="w-4 h-4 text-blue-500" />
      case HIERARCHY_CONSTANTS.MEDICO_ESPECIALISTA:
      case HIERARCHY_CONSTANTS.MEDICO_TRABAJO:
        return <Award className="w-4 h-4 text-green-500" />
      case HIERARCHY_CONSTANTS.ENFERMERA:
      case HIERARCHY_CONSTANTS.AUDIOMETRISTA:
      case HIERARCHY_CONSTANTS.PSICOLOGO_LABORAL:
      case HIERARCHY_CONSTANTS.TECNICO_ERGONOMICO:
        return <UserCog className="w-4 h-4 text-orange-500" />
      case HIERARCHY_CONSTANTS.RECEPCION:
        return <UserPlus className="w-4 h-4 text-gray-500" />
      case HIERARCHY_CONSTANTS.PACIENTE:
        return <Users className="w-4 h-4 text-teal-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const getHierarchyLabel = (hierarchy: UserHierarchy) => {
    const labels: Record<UserHierarchy, string> = {
      super_admin: 'Super Administrador',
      admin_empresa: 'Administrador de Empresa',
      medico_especialista: 'Médico Especialista',
      medico_trabajo: 'Médico del Trabajo',
      enfermera: 'Enfermera',
      audiometrista: 'Audiometrista',
      psicologo_laboral: 'Psicólogo Laboral',
      tecnico_ergonomico: 'Técnico Ergonómico',
      recepcion: 'Recepcionista',
      paciente: 'Paciente',
      medico_industrial: 'Médico Industrial',
      bot: 'Bot'
    }
    return labels[hierarchy] || hierarchy
  }

  const getHierarchyColor = (hierarchy: UserHierarchy) => {
    const colors: Record<UserHierarchy, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin_empresa: 'bg-blue-100 text-blue-800',
      medico_especialista: 'bg-green-100 text-green-800',
      medico_trabajo: 'bg-green-100 text-green-800',
      enfermera: 'bg-orange-100 text-orange-800',
      audiometrista: 'bg-orange-100 text-orange-800',
      psicologo_laboral: 'bg-orange-100 text-orange-800',
      tecnico_ergonomico: 'bg-orange-100 text-orange-800',
      recepcion: 'bg-gray-100 text-gray-800',
      paciente: 'bg-teal-100 text-teal-800',
      medico_industrial: 'bg-green-100 text-green-800',
      bot: 'bg-gray-100 text-gray-800'
    }
    return colors[hierarchy] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {getHierarchyIcon(hierarchy)}
        <Badge className={getHierarchyColor(hierarchy)}>
          {getHierarchyLabel(hierarchy)}
        </Badge>
      </div>

      {department && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="w-3 h-3" />
          <span>{department.name}</span>
        </div>
      )}

      {clinic && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-3 h-3" />
          <span>{clinic.name}</span>
        </div>
      )}

      {reportsTo && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="w-3 h-3" />
          <span>Reporta a: {reportsTo.name}</span>
        </div>
      )}
    </div>
  )
}

function UserForm({ user, onSave, onCancel }: {
  user?: SaaSUser
  onSave: (data: UserFormData) => void
  onCancel: () => void
}) {
  const currentUser = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' },
    enterpriseId: 'enterprise_1'
  }
  const hasPermission = (module?: string, action?: string) => true
  const [users, setUsers] = useState<SaaSUser[]>([])

  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    hierarchy: user?.hierarchy || HIERARCHY_CONSTANTS.PACIENTE,
    departmentId: user?.departmentId,
    clinicId: user?.clinicId,
    reportsTo: user?.reportsTo,
    phone: user?.phone || '',
    metadata: user?.metadata || {},
    status: user?.status || 'active'
  })

  const hierarchyOptions: { value: UserHierarchy; label: string }[] = [
    { value: HIERARCHY_CONSTANTS.PACIENTE, label: 'Paciente' },
    { value: HIERARCHY_CONSTANTS.RECEPCION, label: 'Recepcionista' },
    { value: HIERARCHY_CONSTANTS.TECNICO_ERGONOMICO, label: 'Técnico Ergonómico' },
    { value: HIERARCHY_CONSTANTS.PSICOLOGO_LABORAL, label: 'Psicólogo Laboral' },
    { value: HIERARCHY_CONSTANTS.AUDIOMETRISTA, label: 'Audiometrista' },
    { value: HIERARCHY_CONSTANTS.ENFERMERA, label: 'Enfermera' },
    { value: HIERARCHY_CONSTANTS.MEDICO_TRABAJO, label: 'Médico del Trabajo' },
    { value: HIERARCHY_CONSTANTS.MEDICO_ESPECIALISTA, label: 'Médico Especialista' },
    { value: HIERARCHY_CONSTANTS.ADMIN_EMPRESA, label: 'Administrador de Empresa' },
    { value: HIERARCHY_CONSTANTS.SUPER_ADMIN, label: 'Super Administrador' }
  ]

  useEffect(() => {
    if (hasPermission('users', 'read')) {
      // getEnterpriseUsers().then(setUsers)
    }
  }, [hasPermission])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.hierarchy) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    onSave(formData)
  }

  const departments = DEMO_DEPARTMENTS.filter(d =>
    d.enterpriseId === currentUser?.enterpriseId && d.isActive
  )

  const clinics = formData.departmentId
    ? DEMO_CLINICS.filter(c => c.departmentId === formData.departmentId && c.isActive)
    : []

  const possibleManagers = users.filter(u =>
    u.id !== user?.id &&
    u.hierarchy !== HIERARCHY_CONSTANTS.PACIENTE &&
    HIERARCHY_LEVELS[u.hierarchy] > HIERARCHY_LEVELS[formData.hierarchy]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dr. Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="juan.perez@clinica-demo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jerarquía *
          </label>
          <select
            value={formData.hierarchy}
            onChange={(e) => setFormData({ ...formData, hierarchy: e.target.value as UserHierarchy })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            {hierarchyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento
          </label>
          <select
            value={formData.departmentId || ''}
            onChange={(e) => setFormData({
              ...formData,
              departmentId: e.target.value || undefined,
              clinicId: undefined // Reset clinic when department changes
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clínica
          </label>
          <select
            value={formData.clinicId || ''}
            onChange={(e) => setFormData({ ...formData, clinicId: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!formData.departmentId}
          >
            <option value="">Seleccionar clínica</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supervisor
          </label>
          <select
            value={formData.reportsTo || ''}
            onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sin supervisor</option>
            {possibleManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.hierarchy.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">
          {user ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </form>
  )
}

export function SaaSUserManagement() {
  const user = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' },
    enterpriseId: 'enterprise_1'
  }
  const hasPermission = (module?: string, action?: string) => true
  const canViewAuditLogs = true
  const getUserHierarchy = () => 5
  const canManageUser = true
  const getEnterpriseUsers = () => Promise.resolve([]) // Mock function
  const createUser = (data: any) => Promise.resolve(data) // Mock function
  const updateUser = (id: string, data: any) => Promise.resolve({ id, ...data }) // Mock function
  const deleteUser = (id: string) => Promise.resolve({ id }) // Mock function

  const [users, setUsers] = useState<SaaSUser[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroJerarquia, setFiltroJerarquia] = useState<UserHierarchy[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [userSeleccionado, setUserSeleccionado] = useState<SaaSUser | null>(null)

  const userLevel = getUserHierarchy()
  const superiors = []
  const subordinates = []

  useEffect(() => {
    if (hasPermission('users', 'read')) {
      loadUsers()
    }
  }, [hasPermission])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const enterpriseUsers = await getEnterpriseUsers()
      setUsers(enterpriseUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCrearUsuario = () => {
    setModalType('create')
    setUserSeleccionado(null)
    setShowModal(true)
  }

  const handleEditarUsuario = (user: SaaSUser) => {
    if (!canManageUser) {
      toast.error('No tienes permisos para editar este usuario')
      return
    }
    setModalType('edit')
    setUserSeleccionado(user)
    setShowModal(true)
  }

  const handleEliminarUsuario = async (user: SaaSUser) => {
    if (!canManageUser) {
      toast.error('No tienes permisos para eliminar este usuario')
      return
    }

    if (user.id === user?.id) {
      toast.error('No puedes eliminar tu propio usuario')
      return
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      try {
        await deleteUser(user.id)
        await loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleGuardarUsuario = async (data: UserFormData) => {
    try {
      if (modalType === 'create') {
        await createUser({
          ...data,
          enterpriseId: user?.enterpriseId || ''
        })
      } else if (modalType === 'edit' && userSeleccionado) {
        await updateUser(userSeleccionado.id, data)
      }
      setShowModal(false)
      await loadUsers()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const handleCambiarEstado = async (user: SaaSUser, nuevoEstado: 'active' | 'inactive' | 'suspended') => {
    if (!canManageUser) {
      toast.error('No tienes permisos para cambiar el estado de este usuario')
      return
    }

    try {
      await updateUser(user.id, { status: nuevoEstado })
      await loadUsers()
      toast.success(`Usuario ${nuevoEstado === 'active' ? 'activado' : nuevoEstado === 'inactive' ? 'desactivado' : 'suspendido'} correctamente`)
    } catch (error) {
      console.error('Error changing user status:', error)
    }
  }

  const usersFiltrados = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      user.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (user.metadata?.specialization && user.metadata.specialization.toLowerCase().includes(busqueda.toLowerCase()))

    const matchesHierarchy = filtroJerarquia.length === 0 || filtroJerarquia.includes(user.hierarchy)
    const matchesStatus = filtroEstado.length === 0 || filtroEstado.includes(user.status)

    return matchesSearch && matchesHierarchy && matchesStatus
  })

  const getDepartmentById = (id?: string) => DEMO_DEPARTMENTS.find(d => d.id === id)
  const getClinicById = (id?: string) => DEMO_CLINICS.find(c => c.id === id)
  const getUserById = (id?: string) => users.find(u => u.id === id)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'suspended':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
      pending: 'Pendiente'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  // Verificación de permisos eliminada - acceso directo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios SaaS</h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios con jerarquías empresariales • Nivel: {userLevel}
          </p>
        </div>
        {hasPermission('users', 'create') && (
          <Button onClick={handleCrearUsuario} className="flex items-center space-x-2">
            <Plus size={16} />
            <span>Nuevo Usuario</span>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuarios..."
              className="pl-10"
            />
          </div>

          <select
            value={filtroJerarquia.join(',')}
            onChange={(e) => setFiltroJerarquia(e.target.value ? [e.target.value as UserHierarchy] : [])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las jerarquías</option>
            {Object.values(HIERARCHY_CONSTANTS).map((hierarchy) => (
              <option key={hierarchy} value={hierarchy}>
                {hierarchy.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado.join(',')}
            onChange={(e) => setFiltroEstado(e.target.value ? [e.target.value] : [])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
            <option value="pending">Pendiente</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {getStatusIcon('active')}
            <span className="ml-2">{usersFiltrados.length} usuarios encontrados</span>
          </div>
        </div>
      </Card>

      {/* Lista de usuarios */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {usersFiltrados.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      {canManageUser && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <HierarchyInfo
                    hierarchy={user.hierarchy}
                    department={getDepartmentById(user.departmentId)}
                    clinic={getClinicById(user.clinicId)}
                    reportsTo={getUserById(user.reportsTo)}
                  />

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      {getStatusBadge(user.status)}
                      {user.lastLogin && (
                        <span className="text-xs text-gray-500">
                          Último acceso: {user.lastLogin.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {user.metadata?.specialization && (
                      <div className="text-sm text-gray-600 mb-2">
                        <Award className="w-3 h-3 inline mr-1" />
                        {user.metadata.specialization}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {canManageUser && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarUsuario(user)}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          {user.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCambiarEstado(user, 'inactive')}
                              className="text-gray-600"
                            >
                              <Unlock className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCambiarEstado(user, 'active')}
                              className="text-green-600"
                            >
                              <Lock className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEliminarUsuario(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {usersFiltrados.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
          <p className="mt-1 text-sm text-gray-500">
            {busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza creando un nuevo usuario'}
          </p>
        </div>
      )}

      {/* Modal de formulario */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {modalType === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
            </h2>
            <UserForm
              user={modalType === 'edit' ? userSeleccionado || undefined : undefined}
              onSave={handleGuardarUsuario}
              onCancel={() => setShowModal(false)}
            />
          </Card>
        </div>
      </Dialog>
    </div>
  )
}
