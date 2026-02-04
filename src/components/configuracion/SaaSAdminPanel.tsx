// Panel de Administración SaaS con Jerarquías Completas
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor,
  Building,
  Users,
  Shield,
  Activity,
  TrendingUp,
  Crown,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  FileText,
  Settings,
  Eye,
  Database,
  Globe,
  Lock,
  Unlock,
  Award,
  UserCog,
  Target,
  Zap
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HIERARCHY_CONSTANTS,
  HIERARCHY_LEVELS,
  UserHierarchy,
  SaaSEnterprise,
  Department
} from '@/types/saas'

// Datos demo para estadísticas
const DEMO_STATISTICS = {
  totalUsers: 8,
  activeUsers: 7,
  suspendedUsers: 1,
  pendingUsers: 0,
  totalPatients: 247,
  totalAppointments: 1247,
  totalExaminations: 856,
  systemUptime: '99.8%',
  lastBackup: new Date('2024-11-01T06:00:00Z'),
  securityEvents: 3,
  complianceScore: 96.5
}

const HIERARCHY_STATS = {
  [HIERARCHY_CONSTANTS.SUPER_ADMIN]: { count: 1, label: 'Super Admin', icon: Crown, color: 'text-purple-500' },
  [HIERARCHY_CONSTANTS.ADMIN_EMPRESA]: { count: 1, label: 'Admin Empresa', icon: Building, color: 'text-blue-500' },
  [HIERARCHY_CONSTANTS.MEDICO_ESPECIALISTA]: { count: 1, label: 'Médico Especialista', icon: Award, color: 'text-green-500' },
  [HIERARCHY_CONSTANTS.MEDICO_TRABAJO]: { count: 1, label: 'Médico Trabajo', icon: Award, color: 'text-green-500' },
  [HIERARCHY_CONSTANTS.ENFERMERA]: { count: 1, label: 'Enfermera', icon: UserCog, color: 'text-orange-500' },
  [HIERARCHY_CONSTANTS.AUDIOMETRISTA]: { count: 1, label: 'Audiometrista', icon: UserCog, color: 'text-orange-500' },
  [HIERARCHY_CONSTANTS.RECEPCION]: { count: 1, label: 'Recepcionista', icon: Users, color: 'text-gray-500' },
  [HIERARCHY_CONSTANTS.PACIENTE]: { count: 1, label: 'Paciente', icon: Users, color: 'text-teal-500' }
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

function MetricCard({ title, value, icon: Icon, color, trend, description }: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-4 h-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
              />
              <span className={`text-sm ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )
}

interface HierarchyLevelCardProps {
  hierarchy: UserHierarchy
  stats: {
    count: number
    label: string
    icon: React.ComponentType<any>
    color: string
  }
  level: number
  maxLevel: number
}

function HierarchyLevelCard({ hierarchy, stats, level, maxLevel }: HierarchyLevelCardProps) {
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
      medico_industrial: 'Médico Industrial',
      bot: 'Bot',
      paciente: 'Paciente'
    }
    return labels[hierarchy] || hierarchy
  }

  const Icon = stats.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: level * 0.1 }}
      className="relative"
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getGradientForLevel(level, maxLevel)}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getHierarchyLabel(hierarchy)}</h3>
              <p className="text-sm text-gray-600">Nivel {level}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            {stats.count}
          </Badge>
        </div>

        {/* Barra de progreso visual */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${getGradientForLevel(level, maxLevel)}`}
            style={{ width: `${(stats.count / 5) * 100}%` }}
          ></div>
        </div>
      </Card>

      {/* Línea conectora (excepto el último nivel) */}
      {level < maxLevel && (
        <div className="flex justify-center my-2">
          <div className="w-px h-4 bg-gray-300"></div>
        </div>
      )}
    </motion.div>
  )
}

function getGradientForLevel(level: number, maxLevel: number): string {
  const percentage = level / maxLevel
  if (percentage === 1) return 'from-purple-400 to-purple-600' // Super Admin
  if (percentage >= 0.8) return 'from-blue-400 to-blue-600' // Admin Empresa
  if (percentage >= 0.6) return 'from-green-400 to-green-600' // Médicos
  if (percentage >= 0.4) return 'from-orange-400 to-orange-600' // Personal técnico
  if (percentage >= 0.2) return 'from-gray-400 to-gray-600' // Personal admin
  return 'from-teal-400 to-teal-600' // Pacientes
}

