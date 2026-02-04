/**
 * PremiumHeader - GPMedical 3.5
 * 
 * Header de lujo compartido para todas las secciones
 * Con efectos premium, glassmorphism y diseño consistente
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell, Search, Plus, Settings, ChevronRight,
    Clock, Sparkles, Zap, Moon, Sun, Command,
    HelpCircle, Grid3X3, Layers, Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface PremiumHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    breadcrumbs?: { label: string; path?: string }[];
    actions?: React.ReactNode;
    userName?: string;
    notifications?: number;
    showSearch?: boolean;
    onNewClick?: () => void;
    newButtonLabel?: string;
}

export function PremiumHeader({
    title,
    subtitle,
    icon,
    breadcrumbs = [],
    actions,
    userName = 'Samuel',
    notifications = 0,
    showSearch = true,
    onNewClick,
    newButtonLabel = 'Nuevo'
}: PremiumHeaderProps) {
    const currentTime = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const greeting = new Date().getHours() < 12
        ? 'Buenos días'
        : new Date().getHours() < 18
            ? 'Buenas tardes'
            : 'Buenas noches';

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-[100] shadow-2xl"
        >
            {/* Top Bar - Premium (La que debe ser sticky) */}
            <div className="relative overflow-hidden">
                {/* Gradient Background - Ultra Deep Slate */}
                <div className="absolute inset-0 bg-slate-950" />

                {/* Refined gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                <div className="relative px-8 py-4 flex items-center justify-between">
                    {/* Left - Search Command */}
                    {showSearch && (
                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Comando de búsqueda neural..."
                                    className="w-full pl-11 pr-20 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg">
                                    <Command className="w-3 h-3 text-slate-500" />
                                    <span className="text-[10px] text-slate-500 font-black">K</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right - Profile */}
                    <div className="flex items-center gap-6">
                        <NotificationBell />

                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">IA Sincronizada</span>
                            </div>

                            <div className="h-6 w-px bg-white/10 mx-2" />

                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-white leading-none mb-0.5">{userName}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Super Admin</p>
                            </div>

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">
                                {userName.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Header - White Refinement (Glassy) */}
            <div className="relative bg-white/80 backdrop-blur-2xl border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-50/50 to-white pointer-events-none" />

                <div className="relative px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        {icon && (
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/10">
                                <div className="text-emerald-400">
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div>
                            {breadcrumbs.length > 0 && (
                                <div className="flex items-center gap-2 mb-1">
                                    {breadcrumbs.map((crumb, i) => (
                                        <React.Fragment key={i}>
                                            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{crumb.label}</span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{title}</h1>
                            {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {actions}
                        <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

// Quick action buttons for header
export function HeaderAction({
    icon: Icon,
    label,
    onClick,
    variant = 'default'
}: {
    icon: any;
    label: string;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'success' | 'warning';
}) {
    const variants = {
        default: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
        warning: 'bg-amber-500 text-white hover:bg-amber-600'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${variants[variant]}`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
