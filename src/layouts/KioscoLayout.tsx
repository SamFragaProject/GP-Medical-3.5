import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KioscoLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
    showBackButton?: boolean
    onBack?: () => void
    onHome?: () => void
    icon?: LucideIcon
}

export const KioscoLayout: React.FC<KioscoLayoutProps> = ({
    children,
    title,
    subtitle,
    showBackButton = true,
    onBack,
    onHome,
    icon: Icon
}) => {
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 overflow-hidden relative">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 p-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <ArrowLeft className="h-6 w-6 text-emerald-400" />
                        </Button>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            {Icon && <Icon className="h-8 w-8 text-emerald-500" />}
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {title || 'GPMedical Kiosco'}
                            </h1>
                        </div>
                        {subtitle && <p className="text-white/40 text-lg mt-1 font-medium">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onHome}
                        className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Home className="h-6 w-6 text-white/60" />
                    </Button>
                    <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase">Sistema Activo</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 h-[calc(100vh-120px)] overflow-y-auto px-8 py-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={window.location.pathname}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer / Status Bar */}
            <footer className="absolute bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
                <div className="px-8 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/30 text-xs font-medium tracking-[0.2em] uppercase">
                    GPMedical Ecosistema Digital • 2026
                </div>
            </footer>
        </div>
    )
}
