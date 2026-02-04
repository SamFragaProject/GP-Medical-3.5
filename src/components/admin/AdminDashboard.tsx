// Componente de dashboard administrativo para Super Admin
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Settings,
  BarChart3,
  TrendingUp,
  Lock,
  Unlock,
  UserCheck,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'


interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalEnterprises: number
  activeEnterprises: number
  totalSessions: number
  failedLogins24h: number
  permissionChecks24h: number
  unauthorizedAttempts24h: number
}

interface PermissionDistribution {
  hierarchy: string
  count: number
  percentage: number
}

export function AdminDashboard() {
  const currentUser = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  }
  const canAccess = true
  const auditLogs = []
  const auditLoading = false

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalEnterprises: 0,
    activeEnterprises: 0,
    totalSessions: 0,
    failedLogins24h: 0,
    permissionChecks24h: 0,
    unauthorizedAttempts24h: 0
  })

  const [permissionDistribution, setPermissionDistribution] = useState<PermissionDistribution[]>([])
  const [loading, setLoading] = useState(true)

  // Verificación de permisos eliminada - acceso directo

  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = async () => {
    try {
      setLoading(true)
      // Simular datos (en implementación real vendrían de la API)
      const stats: SystemStats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalEnterprises: 45,
        activeEnterprises: 42,
        totalSessions: 234,
        failedLogins24h: 12,
        permissionChecks24h: 15634,
        unauthorizedAttempts24h: 23
      }
      setSystemStats(stats)

      // Distribución de permisos por jerarquía
      const distribution: PermissionDistribution[] = [
        { hierarchy: 'super_admin', count: 3, percentage: 0.2 },
        { hierarchy: 'admin_empresa', count: 45, percentage: 3.6 },
        { hierarchy: 'medico_trabajo', count: 234, percentage: 18.8 },
        { hierarchy: 'medico_especialista', count: 156, percentage: 12.5 },
        { hierarchy: 'medico_industrial', count: 89, percentage: 7.1 },
        { hierarchy: 'recepcion', count: 134, percentage: 10.7 },
        { hierarchy: 'paciente', count: 586, percentage: 47.0 }
      ]
      setPermissionDistribution(distribution)
    } catch (error) {
      console.error('Error cargando estadísticas del sistema:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSecurityScore = (): number => {
    const unauthorizedRate = (systemStats.unauthorizedAttempts24h / systemStats.permissionChecks24h) * 100
    const failedLoginRate = (systemStats.failedLogins24h / systemStats.activeUsers) * 100
    
    let score = 100
    score -= unauthorizedRate * 2 // Penalizar intentos no autorizados
    score -= failedLoginRate * 1 // Penalizar intentos de login fallidos
    
    return Math.max(0, Math.min(100, score))
  }

  const securityScore = calculateSecurityScore()

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">Monitoreo y control del sistema GPMedical</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={loadSystemStats} disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Score de Seguridad */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Puntuación de Seguridad</span>
              </CardTitle>
              <CardDescription>
                Indicador general de la seguridad del sistema
              </CardDescription>
            </div>
            <Badge variant={getScoreBadgeVariant(securityScore)} className="text-lg px-3 py-1">
              {securityScore.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={securityScore} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{systemStats.unauthorizedAttempts24h}</p>
                <p className="text-gray-600">Intentos No Autorizados (24h)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{systemStats.failedLogins24h}</p>
                <p className="text-gray-600">Logins Fallidos (24h)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{systemStats.permissionChecks24h}</p>
                <p className="text-gray-600">Verificaciones de Permisos (24h)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{systemStats.totalSessions}</p>
                <p className="text-gray-600">Sesiones Activas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.activeUsers} activos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalEnterprises}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.activeEnterprises} activas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permisos Verificados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(systemStats.permissionChecks24h / 1000).toFixed(1)}k</div>
              <p className="text-xs text-muted-foreground">
                En las últimas 24 horas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intentos Bloqueados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{systemStats.unauthorizedAttempts24h}</div>
              <p className="text-xs text-muted-foreground">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detalles en tabs */}
      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Distribución de Permisos</TabsTrigger>
          <TabsTrigger value="audit">Auditoría Reciente</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones Activas</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Usuarios por Jerarquía</CardTitle>
              <CardDescription>
                Distribución actual de roles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissionDistribution.map((item, index) => (
                  <div key={item.hierarchy} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">
                      {item.hierarchy.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                    <div className="w-20 text-sm text-right">
                      {item.count} ({item.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente de Auditoría</CardTitle>
              <CardDescription>
                Últimas acciones registradas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando logs...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        log.success ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-600">
                          {log.resourceType && `${log.resourceType}:${log.actionType} • `}
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Activas del Sistema</CardTitle>
              <CardDescription>
                Monitoreo en tiempo real de sesiones de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Información de sesiones en desarrollo</p>
                <p className="text-sm">Se implementará con WebSocket/Realtime</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AdminDashboardWrapper() {
  return <AdminDashboard />
}
