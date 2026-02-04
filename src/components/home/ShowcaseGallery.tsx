import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Stethoscope,
  FileText,
  BarChart3,
  Users,
  Calendar,
  Shield,
  Brain
} from 'lucide-react';

interface SpaceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  image: string;
  features: string[];
  color: string;
}

const SPACES: SpaceItem[] = [
  {
    id: 'expedientes',
    title: 'Expedientes Clínicos Digitales',
    subtitle: 'Historia médica completa',
    description: 'Accede a la información completa de tus pacientes en segundos. Historial médico, exámenes, recetas y evolución en un solo lugar.',
    icon: FileText,
    image: '/assets/medical_ai.png',
    features: ['Historia clínica estructurada', 'Imágenes y documentos adjuntos', 'Firma electrónica', 'Compartir con especialistas'],
    color: 'emerald'
  },
  {
    id: 'examenes',
    title: 'Exámenes Médicos Ocupacionales',
    subtitle: 'Evaluaciones integrales',
    description: 'Realiza exámenes pre-empleo, periódicos y de retiro con formatos automáticos ST-7 y ST-9. Cumplimiento garantizado.',
    icon: Stethoscope,
    image: '/assets/ai_core.png',
    features: ['Formatos ST-7 y ST-9 automáticos', 'Evaluaciones ergonómicas', 'Audiometría y espirometría', 'Certificados digitales'],
    color: 'blue'
  },
  {
    id: 'agenda',
    title: 'Agenda Inteligente',
    subtitle: 'Programación optimizada',
    description: 'Gestiona citas médicas, recordatorios automáticos y sincronización con calendarios corporativos. Reduce cancelaciones.',
    icon: Calendar,
    image: '/assets/anatomy_clean.png',
    features: ['Recordatorios automáticos', 'Sincronización Outlook/Google', 'Videoconsultas integradas', 'Check-in digital'],
    color: 'violet'
  },
  {
    id: 'reportes',
    title: 'Reportes y Analytics',
    subtitle: 'Inteligencia de negocio',
    description: 'Dashboards ejecutivos con métricas clave. Análisis de ausentismo, costos, tendencias de salud y cumplimiento normativo.',
    icon: BarChart3,
    image: '/assets/ai_medical_brain_premium.png',
    features: ['Dashboards ejecutivos', 'Exportación a Excel/PDF', 'Programación de reportes', 'Análisis predictivo'],
    color: 'amber'
  },
  {
    id: 'empresas',
    title: 'Gestión Multi-Empresa',
    subtitle: 'Administración centralizada',
    description: 'Administra múltiples empresas cliente desde una sola plataforma. Sedes, contactos, contratos y facturación organizada.',
    icon: Users,
    image: '/assets/medical_ai.png',
    features: ['Múltiples empresas y sedes', 'Contactos y responsables', 'Contratos y vigencias', 'Facturación consolidada'],
    color: 'rose'
  },
  {
    id: 'cumplimiento',
    title: 'Cumplimiento Normativo',
    subtitle: 'NOMs y STPS automatizadas',
    description: 'Mantente al día con NOM-004, NOM-024, NOM-030 y NOM-035. Alertas de vencimientos y reportes automáticos a autoridades.',
    icon: Shield,
    image: '/assets/ai_core.png',
    features: ['Alertas de vencimientos', 'Reportes STPS automáticos', 'Bitácora de cumplimiento', 'Auditorías documentadas'],
    color: 'cyan'
  }
];

export function ShowcaseGallery() {
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const openModal = (space: SpaceItem) => {
    setSelectedSpace(space);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedSpace(null);
    document.body.style.overflow = 'unset';
  };

  const navigateModal = (direction: 'prev' | 'next') => {
    if (!selectedSpace) return;
    const currentIndex = SPACES.findIndex(s => s.id === selectedSpace.id);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % SPACES.length
      : (currentIndex - 1 + SPACES.length) % SPACES.length;
    setSelectedSpace(SPACES[newIndex]);
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-white rounded-full text-slate-600 text-sm font-medium mb-6 border border-slate-200">
            Explora la plataforma
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Un espacio para cada
            <span className="text-emerald-600"> necesidad</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Descubre cómo cada módulo de GPMedical trabaja en conjunto 
            para crear una experiencia médica integral.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPACES.map((space, index) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(space.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              onClick={() => openModal(space)}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <div className={`absolute inset-0 bg-${space.color}-600/10`} />
                <img
                  src={space.image}
                  alt={space.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay on Hover */}
                <div className={`absolute inset-0 bg-${space.color}-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
                  <div className="text-white text-center p-6">
                    <Maximize2 className="w-8 h-8 mx-auto mb-3" />
                    <span className="font-semibold">Ver detalles</span>
                  </div>
                </div>

                {/* Icon Badge */}
                <div className={`absolute top-4 left-4 w-12 h-12 bg-${space.color}-500 rounded-2xl flex items-center justify-center shadow-lg`}>
                  <space.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className={`text-xs font-semibold text-${space.color}-600 uppercase tracking-wider mb-2`}>
                  {space.subtitle}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {space.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                  {space.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedSpace && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
              onClick={closeModal}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Navigation Buttons */}
                <button
                  onClick={() => navigateModal('prev')}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-white transition-all shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateModal('next')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-white transition-all shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="grid lg:grid-cols-2 h-full">
                  {/* Left: Image */}
                  <div className={`relative bg-${selectedSpace.color}-50 h-64 lg:h-auto`}>
                    <img
                      src={selectedSpace.image}
                      alt={selectedSpace.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-${selectedSpace.color}-600/20 to-transparent`} />
                    
                    {/* Icon Badge Large */}
                    <div className={`absolute bottom-8 left-8 w-20 h-20 bg-${selectedSpace.color}-500 rounded-3xl flex items-center justify-center shadow-2xl`}>
                      <selectedSpace.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="p-8 lg:p-12 overflow-y-auto">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${selectedSpace.color}-50 rounded-full mb-6`}>
                      <selectedSpace.icon className={`w-4 h-4 text-${selectedSpace.color}-600`} />
                      <span className={`text-sm font-semibold text-${selectedSpace.color}-600`}>
                        {selectedSpace.subtitle}
                      </span>
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                      {selectedSpace.title}
                    </h2>

                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                      {selectedSpace.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Características principales
                      </h3>
                      {selectedSpace.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl"
                        >
                          <div className={`w-8 h-8 bg-${selectedSpace.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-${selectedSpace.color}-600 font-bold`}>{i + 1}</span>
                          </div>
                          <span className="text-slate-700 font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-10 pt-8 border-t border-slate-100">
                      <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                        Probar este módulo gratis
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {SPACES.map((space, i) => (
                    <button
                      key={space.id}
                      onClick={() => setSelectedSpace(space)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        space.id === selectedSpace.id 
                          ? `w-8 bg-${selectedSpace.color}-500` 
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
