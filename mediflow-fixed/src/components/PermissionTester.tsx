// Componente de pruebas para verificar el sistema de permisos
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  User, 
  CheckCircle, 
  XCircle,
  Eye,
  Settings,
  Users,
  Calendar,
  FileText,
  Activity,
  Brain,
  Award,
  Package,
  CreditCard,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { useSaaSAuth } from '@/contexts/SaaSAuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PermissionTest {
  name: string
  path: string
  roles: string[]
  permissions: string[]
  expected: 'allow' | 'deny'
  description: string
}

export function PermissionTester() {
  const { user } = useSaaSAuth()
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})

  // Función para verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.hierarchy) return false
    return roles.includes(user.hierarchy)
  }

  const permissionTests: PermissionTest[] = [
    {
      name: 'Dashboard Principal',
      path: '/dashboard',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial', 'recepcion', 'paciente'],
      permissions: [],
      expected: 'allow',
      description: 'Acceso básico al panel principal'
    },
    {
      name: 'Gestión de Pacientes',
      path: '/pacientes',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial', 'recepcion'],
      permissions: ['manage_patients'],
      expected: 'allow',
      description: 'Registro y gestión de empleados/pacientes'
    },
    {
      name: 'Agenda y Citas',
      path: '/agenda',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial', 'recepcion'],
      permissions: [],
      expected: 'allow',
      description: 'Programación de citas médicas'
    },
    {
      name: 'Exámenes Ocupacionales',
      path: '/examenes',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial'],
      permissions: ['manage_exams'],
      expected: 'allow',
      description: 'Creación y gestión de exámenes médicos'
    },
    {
      name: 'Rayos X',
      path: '/rayos-x',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial'],
      permissions: ['view_medical_history', 'manage_exams'],
      expected: 'allow',
      description: 'Análisis de imágenes médicas por IA'
    },
    {
      name: 'Evaluaciones de Riesgo',
      path: '/evaluaciones',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial'],
      permissions: ['manage_exams'],
      expected: 'allow',
      description: 'Evaluaciones ergonómicas y de riesgo'
    },
    {
      name: 'IA Médica',
      path: '/ia',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial'],
      permissions: ['view_medical_history'],
      expected: 'allow',
      description: 'Asistente de IA para análisis médico'
    },
    {
      name: 'Certificaciones Médicas',
      path: '/certificaciones',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial'],
      permissions: ['manage_exams'],
      expected: 'allow',
      description: 'Generación de certificados de aptitud'
    },
    {
      name: 'Inventario Médico',
      path: '/inventario',
      roles: ['admin_empresa'],
      permissions: ['system_admin'],
      expected: 'allow',
      description: 'Control de inventario médico'
    },
    {
      name: 'Facturación y Seguros',
      path: '/facturacion',
      roles: ['admin_empresa', 'recepcion'],
      permissions: ['manage_billing'],
      expected: 'allow',
      description: 'Gestión de facturación y seguros'
    },
    {
      name: 'Reportes y Analytics',
      path: '/reportes',
      roles: ['admin_empresa', 'medico_trabajo', 'medico_industrial'],
      permissions: ['view_reports'],
      expected: 'allow',
      description: 'Reportes y análisis avanzados'
    },
    {
      name: 'Configuración del Sistema',
      path: '/configuracion',
      roles: ['admin_empresa'],
      permissions: ['system_admin'],
      expected: 'allow',
      description: 'Configuración administrativa del sistema'
    }
  ]

  const patientTests: PermissionTest[] = [
    {
      name: 'Portal del Paciente',
      path: '/paciente',
      roles: ['paciente'],
      permissions: [],
      expected: 'allow',
      description: 'Vista limitada para pacientes'
    },
    {
      name: 'Gestión de Pacientes (Paciente)',
      path: '/pacientes',
      roles: ['paciente'],
      permissions: [],
      expected: 'deny',
      description: 'Los pacientes no pueden gestionar otros pacientes'
    },
    {
      name: 'Exámenes Ocupacionales (Paciente)',
      path: '/examenes',
      roles: ['paciente'],
      permissions: [],
      expected: 'deny',
      description: 'Los pacientes no pueden crear/editar exámenes'
    }
  ]

  const tests = user?.hierarchy === 'paciente' ? patientTests : permissionTests

  const runPermissionTest = (test: PermissionTest): boolean => {
    if (!user) return false

    // Verificar roles
    const hasRequiredRole = test.roles.length === 0 || hasAnyRole(test.roles)
    
    // Verificar permisos específicos si están definidos
    let hasRequiredPermissions = true
    if (test.permissions.length > 0) {
      hasRequiredPermissions = test.permissions.some(permission => {
        switch (permission) {
          case 'manage_patients':
            return hasAnyRole(['medico_trabajo', 'medico_industrial', 'recepcion', 'admin_empresa'])
          case 'view_medical_history':
            return hasAnyRole(['medico_trabajo', 'medico_industrial', 'audiometrista', 'psicologo_laboral'])
          case 'manage_exams':
            return hasAnyRole(['medico_trabajo', 'medico_industrial', 'admin_empresa'])
          case 'manage_billing':
            return hasAnyRole(['admin_empresa', 'recepcion'])
          case 'view_reports':
            return hasAnyRole(['admin_empresa', 'medico_trabajo', 'medico_industrial'])
          case 'system_admin':
            return hasAnyRole(['admin_empresa', 'super_admin'])
          default:
            return false
        }
      })
    }

    const hasAccess = hasRequiredRole && hasRequiredPermissions
    return test.expected === 'allow' ? hasAccess : !hasAccess
  }

  const runAllTests = () => {
    const results: {[key: string]: boolean} = {}
    tests.forEach(test => {
      results[test.name] = runPermissionTest(test)
    })
    setTestResults(results)
  }

  const getTestResultIcon = (testName: string) => {
    const result = testResults[testName]
    if (result === undefined) return null
    return result ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getTestResultBadge = (testName: string) => {
    const result = testResults[testName]
    if (result === undefined) return null
    return result ? (
      <Badge className="bg-green-100 text-green-800">APROBADO</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">FALLÓ</Badge>
    )
  }

  const passedTests = Object.values(testResults).filter(Boolean).length
  const totalTests = Object.keys(testResults).length
  const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-primary/10 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Probador de Permisos por Rol
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Verificación completa del sistema de permisos para el rol: <strong>{user?.hierarchy}</strong>
          </p>
          
          <Alert className="max-w-2xl mx-auto mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Usuario de Prueba:</strong> {user?.name} ({user?.email})<br />
              <strong>Rol:</strong> {user?.hierarchy} | <strong>Empresa:</strong> {user?.enterpriseId} | <strong>Sede:</strong> {user?.sede}
            </AlertDescription>
          </Alert>

          <Button 
            onClick={runAllTests}
            className="bg-primary hover:bg-primary/90 px-8 py-3"
            size="lg"
          >
            <Shield className="mr-2 h-5 w-5" />
            Ejecutar Todas las Pruebas
          </Button>
        </motion.div>

        {/* Resultados */}
        {totalTests > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Resumen de Pruebas</CardTitle>
                <CardDescription>
                  Pruebas ejecutadas: {totalTests} | Aprobadas: {passedTests} | Fallidas: {totalTests - passedTests}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{successRate}%</div>
                <div className="text-sm text-gray-600 mb-4">Tasa de éxito</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${parseFloat(successRate) >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lista de pruebas */}
        <div className="grid gap-6">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTestResultIcon(test.name)}
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          {test.name}
                          {getTestResultBadge(test.name)}
                        </h3>
                        <p className="text-gray-600 text-sm">{test.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Ruta: {test.path}</span>
                          <span>Roles: {test.roles.join(', ')}</span>
                          {test.permissions.length > 0 && (
                            <span>Permisos: {test.permissions.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Resultado Esperado:</div>
                      <Badge variant={test.expected === 'allow' ? 'default' : 'destructive'}>
                        {test.expected === 'allow' ? 'PERMITIR' : 'DENEGAR'}
                      </Badge>
                    </div>
                  </div>
                  
                  {testResults[test.name] !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Resultado Obtenido:</span>
                        <span className={`font-medium ${testResults[test.name] ? 'text-green-600' : 'text-red-600'}`}>
                          {testResults[test.name] ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Información del Sistema de Permisos</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Roles Implementados:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Admin Empresa:</strong> Acceso completo al sistema</div>
                  <div><strong>Médico Trabajo:</strong> Gestión médica y exámenes</div>
                  <div><strong>Médico Industrial:</strong> Evaluaciones y análisis</div>
                  <div><strong>Recepción:</strong> Agenda y facturación básica</div>
                  <div><strong>Paciente:</strong> Vista limitada solo a sus datos</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Permisos Específicos:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div><strong>manage_patients:</strong> Registro y gestión de pacientes</div>
                  <div><strong>view_medical_history:</strong> Acceso a historiales médicos</div>
                  <div><strong>manage_exams:</strong> Creación y edición de exámenes</div>
                  <div><strong>manage_billing:</strong> Gestión de facturación</div>
                  <div><strong>view_reports:</strong> Acceso a reportes y analytics</div>
                  <div><strong>system_admin:</strong> Configuración del sistema</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}