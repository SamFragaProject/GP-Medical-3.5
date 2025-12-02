// Componente para testing de integración del sistema de permisos
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  User, 
  Building, 
  MapPin, 
  Eye, 
  Settings,
  RefreshCw,
  Download,
  Upload,
  Database,
  Clock,
  Activity,
  Brain,
  TestTube
} from 'lucide-react'
import { useSaaSAuth, useSaaSPermissions } from '@/contexts/SaaSAuthContext'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { NavigationGuard, ROUTE_PERMISSIONS } from '@/components/auth/NavigationGuard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import toast from 'react-hot-toast'

interface PermissionTest {
  id: string
  name: string
  resource: string
  action: string
  expected: boolean
  description: string
}

interface RoleTest {
  role: string
  description: string
  expectedPermissions: string[]
}

export function PermissionIntegrationTester() {
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; details?: string }>>({})
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [summary, setSummary] = useState({ passed: 0, total: 0 })

  const { user, hasRole } = useSaaSAuth()
  const { currentUser, empresaInfo, sedeInfo } = useCurrentUser()
  const { canAccess, getUserPermissions, invalidatePermissionsCache } = usePermissionCheck()
  const { getUserHierarchy } = useSaaSPermissions()

  // Tests de permisos básicos
  const permissionTests: PermissionTest[] = [
    {
      id: 'dashboard_view',
      name: 'Acceso al Dashboard',
      resource: 'dashboard',
      action: 'view',
      expected: true,
      description: 'Verificación básica de acceso al panel principal'
    },
    {
      id: 'patients_manage',
      name: 'Gestión de Pacientes',
      resource: 'patients',
      action: 'manage',
      expected: hasRole('admin_empresa') || hasRole('medico_trabajo'),
      description: 'Permisos para gestionar pacientes'
    },
    {
      id: 'exams_view',
      name: 'Visualización de Exámenes',
      resource: 'exams',
      action: 'view',
      expected: hasRole('admin_empresa') || hasRole('medico_trabajo') || hasRole('medico_especialista'),
      description: 'Ver exámenes ocupacionales'
    },
    {
      id: 'billing_manage',
      name: 'Gestión de Facturación',
      resource: 'billing',
      action: 'manage',
      expected: hasRole('admin_empresa') || hasRole('recepcion'),
      description: 'Administrar facturación y cobros'
    },
    {
      id: 'system_admin',
      name: 'Administración del Sistema',
      resource: 'system',
      action: 'admin',
      expected: hasRole('super_admin') || hasRole('admin_empresa'),
      description: 'Acceso a configuración del sistema'
    }
  ]

  // Tests de roles
  const roleTests: RoleTest[] = [
    {
      role: 'super_admin',
      description: 'Administrador supremo del sistema',
      expectedPermissions: ['*']
    },
    {
      role: 'admin_empresa',
      description: 'Administrador de empresa',
      expectedPermissions: ['dashboard_view', 'patients_view', 'patients_manage', 'system_admin']
    },
    {
      role: 'medico_trabajo',
      description: 'Médico del trabajo',
      expectedPermissions: ['dashboard_view', 'patients_view', 'medical_view', 'exams_view']
    }
  ]

  // Ejecutar un test específico
  const runTest = async (test: PermissionTest) => {
    setCurrentTest(test.id)
    
    try {
      const result = canAccess(test.resource, test.action)
      const passed = result === test.expected
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          passed,
          details: `Esperado: ${test.expected}, Obtenido: ${result}`
        }
      }))

      toast[passed ? 'success' : 'error'](
        `${test.name}: ${passed ? 'APROBADO' : 'FALLÓ'}`
      )
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          passed: false,
          details: `Error: ${error}`
        }
      }))
      toast.error(`Error en ${test.name}`)
    } finally {
      setCurrentTest(null)
    }
  }

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setRunning(true)
    let passedCount = 0
    
    for (const test of permissionTests) {
      await runTest(test)
      const result = testResults[test.id]
      if (result?.passed) passedCount++
    }
    
    setSummary({ passed: passedCount, total: permissionTests.length })
    setRunning(false)
    
    toast.success(`Tests completados: ${passedCount}/${permissionTests.length} aprobados`)
  }

  // Tests de componentes
  const testComponentAccess = () => {
    const tests = [
      {
        id: 'permission_guard_test',
        component: (
          <PermissionGuard resource="dashboard" action="view" key="test">
            <div className="p-4 bg-green-100 rounded">Componente protegido visible</div>
          </PermissionGuard>
        )
      }
    ]

    return tests
  }

  // Exportar resultados
  const exportResults = () => {
    const results = {
      user: {
        name: currentUser?.name,
        hierarchy: currentUser?.hierarchy,
        enterpriseId: currentUser?.enterpriseId,
        sede: currentUser?.sede,
        permissions: getUserPermissions()
      },
      tests: testResults,
      timestamp: new Date().toISOString(),
      summary
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `permission-test-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Resultados exportados')
  }

  // Limpiar cache y recargar permisos
  const refreshPermissions = async () => {
    try {
      invalidatePermissionsCache()
      toast.success('Cache de permisos limpiado')
      
      // Simular recarga
      setTimeout(() => {
        toast.success('Permisos recargados')
      }, 1000)
    } catch (error) {
      toast.error('Error refrescando permisos')
    }
  }

  // Estado de carga
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header de información del usuario */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <h3 className="font-semibold">Testing de Integración - Sistema de Permisos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Usuario:</span> {currentUser.name}
              </div>
              <div>
                <span className="font-medium">Rol:</span> 
                <Badge variant="secondary" className="ml-2">
                  {getUserHierarchy().toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Empresa:</span> {empresaInfo?.nombre || 'N/A'}
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={runAllTests} 
          disabled={running}
          className="flex items-center space-x-2"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
          <span>Ejecutar Todos los Tests</span>
        </Button>
        
        <Button 
          onClick={refreshPermissions}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refrescar Permisos</span>
        </Button>
        
        <Button 
          onClick={exportResults}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Resultados</span>
        </Button>
      </div>

      {/* Resumen */}
      {summary.total > 0 && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Resumen:</strong> {summary.passed}/{summary.total} tests aprobados
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(summary.passed / summary.total) * 100}%` }}
                />
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tests de permisos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Tests de Permisos</span>
          </h3>
          
          {permissionTests.map((test) => {
            const result = testResults[test.id]
            const isRunning = currentTest === test.id
            
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      result?.passed ? 'bg-green-100' : result?.passed === false ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {isRunning ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-gray-600" />
                      ) : result?.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : result?.passed === false ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{test.name}</h4>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {test.resource}:{test.action}
                    </Badge>
                    <Button
                      onClick={() => runTest(test)}
                      disabled={isRunning}
                      size="sm"
                      variant="outline"
                    >
                      {isRunning ? 'Ejecutando...' : 'Test'}
                    </Button>
                  </div>
                </div>
                
                {result?.details && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {result.details}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Tests de componentes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>Tests de Componentes</span>
          </h3>
          
          {/* PermissionGuard Test */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium mb-2">PermissionGuard Component</h4>
            <p className="text-sm text-gray-600 mb-3">
              Test del componente de protección por permisos
            </p>
            
            <PermissionGuard 
              resource="dashboard" 
              action="view"
              fallback={<div className="p-2 bg-red-100 text-red-700 rounded">Acceso denegado</div>}
            >
              <div className="p-2 bg-green-100 text-green-700 rounded">
                ✓ Componente renderizado correctamente
              </div>
            </PermissionGuard>
          </div>

          {/* NavigationGuard Test */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium mb-2">NavigationGuard Component</h4>
            <p className="text-sm text-gray-600 mb-3">
              Test del protector de rutas
            </p>
            
            <div className="p-2 bg-blue-50 rounded">
              <p className="text-sm">
                <strong>Rutas configuradas:</strong> {ROUTE_PERMISSIONS.length}
              </p>
              <ul className="mt-2 text-xs space-y-1">
                {ROUTE_PERMISSIONS.slice(0, 5).map((route, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{route.path}</span>
                    <Badge variant="outline" className="text-xs">
                      {route.resource}:{route.action}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Información de debug */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2 flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span>Información de Debug</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">Permisos del Usuario:</h5>
            <div className="flex flex-wrap gap-1">
              {getUserPermissions().length > 0 ? (
                getUserPermissions().map((perm, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-xs">No hay permisos cargados</span>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Jerarquía:</h5>
            <Badge variant="default">
              {getUserHierarchy()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}