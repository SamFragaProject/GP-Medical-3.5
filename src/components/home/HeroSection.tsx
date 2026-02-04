import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CHECKS = [
  'Sin costos de implementación ocultos',
  'Migración de datos incluida',
  'Capacitación personalizada',
];

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-50">
      {/* Background Pattern - Subtle */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Soft Gradient Orbs */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-600 font-medium text-sm">Software de Medicina del Trabajo #1 en México</span>
            </motion.div>

            {/* Headline - Clear Benefit */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight">
              Reduce tus
              <span className="text-emerald-600"> costos de ausentismo</span>
              <br />
              hasta un 40%
            </h1>

            {/* Subheadline - Specific Value */}
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
              GPMedical es el sistema integral que conecta la salud de tus colaboradores 
              con la productividad de tu empresa. Cumplimiento NOM, expedientes digitales 
              y análisis predictivo en una sola plataforma.
            </p>

            {/* Trust Checks */}
            <div className="flex flex-wrap gap-4">
              {CHECKS.map((check, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-slate-600"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{check}</span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-3"
              >
                Prueba gratis 30 días
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Ver demo
              </motion.button>
            </div>

            {/* Social Proof - Minimal */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="Cliente"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-slate-900 font-semibold">+500 empresas</div>
                <div className="text-slate-500 text-sm">confían en GPMedical</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Visual - Clean Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Main Dashboard Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs text-slate-400 font-medium">dashboard.gpmedical.mx</div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Exámenes hoy', val: '24', trend: '+12%' },
                    { label: 'Ausentismo', val: '3.2%', trend: '-8%' },
                    { label: 'ROI Mensual', val: '$45K', trend: '+15%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4">
                      <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">{stat.val}</span>
                        <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Tendencia de ausentismo</span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Este mes</span>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 55, 45, 70, 50, 35, 30].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                        className="flex-1 bg-emerald-500 rounded-t-lg"
                        style={{ opacity: 0.3 + (i * 0.1) }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>Lun</span>
                    <span>Dom</span>
                  </div>
                </div>

                {/* Alert Card */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-lg">⚠️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Alerta predictiva</div>
                    <div className="text-xs text-slate-500">3 empleados en riesgo ergonómico alto</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge - Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Cumplimiento</div>
                  <div className="text-lg font-bold text-slate-900">NOM-030</div>
                  <div className="text-xs text-emerald-600">Certificado</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