function SecurityStatus() {
  const canViewAuditLogs = true
  const [securityEvents, setSecurityEvents] = useState(DEMO_STATISTICS.securityEvents)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">Estado de Seguridad</h3>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Seguro
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Uptime del Sistema</span>
          <span className="font-semibold text-green-600">{DEMO_STATISTICS.systemUptime}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Último Backup</span>
          <span className="font-semibold text-gray-900">
            {DEMO_STATISTICS.lastBackup.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Eventos de Seguridad</span>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-yellow-600">{securityEvents}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Score de Cumplimiento</span>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-600">{DEMO_STATISTICS.complianceScore}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function EnterpriseInfo({ enterprise }: { enterprise: SaaSEnterprise }) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Building className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">Información de la Empresa</h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Nombre Comercial</p>
          <p className="font-semibold text-gray-900">{enterprise.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">RFC</p>
          <p className="font-semibold text-gray-900">{enterprise.rfc}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Plan de Suscripción</p>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">
              {enterprise.subscription.name}
            </Badge>
            <span className="text-sm text-gray-500">
              {enterprise.subscription.maxUsers} usuarios máx.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-gray-600">Empleados</p>
            <p className="font-semibold text-gray-900">{enterprise.metadata.employeeCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ubicaciones</p>
            <p className="font-semibold text-gray-900">{enterprise.metadata.locations}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function UserActivity() {
  const [activity] = useState([
    { id: 1, user: 'Dr. Carlos Mendoza', action: 'Actualizó configuración de empresa', time: 'Hace 5 min', type: 'config' },
    { id: 2, user: 'Dra. María González', action: 'Completó examen médico', time: 'Hace 12 min', type: 'medical' },
    { id: 3, user: 'Enf. Ana López', action: 'Programó cita nueva', time: 'Hace 18 min', type: 'appointment' },
    { id: 4, user: 'Téc. Luis Martín', action: 'Realizó audiometría', time: 'Hace 25 min', type: 'examination' },
    { id: 5, user: 'Sistema', action: 'Backup automático completado', time: 'Hace 1 hora', type: 'system' }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'config': return <Settings className="w-4 h-4 text-blue-500" />
      case 'medical': return <Activity className="w-4 h-4 text-green-500" />
      case 'appointment': return <Calendar className="w-4 h-4 text-purple-500" />
      case 'examination': return <FileText className="w-4 h-4 text-orange-500" />
      case 'system': return <Database className="w-4 h-4 text-gray-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
        </div>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Ver Todo
        </Button>
      </div>

      <div className="space-y-3">
        {activity.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.user}</p>
              <p className="text-sm text-gray-600">{item.action}</p>
              <p className="text-xs text-gray-500 mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SaaSAdminPanel() {
  const user = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  }
  const hasPermission = (resource?: string, action?: string) => true
  const canViewAuditLogs = true
  const getUserHierarchy = () => 5
  const getEnterpriseUsers = () => [] // Mock function
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const userLevel = getUserHierarchy()
  const superiors = []
  const subordinates = []

  useEffect(() => {
    if (hasPermission('users', 'read')) {
      loadData()
    }
  }, [hasPermission])

  const loadData = async () => {
    setLoading(true)
    try {
      const enterpriseUsers = await getEnterpriseUsers()
      setUsers(enterpriseUsers)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificación de permisos eliminada - acceso directo

  const maxLevel = Math.max(...Object.values(HIERARCHY_LEVELS))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración SaaS</h1>
          <p className="text-gray-600 mt-1">
            Vista general del sistema • Usuario: {user?.name} • Nivel: {userLevel}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <Zap className="w-3 h-3 mr-1" />
            Sistema Activo
          </Badge>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Usuarios"
          value={DEMO_STATISTICS.totalUsers}
          icon={Users}
          color="bg-blue-500"
          trend={{ value: 12.5, isPositive: true }}
          description="Usuarios registrados"
        />
        <MetricCard
          title="Usuarios Activos"
          value={DEMO_STATISTICS.activeUsers}
          icon={UserCheck}
          color="bg-green-500"
          description={`${Math.round((DEMO_STATISTICS.activeUsers / DEMO_STATISTICS.totalUsers) * 100)}% del total`}
        />
        <MetricCard
          title="Total Pacientes"
          value={DEMO_STATISTICS.totalPatients}
          icon={Users}
          color="bg-purple-500"
          trend={{ value: 8.2, isPositive: true }}
          description="Pacientes en el sistema"
        />
        <MetricCard
          title="Exámenes Realizados"
          value={DEMO_STATISTICS.totalExaminations}
          icon={FileText}
          color="bg-orange-500"
          description="Este mes"
        />
      </div>

      {/* Jerarquía de usuarios */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Crown className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">Jerarquía de Usuarios</h2>
          <Badge variant="outline">Nivel {userLevel}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(HIERARCHY_STATS).map(([hierarchy, stats]) => (
            <HierarchyLevelCard
              key={hierarchy}
              hierarchy={hierarchy as UserHierarchy}
              stats={stats}
              level={HIERARCHY_LEVELS[hierarchy as UserHierarchy]}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la empresa */}
        {/* {enterprise && <EnterpriseInfo enterprise={enterprise} />} */}

        {/* Estado de seguridad */}
        <SecurityStatus />

        {/* Actividad reciente */}
        <UserActivity />
      </div>

      {/* Resumen por niveles de jerarquía */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Distribución por Jerarquía</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(HIERARCHY_LEVELS).map(([hierarchy, level]) => {
            const count = users.filter(u => u.hierarchy === hierarchy).length
            const percentage = users.length > 0 ? (count / users.length) * 100 : 0

            return (
              <div key={hierarchy} className="text-center p-4 border rounded-lg">
                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${getGradientForLevel(level, maxLevel)} flex items-center justify-center mb-3`}>
                  {React.createElement(HIERARCHY_STATS[hierarchy as UserHierarchy]?.icon || Users, {
                    className: "w-6 h-6 text-white"
                  })}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {HIERARCHY_STATS[hierarchy as UserHierarchy]?.label || hierarchy}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Panel de acciones rápidas */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasPermission('users', 'create') && (
            <Button className="flex items-center space-x-2 h-auto p-4">
              <UserCheck className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Nuevo Usuario</div>
                <div className="text-sm opacity-75">Crear usuario del sistema</div>
              </div>
            </Button>
          )}

          {hasPermission('users', 'read') && (
            <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
              <Users className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Gestionar Usuarios</div>
                <div className="text-sm opacity-75">Administrar jerarquías</div>
              </div>
            </Button>
          )}

          {canViewAuditLogs && (
            <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
              <Shield className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Ver Auditoría</div>
                <div className="text-sm opacity-75">Logs de seguridad</div>
              </div>
            </Button>
          )}

          <Button variant="outline" className="flex items-center space-x-2 h-auto p-4">
            <Settings className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Configuración</div>
              <div className="text-sm opacity-75">Ajustes del sistema</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  )
}
