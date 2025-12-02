// Componente para acceso limitado de pacientes
import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  FileText, 
  Shield, 
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Heart
} from 'lucide-react'
import { useSaaSAuth } from '@/contexts/SaaSAuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function PatientLimitedAccess() {
  const { user } = useSaaSAuth()

  const patientFeatures = [
    {
      icon: Calendar,
      title: 'Mis Citas',
      description: 'Ver tus citas programadas y solicitar nuevas',
      available: true,
      action: 'Ver Citas'
    },
    {
      icon: FileText,
      title: 'Mi Historial',
      description: 'Acceder a tus resultados médicos y certificados',
      available: true,
      action: 'Ver Historial'
    },
    {
      icon: Shield,
      title: 'Mis Certificados',
      description: 'Descargar certificados de aptitud médica',
      available: true,
      action: 'Ver Certificados'
    },
    {
      icon: Clock,
      title: 'Recordatorios',
      description: 'Recibir notificaciones de citas y exámenes',
      available: true,
      action: 'Configurar'
    }
  ]

  const restrictedFeatures = [
    {
      icon: User,
      title: 'Gestión de Pacientes',
      reason: 'Solo personal médico autorizado'
    },
    {
      icon: FileText,
      title: 'Exámenes Ocupacionales',
      reason: 'Solo médicos pueden crear/editar exámenes'
    },
    {
      icon: Shield,
      title: 'Sistema de Facturación',
      reason: 'Solo administradores pueden gestionar facturación'
    },
    {
      icon: Calendar,
      title: 'Configuración del Sistema',
      reason: 'Solo administradores del sistema'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-primary/10 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido, {user?.name}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Portal del Paciente - Medicina del Trabajo
          </p>
          
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Acceso Limitado por Seguridad</strong><br />
              Como paciente, tienes acceso únicamente a tu información personal médica. 
              Las funciones administrativas y de gestión están restringidas al personal autorizado.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Funcionalidades disponibles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Tus Funcionalidades Disponibles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {patientFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <feature.icon className="h-8 w-8 text-primary" />
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // Aquí se implementarían las navegaciones específicas
                        alert(`${feature.action} - En desarrollo`)
                      }}
                    >
                      {feature.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Funcionalidades restringidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Funcionalidades Administrativas (Restringidas)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restrictedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="opacity-60 border-l-4 border-l-gray-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <feature.icon className="h-8 w-8 text-gray-400" />
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <CardTitle className="text-lg text-gray-600">{feature.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {feature.reason}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      disabled
                      className="w-full bg-gray-200 text-gray-500 cursor-not-allowed"
                    >
                      Acceso Restringido
                      <Shield className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Heart className="mr-2 h-5 w-5 text-primary" />
                ¿Necesitas Ayuda?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Si necesitas acceder a alguna funcionalidad administrativa o tienes preguntas sobre tus datos médicos, 
                contacta a tu médico tratante o al administrador del sistema.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  Contactar Soporte
                </Button>
                <Button variant="outline">
                  Preguntas Frecuentes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}