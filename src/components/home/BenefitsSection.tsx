import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  FileCheck,
  Users,
  LineChart,
  ArrowRight
} from 'lucide-react';

const BENEFITS = [
  {
    icon: TrendingDown,
    metric: '-40%',
    title: 'Reduce ausentismo',
    description: 'Identifica riesgos antes de que se conviertan en bajas. Nuestros clientes reportan reducciones significativas en incapacidades.',
    stat: 'Promedio de clientes',
    color: 'emerald'
  },
  {
    icon: Clock,
    metric: '70%',
    title: 'Menos tiempo administrativo',
    description: 'Automatiza reportes STPS, NOM-035 y expedientes. Tu equipo médico se enfoca en pacientes, no en papeleo.',
    stat: 'Horas ahorradas/semana',
    color: 'blue'
  },
  {
    icon: ShieldCheck,
    metric: '100%',
    title: 'Cumplimiento normativo',
    description: 'Mantente al día con NOM-004, NOM-024, NOM-030 y NOM-035. Alertas automáticas de vencimientos y renovaciones.',
    stat: 'Normativas cubiertas',
    color: 'violet'
  },
  {
    icon: FileCheck,
    metric: '0',
    title: 'Papel cero',
    description: 'Expedientes médicos digitales con firma electrónica. Acceso seguro desde cualquier dispositivo, 24/7.',
    stat: 'Expedientes perdidos',
    color: 'amber'
  },
  {
    icon: Users,
    metric: '3x',
    title: 'Mayor productividad',
    description: 'Integración con RRHH y nómina. Conecta la salud ocupacional con los objetivos de tu empresa.',
    stat: 'ROI promedio anual',
    color: 'rose'
  },
  {
    icon: LineChart,
    metric: '98%',
    title: 'Precisión predictiva',
    description: 'IA que analiza patrones de ausentismo y riesgos ergonómicos. Toma decisiones basadas en datos, no intuición.',
    stat: 'Tasa de predicción',
    color: 'cyan'
  }
];

export function BenefitsSection() {
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
            Resultados medibles
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Beneficios que impactan tu
            <span className="text-emerald-600"> resultado financiero</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            No solo digitalizamos procesos. Transformamos la salud ocupacional 
            en una ventaja competitiva medible para tu empresa.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 border border-transparent hover:border-slate-100"
            >
              {/* Metric */}
              <div className={`text-5xl font-bold text-${benefit.color}-600 mb-4`}>
                {benefit.metric}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <benefit.icon className={`w-6 h-6 text-${benefit.color}-600`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {benefit.description}
              </p>

              {/* Stat Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200">
                <span className={`w-2 h-2 rounded-full bg-${benefit.color}-500`} />
                <span className="text-xs font-medium text-slate-600">{benefit.stat}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:gap-4 transition-all">
            Ver casos de éxito completos
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
