import React, { useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeNavbar } from '../components/home/HomeNavbar';
import { HeroSection } from '../components/home/HeroSection';
import { InteractiveShowcase } from '../components/home/InteractiveShowcase';
import { DashboardPreview } from '../components/home/DashboardPreview';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { AIShowcase } from '../components/home/AIShowcase';
import { PricingSection } from '../components/home/PricingSection';
import { StatsSection } from '../components/home/StatsSection';
import { CTASection } from '../components/home/CTASection';
import { HomeFooter } from '../components/home/HomeFooter';
import { useMeta } from '@/hooks/useMeta';

export default function Home() {
    useMeta({
        title: 'Software ERP Médico y Medicina del Trabajo',
        description: 'La plataforma más avanzada para gestión clínica, salud ocupacional y análisis predictivo con IA. GPMedical MediFlow v3.5.'
    });
    const { scrollYProgress } = useScroll();

    // Smooth scroll behavior
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <div className="min-h-screen bg-transparent relative">
            {/* Clinical Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-[0%] z-[100] shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                style={{ scaleX: scrollYProgress }}
            />

            <div className="relative z-10 font-sans">
                {/* Navbar */}
                <HomeNavbar />

                {/* Hero Section */}
                <HeroSection />

                {/* Interactive Feature Showcase - NEW */}
                <InteractiveShowcase />

                {/* Dashboard Preview */}
                <DashboardPreview />

                {/* AI Showcase */}
                <AIShowcase />

                {/* Stats Section */}
                <StatsSection />

                {/* Pricing Section */}
                <PricingSection />

                {/* CTA Section */}
                <CTASection />

                {/* Footer */}
                <HomeFooter />
            </div>
        </div>
    );
}
