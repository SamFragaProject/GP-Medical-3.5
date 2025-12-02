import React, { useEffect } from 'react';
import { HomeNavbar } from '../components/home/HomeNavbar';
import { HeroSection } from '../components/home/HeroSection';
import { DashboardPreview } from '../components/home/DashboardPreview';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { AIShowcase } from '../components/home/AIShowcase';
import { PricingSection } from '../components/home/PricingSection';
import { StatsSection } from '../components/home/StatsSection';
import { CTASection } from '../components/home/CTASection';
import { HomeFooter } from '../components/home/HomeFooter';

export default function Home() {
    // Smooth scroll behavior
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <HomeNavbar />

            {/* Hero Section */}
            <HeroSection />

            {/* Dashboard Preview */}
            <DashboardPreview />

            {/* Features Grid */}
            <FeaturesGrid />

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
    );
}
