import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Settings, Users, LineChart, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Implementación en 48 horas',
    description: 'Migración gratuita de tus datos históricos. Nuestro equipo configura todo por ti sin interrumpir tu operación.',
    color: 'emerald'
  },
  {
    number: '02',
    icon: Settings,
    title: 'Personalización completa',
    description: 'Adaptamos la plataforma a tus protocolos médicos, formatos de empresa y flujos de trabajo específicos.',
    color: 'blue'
  },
  {
    number: '03',
    icon: Users,
    title: 'Capacitación incluida',
    description: 'Tus médicos y personal administrativo reciben entrenamiento personalizado. Soporte ilimitado los primeros 30 días.',
    color: 'violet'
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Resultados visibles',
    description: 'Comienza a ver reducción en tiempos administrativos y mejora en indicadores de salud desde el primer mes.',
    color: 'amber'
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-slate-100 rounded-full text-slate-600 text-sm font-medium mb-6">
            Proceso simple
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            De la instalación a los
            <span className="text-emerald-600"> resultados</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            No necesitas ser experto en tecnología. Nosotros nos encargamos de todo 
            para que tú te enfoques en cuidar la salud de tus colaboradores.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-slate-200 -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-300 rounded-full" />
                </div>
              )}

              <div className="relative z-10">
                {/* Number */}
                <div className="text-6xl font-bold text-slate-100 mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 bg-${step.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                  <step.icon className={`w-7 h-7 text-${step.color}-600`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">¿Listo para comenzar?</div>
              <div className="text-slate-600">Agenda una demo personalizada con nuestro equipo</div>
            </div>
            <button className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap">
              Agendar demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
