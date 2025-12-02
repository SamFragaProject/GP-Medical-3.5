// Home Empresarial - Página profesional para empresas
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Activity,
  Zap,
  Target,
  Globe,
  BarChart3,
  UserCheck,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HomeEmpresarial() {
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  const serviciosEmpresariales = [
    {
      id: 'certificaciones',
      titulo: 'Certificaciones Médicas',
      descripcion: 'Certificaciones NOM-006-STPS y NOM-017-STPS para cumplimiento normativo',
      icon: Award,
      beneficios: ['Cumplimiento legal', 'Certificados oficiales', 'Actualizaciones automáticas'],
      precio: 'Desde $2,500/año'
    },
    {
      id: 'medicina_trabajo',
      titulo: 'Medicina del Trabajo',
      descripcion: 'Servicios médicos especializados para empresas y empleados',
      icon: UserCheck,
      beneficios: ['Exámenes periódicos', 'Vigilancia epidemiológica', 'Reportes ejecutivos'],
      precio: 'Desde $150/empleado'
    },
    {
      id: 'seguridad_salud',
      titulo: 'Seguridad e Higiene',
      descripcion: 'Gestión integral de seguridad y salud ocupacional',
      icon: Shield,
      beneficios: ['Planes de seguridad', 'Capacitaciones', 'Auditorías'],
      precio: 'Consultoría personalizada'
    },
    {
      id: 'gestión_laboral',
      titulo: 'Gestión Laboral',
      descripcion: 'Gestión médica y administrativa de la plantilla laboral',
      icon: Briefcase,
      beneficios: ['Administración centralizada', 'Reportes por empleado', 'Seguimiento médico'],
      precio: 'Desde $50/empleado/mes'
    }
  ]

  const casosExito = [
    {
      empresa: 'TechCorp Solutions',
      sector: 'Tecnología',
      empleados: 850,
      resultado: 'Reducción 40% en incidentes laborales',
      testimonio: 'MediFlow transformó nuestra gestión de salud ocupacional. Los resultados son evidentes en la reducción de incidentes y el bienestar de nuestros empleados.'
    },
    {
      empresa: 'Manufactura Norte',
      sector: 'Manufactura',
      empleados: 1200,
      resultado: '95% de cumplimiento normativo',
      testimonio: 'La plataforma nos ayudó a mantener el cumplimiento con las NOMs y mejorar significativamente nuestros indicadores de salud ocupacional.'
    },
    {
      empresa: 'Servicios Profesionales ABC',
      sector: 'Servicios',
      empleados: 320,
      resultado: '100% certificaciones vigentes',
      testimonio: 'La automatización de procesos nos ahorró tiempo y garantiza que todas nuestras certificaciones estén siempre actualizadas.'
    }
  ]

  const planesEmpresariales = [
    {
      nombre: 'Essentials',
      precio: '999',
      empleados: 'Hasta 50',
      caracteristicas: [
        'Dashboard básico',
        'Exámenes médicos',
        'Reportes estándar',
        'Soporte email',
        'Cumplimiento básico NOMs'
      ],
      popular: false
    },
    {
      nombre: 'Professional',
      precio: '1,999',
      empleados: 'Hasta 200',
      caracteristicas: [
        'Dashboard completo',
        'Exámenes especializados',
        'Reportes avanzados',
        'Soporte prioritario',
        'Certificaciones completas',
        'API integrada'
      ],
      popular: true
    },
    {
      nombre: 'Enterprise',
      precio: 'Personalizado',
      empleados: 'Sin límite',
      caracteristicas: [
        'Todo de Professional',
        'Personalización total',
        'Soporte 24/7',
        'Consultoría dedicada',
        'Implementación incluida',
        'Integración con ERP'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-emerald-500/20 text-emerald-100 border-emerald-400">
                <Building className="h-4 w-4 mr-2" />
                Solución Empresarial
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Transformamos la
                <span className="block text-emerald-300">Salud Ocupacional</span>
                en tu Empresa
              </h1>
              <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Plataforma integral de gestión médica empresarial con cumplimiento normativo automático,
                certificaciones oficiales y reportes ejecutivos para empresas de todos los tamaños.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Solicitar Demo Empresarial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Ver Caso de Éxito
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">500+</div>
                <div className="text-emerald-100">Empresas Confían</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">98%</div>
                <div className="text-emerald-100">Cumplimiento Normativo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">24/7</div>
                <div className="text-emerald-100">Soporte Dedicado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">5★</div>
                <div className="text-emerald-100">Satisfacción Cliente</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Servicios Empresariales */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Especializados para Empresas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluciones integrales que aseguran el cumplimiento normativo y el bienestar de tus empleados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviciosEmpresariales.map((servicio) => {
              const IconComponent = servicio.icon
              return (
                <motion.div
                  key={servicio.id}
                  onHoverStart={() => setHoveredService(servicio.id)}
                  onHoverEnd={() => setHoveredService(null)}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg transition-colors ${
                          hoveredService === servicio.id ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-8 w-8 transition-colors ${
                            hoveredService === servicio.id ? 'text-emerald-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{servicio.titulo}</CardTitle>
                          <p className="text-gray-600">{servicio.descripcion}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {servicio.beneficios.map((beneficio, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-emerald-600">
                              {servicio.precio}
                            </span>
                            <Button variant="outline" size="sm">
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Más Info
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Casos de Éxito */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Casos de Éxito Empresariales
            </h2>
            <p className="text-xl text-gray-600">
              Descubre cómo hemos ayudado a empresas como la tuya
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {casosExito.map((caso, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{caso.sector}</Badge>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{caso.empresa}</CardTitle>
                    <p className="text-gray-600">{caso.empleados} empleados</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">
                        {caso.resultado}
                      </div>
                    </div>
                    <blockquote className="text-gray-700 italic">
                      "{caso.testimonio}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Planes Empresariales */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes Empresariales
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan que mejor se adapte al tamaño de tu empresa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {planesEmpresariales.map((plan, index) => (
              <Card key={index} className={`relative h-full ${
                plan.popular ? 'border-emerald-500 border-2 shadow-xl' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white px-4 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.nombre}</CardTitle>
                  <div className="text-4xl font-bold text-emerald-600 mb-1">
                    ${plan.precio}
                  </div>
                  <p className="text-gray-600">{plan.empleados} empleados</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.caracteristicas.map((caracteristica, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.precio === 'Personalizado' ? 'Contactar Ventas' : 'Comenzar Prueba'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Transformar la Salud Ocupacional en tu Empresa?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Agenda una demo personalizada y descubre cómo MediFlow puede optimizar 
            la gestión médica de tu empresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4">
              <Calendar className="h-5 w-5 mr-2" />
              Agendar Demo Gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
              <Phone className="h-5 w-5 mr-2" />
              Hablar con un Especialista
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Empresarial */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">MediFlow Enterprise</span>
              </div>
              <p className="text-gray-400">
                La plataforma líder en gestión de salud ocupacional para empresas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Medicina del Trabajo</li>
                <li>Certificaciones NOM</li>
                <li>Seguridad e Higiene</li>
                <li>Gestión Laboral</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Acerca de Nosotros</li>
                <li>Casos de Éxito</li>
                <li>Contacto</li>
                <li> Soporte</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+52 55 1234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>empresas@mediflow.mx</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Ciudad de México</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MediFlow Enterprise. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}