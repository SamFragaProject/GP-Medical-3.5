import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  '30 días de prueba gratis',
  'Sin tarjeta de crédito',
  'Implementación incluida',
  'Soporte 24/7',
];

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-emerald-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Oferta de lanzamiento disponible
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Comienza a transformar la salud
            <br />
            de tu empresa hoy
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-10">
            Únete a más de 500 empresas que ya redujeron sus costos de ausentismo 
            y cumplen con todas las normativas de salud ocupacional.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="px-10 py-5 bg-white text-emerald-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-emerald-700 text-white rounded-xl font-semibold text-lg hover:bg-emerald-800 transition-all flex items-center gap-3 border border-emerald-500"
            >
              <Phone className="w-5 h-5" />
              Hablar con ventas
            </motion.button>
          </div>

          {/* Trust Note */}
          <p className="mt-8 text-emerald-200 text-sm">
            Cancela cuando quieras. Sin compromisos ni cargos ocultos.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
