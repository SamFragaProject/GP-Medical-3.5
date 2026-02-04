import React, { useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { HomeNavbar } from '../components/home/HomeNavbar';
import { HeroSection } from '../components/home/HeroSection';
import { BenefitsSection } from '../components/home/BenefitsSection';
import { ShowcaseGallery } from '../components/home/ShowcaseGallery';
import { HowItWorks } from '../components/home/HowItWorks';
import { Testimonials } from '../components/home/Testimonials';
import { CTASection } from '../components/home/CTASection';
import { HomeFooter } from '../components/home/HomeFooter';
import { useMeta } from '@/hooks/useMeta';

export default function Home() {
  useMeta({
    title: 'GPMedical - Software de Medicina del Trabajo #1 en México',
    description: 'Reduce el ausentismo hasta 40%. Expedientes digitales, exámenes médicos ocupacionales, cumplimiento NOM y análisis predictivo con IA.'
  });

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-[0%] z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation */}
      <HomeNavbar />

      {/* Main Content - Funnel de Convicción */}
      <main>
        {/* 1. HERO - Propuesta de valor clara */}
        <HeroSection />

        {/* 2. BENEFICIOS - Resultados tangibles antes que features */}
        <BenefitsSection />

        {/* 3. SHOWCASE - Galería visual de espacios */}
        <ShowcaseGallery />

        {/* 4. CÓMO FUNCIONA - Proceso simple */}
        <HowItWorks />

        {/* 5. TESTIMONIALS - Prueba social */}
        <Testimonials />

        {/* 6. CTA FINAL - Conversión */}
        <CTASection />
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
