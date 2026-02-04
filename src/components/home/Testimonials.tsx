import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "Redujimos el tiempo de elaboración de reportes STPS de 3 días a 2 horas. La inversión se recuperó en el primer trimestre.",
    author: "Dra. María González",
    role: "Directora Médica",
    company: "Grupo Industrial del Norte",
    metric: "85% menos tiempo",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    quote: "El módulo predictivo nos alertó sobre un patrón ergonómico antes de que se convirtiera en una incapacidad colectiva.",
    author: "Ing. Carlos Mendoza",
    role: "Gerente de RH",
    company: "Logística MX",
    metric: "40% menos ausentismo",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    quote: "Finalmente tenemos visibilidad real del estado de salud de nuestra fuerza laboral. Los dashboards son increíblemente útiles.",
    author: "Lic. Ana Martínez",
    role: "Directora de Operaciones",
    company: "Manufacturas del Centro",
    metric: "ROI 300% primer año",
    image: "https://i.pravatar.cc/150?img=9"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-slate-300 text-sm font-medium mb-6">
            Casos de éxito
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Lo que dicen nuestros
            <span className="text-emerald-400"> clientes</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Empresas líderes en México confían en GPMedical para transformar 
            su gestión de salud ocupacional.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-emerald-400 mb-6 opacity-50" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              {/* Metric Badge */}
              <div className="inline-block px-4 py-2 bg-emerald-500/20 rounded-full mb-6">
                <span className="text-emerald-400 font-semibold">{testimonial.metric}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                  <div className="text-xs text-slate-500">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-white/10"
        >
          <p className="text-center text-slate-500 text-sm mb-8">
            Empresas que confían en nosotros
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['TechCorp', 'Industrial MX', 'Logística Plus', 'Manufacturas', 'Grupo Norte'].map((logo, i) => (
              <div key={i} className="text-xl font-bold text-slate-400">
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
