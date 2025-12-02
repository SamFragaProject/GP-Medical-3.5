// Home Funnel - MediFlow ERP Médico
// Modern Minimalism Premium Design
import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  CheckCircle, 
  Heart, 
  Users, 
  Stethoscope, 
  Brain, 
  Package, 
  Calendar, 
  BarChart3,
  Star,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomeFunnel() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 100])

  // Scroll animations
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    const element = document.getElementById('hero-section')
    if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">MediFlow</h1>
                <p className="text-xs text-neutral-500">by GP Medical Health</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                Características
              </a>
              <a href="#testimonials" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                Testimonios
              </a>
              <a href="#pricing" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                Precios
              </a>
              <Link 
                to="/login"
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 font-semibold transition-all duration-250 hover:transform hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                Solicitar Demo
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-neutral-200"
          >
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-neutral-700 hover:text-primary-500 font-medium">
                Características
              </a>
              <a href="#testimonials" className="block text-neutral-700 hover:text-primary-500 font-medium">
                Testimonios
              </a>
              <a href="#pricing" className="block text-neutral-700 hover:text-primary-500 font-medium">
                Precios
              </a>
              <Link 
                to="/login"
                className="block bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 font-semibold text-center transition-colors"
              >
                Solicitar Demo
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        id="hero-section"
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/professional_diverse_medical_team_masks_hospital_hero.jpg)',
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-black/40"
          style={{ y }}
        />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                <span className="block">MediFlow</span>
                <span className="block text-primary-500">ERP Médico</span>
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-100 max-w-2xl mx-auto leading-relaxed">
                Sistema integral de medicina ocupacional con IA predictiva, 
                gestión automatizada y cumplimiento normativo para empresas modernas
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login"
                className="bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 font-semibold text-lg transition-all duration-250 hover:transform hover:-translate-y-1 hover:shadow-card-hover inline-flex items-center justify-center"
              >
                Solicitar Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a 
                href="#features"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg hover:bg-white/20 font-semibold text-lg transition-all duration-250 border border-white/20"
              >
                Conocer Más
              </a>
            </div>

            <div className="pt-8">
              <p className="text-neutral-200 text-sm">
                ✓ Sin compromiso • ✓ Implementación en 48hrs • ✓ Soporte 24/7
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-bg-page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
                Características Principales
              </h2>
              <p className="text-xl text-neutral-700 max-w-3xl mx-auto">
                Soluciones completas para la gestión moderna de medicina ocupacional
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-card-hover hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <img 
                  src="/images/doctor_patient_consultation_healthcare_management.jpg"
                  alt="Gestión de Pacientes"
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
                <div className="bg-primary-100 p-3 rounded-lg w-fit">
                  <Users className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Gestión de Pacientes y Empleados
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                Registro completo de empleados con historial médico laboral, 
                documentos digitalizados y alertas de seguimiento automático.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-card-hover hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <img 
                  src="/images/medical-xray-radiology-equipment-diagnosis-doctor-patient.jpg"
                  alt="Análisis IA"
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
                <div className="bg-primary-100 p-3 rounded-lg w-fit">
                  <Brain className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Análisis de Rayos X con IA
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                Inteligencia artificial avanzada para análisis automático de estudios 
                radiológicos con precisión diagnóstica superior al 95%.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-card-hover hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <img 
                  src="/images/female_pharmacist_medical_inventory_pharmacy_supplies_storage.jpg"
                  alt="Inventario"
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
                <div className="bg-primary-100 p-3 rounded-lg w-fit">
                  <Package className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Inventario Médico Automatizado
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                Control inteligente de stock con alertas de vencimiento, 
                órdenes automáticas y trazabilidad completa de equipos médicos.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-card-hover hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <img 
                  src="/images/modern-healthcare-claim-management-dashboard.jpg"
                  alt="Exámenes"
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
                <div className="bg-primary-100 p-3 rounded-lg w-fit">
                  <Stethoscope className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Exámenes Ocupacionales
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                Protocolos personalizados según tipo de empresa, resultados digitales 
                y certificaciones automáticas con cumplimiento normativo completo.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-card-hover hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <div className="bg-primary-100 p-3 rounded-lg w-fit mb-6">
                  <Calendar className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Agenda y Citas Inteligentes
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                Calendario automatizado con recordatorios SMS/Email, 
                programación optimizada y check-in digital sin filas.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-card-hover hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <img 
                  src="/images/medical-analytics-dashboard-healthcare-statistics-kpis.jpg"
                  alt="Analytics"
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
                <div className="bg-primary-100 p-3 rounded-lg w-fit">
                  <BarChart3 className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Reportes y Analytics
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                Dashboards interactivos con KPIs personalizados, analytics predictivos 
                y exportación automática para toma de decisiones estratégicas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
                Lo que Dicen Nuestros Clientes
              </h2>
              <p className="text-xl text-neutral-700">
                Profesionales de la salud confían en MediFlow
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-8 lg:p-12 shadow-sm relative"
          >
            {/* Quote mark */}
            <div className="absolute top-8 left-8 text-primary-500 text-6xl opacity-20">"</div>
            
            <div className="text-center">
              <img 
                src="/images/professional_male_doctor_portrait_testimonial.jpg"
                alt="Dr. Carlos México"
                className="w-24 h-24 rounded-full mx-auto mb-8 border-4 border-primary-100 object-cover"
              />
              
              <blockquote className="text-2xl text-neutral-900 leading-relaxed mb-8 font-medium">
                "MediFlow revolucionó completamente nuestra gestión de medicina ocupacional. 
                La automatización de procesos y el análisis predictivo con IA nos permitió 
                reducir costos operativos en un 40% mientras mejoramos la calidad del servicio."
              </blockquote>
              
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div>
                <p className="font-semibold text-neutral-900 text-lg">Dr. Carlos México</p>
                <p className="text-neutral-700">Director Médico, Clínica San Rafael</p>
                <p className="text-neutral-500 text-sm">Hospital Privado • 500+ empleados</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-bg-page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
                Planes y Precios
              </h2>
              <p className="text-xl text-neutral-700 max-w-3xl mx-auto">
                Elige el plan perfecto para el tamaño y necesidades de tu empresa
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Básico</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-neutral-900">$99</span>
                  <span className="text-xl text-neutral-500">/mes</span>
                </div>
                <p className="text-neutral-700 mb-6">Clínicas pequeñas</p>
                <p className="text-neutral-600 text-sm">
                  Perfecto para consultas y clínicas con hasta 100 empleados
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Hasta 100 empleados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Gestión básica de pacientes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Agenda y citas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Reportes básicos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Soporte por email</span>
                </li>
              </ul>

              <Link 
                to="/login"
                className="w-full bg-transparent border-2 border-neutral-200 text-neutral-700 py-3 px-6 rounded-lg hover:border-primary-500 hover:text-primary-500 font-semibold transition-colors text-center block"
              >
                Comenzar
              </Link>
            </motion.div>

            {/* Plan Profesional - Destacado */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 shadow-lg scale-105 relative border-2 border-primary-500"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  MÁS POPULAR
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Profesional</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-neutral-900">$199</span>
                  <span className="text-xl text-neutral-500">/mes</span>
                </div>
                <p className="text-neutral-700 mb-6">Hospitales medianos</p>
                <p className="text-neutral-600 text-sm">
                  Ideal para hospitales y clínicas con 100-500 empleados
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Hasta 500 empleados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Todas las características básicas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">IA para análisis de rayos X</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Inventario automatizado</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Analytics avanzados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Soporte prioritario</span>
                </li>
              </ul>

              <Link 
                to="/login"
                className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 font-semibold transition-all duration-250 hover:transform hover:-translate-y-0.5 hover:shadow-card-hover text-center block"
              >
                Comenzar
              </Link>
            </motion.div>

            {/* Plan Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-8 shadow-sm hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-neutral-900">Contactar</span>
                  <span className="text-xl text-neutral-500"> ventas</span>
                </div>
                <p className="text-neutral-700 mb-6">Redes hospitalarias</p>
                <p className="text-neutral-600 text-sm">
                  Solución personalizada para grandes organizaciones
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Empleados ilimitados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Todas las funcionalidades</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Personalización completa</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Integración con sistemas legacy</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">Soporte 24/7 dedicado</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-neutral-700">SLA garantizado</span>
                </li>
              </ul>

              <Link 
                to="/login"
                className="w-full bg-transparent border-2 border-neutral-200 text-neutral-700 py-3 px-6 rounded-lg hover:border-primary-500 hover:text-primary-500 font-semibold transition-colors text-center block"
              >
                Contactar
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary-500 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">MediFlow</h3>
                  <p className="text-sm text-neutral-400">by GP Medical Health</p>
                </div>
              </div>
              <p className="text-neutral-300 mb-6 leading-relaxed">
                Sistema ERP especializado en medicina ocupacional con tecnología de vanguardia, 
                IA predictiva y cumplimiento normativo para empresas modernas.
              </p>
              <div className="space-y-2 text-sm text-neutral-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Ciudad de México, México</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+52 55 1234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contacto@mediflow.mx</span>
                </div>
              </div>
            </div>

            {/* Enlaces de producto */}
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-neutral-400 hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Precios</a></li>
                <li><a href="#testimonials" className="text-neutral-400 hover:text-white transition-colors">Testimonios</a></li>
                <li><Link to="/login" className="text-neutral-400 hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>

            {/* Enlaces de empresa */}
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-neutral-400 mb-4 md:mb-0">
                © 2025 MediFlow by GP Medical Health. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Términos de Servicio
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Política de Privacidad
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
