import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PremiumPageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    badge?: string;
    avatar?: {
        src?: string;
        fallback: string;
    } | React.ReactNode;
    actions?: React.ReactNode;
    gradient?: string; // e.g., 'from-blue-600 to-indigo-700'
}

export const PremiumPageHeader: React.FC<PremiumPageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    badge,
    avatar,
    actions,
    gradient = 'from-slate-950 via-slate-900 to-slate-950'
}) => {
    return (
        <div className={`relative z-50 mx-4 mb-10 px-8 py-10 transition-all duration-300 rounded-[3rem] overflow-hidden shadow-2xl`}>
            {/* Background Container with Blur and Border */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} border border-white/20 shadow-2xl backdrop-blur-3xl rounded-[3rem]`} />

            {/* Ambient Effects - Neural Vortex Style */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-6">
                    {/* Icon with Glowing Effect */}
                    {Icon ? (
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/40 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border border-white/20 shadow-2xl transform group-hover:rotate-3 transition-transform">
                                <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                        </div>
                    ) : avatar && (
                        React.isValidElement(avatar) ? (
                            avatar
                        ) : (
                            <Avatar className="h-14 w-14 md:h-16 md:w-16 ring-4 ring-white/10 shadow-2xl hover:scale-105 transition-transform">
                                <AvatarImage src={(avatar as any).src} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl">
                                    {(avatar as any).fallback}
                                </AvatarFallback>
                            </Avatar>
                        )
                    )}

                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-200"
                            >
                                {title}
                            </motion.h1>
                            {badge && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] md:text-[10px] font-black tracking-widest uppercase py-1 px-3 backdrop-blur-md border animate-pulse">
                                    {badge}
                                </Badge>
                            )}
                        </div>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-400 mt-2 font-medium text-sm md:text-lg leading-relaxed max-w-2xl"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/10 shadow-inner">
                    {actions}
                </div>
            </div>
        </div>
    );
};
