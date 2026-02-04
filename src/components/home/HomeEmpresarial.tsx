// Home Empresarial - Página profesional para empresas - Rediseñada Estética CUDA/Dark
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
  Briefcase,
  Terminal,
  ShieldCheck,
  Network
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HomeNavbar } from './HomeNavbar'
import { HomeFooter } from './HomeFooter'

export function HomeEmpresarial() {
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  const serviciosEmpresariales = [
    {
      id: 'certificaciones',
      titulo: 'Certificaciones Médicas',
      descripcion: 'Cumplimiento NOM-006-STPS y NOM-017-STPS con validación automática.',
      icon: Award,
      beneficios: ['Validación en tiempo real', 'Certificados con QR', 'Dashboard de cumplimiento'],
      precio: 'Desde $2,499/año',
      color: 'emerald'
    },
    {
      id: 'medicina_trabajo',
      titulo: 'Medicina del Trabajo',
      descripcion: 'Vigilancia epidemiológica avanzada para capital humano',
      icon: UserCheck,
      beneficios: ['Exámenes automatizados', 'Predicción de riesgos IA', 'Reportes de salud 360'],
      precio: 'Desde $149/empleado',
      color: 'cyan'
    },
    {
      id: 'seguridad_salud',
      titulo: 'Seguridad e Higiene',
      descripcion: 'Infraestructura de prevención y respuesta operativa',
      icon: Shield,
      beneficios: ['Auditorías digitales', 'Planes de contingencia', 'Capacitación remota'],
      precio: 'Consultoría personalizada',
      color: 'blue'
    },
    {
      id: 'gestión_laboral',
      titulo: 'Gestión Laboral',
      descripcion: 'Control administrativo centralizado de activos humanos',
      icon: Briefcase,
      beneficios: ['Admin Centralizada', 'Trazabilidad total', 'Integración ERP'],
      precio: 'Desde $49/empleado/mes',
      color: 'indigo'
    }
  ]

  const casosExito = [
    {
      empresa: 'TechCorp Solutions',
      sector: 'Tecnología',
      empleados: '850+ NODOS',
      resultado: '-40% Riesgos',
      testimonio: 'GPMedical transformó nuestra gestión de salud ocupacional. Los resultados son evidentes en la reducción de incidentes.'
    },
    {
      empresa: 'Manufactura Norte',
      sector: 'Industrial',
      empleados: '1.2k NODOS',
      resultado: '95% Compliance',
      testimonio: 'La plataforma nos ayudó a mantener el cumplimiento con las NOMs y mejorar significativamente nuestros indicadores.'
    },
    {
      empresa: 'Servicios Profesionales ABC',
      sector: 'Servicios',
      empleados: '320+ NODOS',
      resultado: '100% Certificados',
      testimonio: 'La automatización de procesos nos ahorró tiempo y garantiza que todas nuestras certificaciones estén vigentes.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30">
      <HomeNavbar />

      {/* Background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 font-black text-[10px] uppercase tracking-widest text-emerald-400">
                <Building className="h-3 w-3" />
                Enterprise Solutions v4.0
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase leading-[0.9]">
                Salud <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Ocupacional</span>
                <br />
                <span className="text-4xl md:text-6xl">Para Empresas de Alto Nivel</span>
              </h1>
              <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Infraestructura médica empresarial escalable. Cumplimiento normativo mediante
                algoritmos de validación automática y reportes de inteligencia en tiempo real.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400 px-10 py-7 text-lg font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] group">
                <Calendar className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                Desplegar Demo
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-10 py-7 text-lg font-black uppercase tracking-widest rounded-2xl backdrop-blur-xl">
                <FileText className="h-5 w-5 mr-3" />
                Whitepaper
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-12"
            >
              {[
                { label: 'EMPRESAS', value: '500+', sub: 'GLOBALES' },
                { label: 'COMPLIANCE', value: '98%', sub: 'REAL-TIME' },
                { label: 'NODOS', value: '1.2M', sub: 'ACTIVOS' },
                { label: 'SEGURIDAD', value: 'E2EE', sub: 'GRADED' },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tighter italic">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
                  <div className="text-[8px] font-medium text-emerald-500/50 uppercase tracking-[0.2em]">{stat.sub}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Servicios Empresariales Grid */}
      <div className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
              Protocolos de <span className="text-emerald-500">Servicio Especializado</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
              Integración modular de servicios médicos para el blindaje normativo de su operación.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviciosEmpresariales.map((servicio) => {
              const IconComponent = servicio.icon
              return (
                <motion.div
                  key={servicio.id}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <Card className="relative h-full bg-[#030a1c] border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <CardHeader className="p-8 md:p-12">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4">
                          <div className="p-4 bg-emerald-500/10 rounded-2xl inline-block border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                            <IconComponent className="h-10 w-10 text-emerald-400" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">{servicio.titulo}</CardTitle>
                            <p className="text-slate-400 mt-2 font-light">{servicio.descripcion}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[10px] py-1 px-3 uppercase tracking-widest">{servicio.precio}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 md:px-12 pb-12">
                      <div className="space-y-4">
                        {servicio.beneficios.map((beneficio, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-sm text-slate-300 uppercase tracking-wider font-medium">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-12">
                        <Button variant="ghost" className="p-0 text-emerald-400 hover:text-emerald-300 font-black uppercase text-[10px] tracking-widest">
                          INICIALIZAR MÓDULO <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Testimonials / Casos Éxito Section */}
      <div className="py-32 relative">
        <div className="absolute inset-0 bg-emerald-500/5 -skew-y-3 transform origin-right"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
              Telemetry <span className="text-emerald-500">Success Stories</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {casosExito.map((caso, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <Card className="h-full bg-white/5 border-white/5 hover:border-emerald-500/30 transition-all duration-500 rounded-[2rem] p-8 backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-xl font-black text-white italic">{caso.empresa}</h4>
                      <Badge variant="outline" className="mt-1 border-white/10 text-slate-500 font-black text-[8px] uppercase tracking-widest">{caso.sector}</Badge>
                    </div>
                    <div className="flex gap-1 text-emerald-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                  </div>

                  <div className="mb-8 border-l-2 border-emerald-500/30 pl-6 py-2">
                    <p className="text-slate-400 italic font-light leading-relaxed">"{caso.testimonio}"</p>
                  </div>

                  <div className="flex items-center gap-6 mt-auto">
                    <div>
                      <div className="text-2xl font-black text-emerald-400 tracking-tighter">{caso.resultado}</div>
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IMPACTO REAL</div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div>
                      <div className="text-sm font-black text-white italic">{caso.empleados}</div>
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NODOS GESTIONADOS</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="relative py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-16 rounded-[4rem] bg-gradient-to-br from-emerald-600 to-teal-900 shadow-2xl relative overflow-hidden"
          >
            {/* Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 italic tracking-tighter uppercase leading-[0.9]">
              ¿LISTO PARA ESCALAR TU <br />
              <span className="text-black/50">INFRAESTRUCTURA MÉDICA?</span>
            </h2>
            <p className="text-xl text-emerald-100/80 mb-12 max-w-2xl mx-auto font-light">
              Agenda una sesión estratégica con nuestros arquitectos clínicos y descubre el poder del compliance automatizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 px-10 py-7 font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl">
                Agendar Demo Enterprise
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-10 py-7 font-black uppercase text-sm tracking-widest rounded-2xl">
                Consultar Protocolo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}
