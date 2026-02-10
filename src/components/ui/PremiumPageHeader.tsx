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
        <div className={`relative z-50 mx-4 mb-10 px-8 py-10 transition-all duration-300 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/20`}>
            {/* Background Container with Blur and Border */}
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-[#101827] border border-white/10 shadow-inner backdrop-blur-3xl rounded-[2.5rem]`} />

            {/* Ambient Effects - Neural Vortex Style */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-6">
                    {/* Icon with Circular Container and Glow (Matches Image) */}
                    {Icon && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl opacity-50" />
                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center border border-white/20 shadow-xl">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    )}

                    {avatar && !Icon && (
                        React.isValidElement(avatar) ? (
                            avatar
                        ) : (
                            <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-4 ring-white/10 shadow-2xl">
                                <AvatarImage src={(avatar as any).src} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-2xl">
                                    {(avatar as any).fallback}
                                </AvatarFallback>
                            </Avatar>
                        )
                    )}

                    <div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-3xl md:text-5xl font-black tracking-tight text-white"
                            >
                                {title}
                            </motion.h1>
                            {badge && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black tracking-widest uppercase py-1.5 px-4 backdrop-blur-md border rounded-full">
                                    {badge}
                                </Badge>
                            )}
                        </div>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-400 mt-2 font-medium text-base md:text-lg leading-relaxed max-w-2xl"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                </div>

                {/* Actions Area - Glass Bubble Style (Matches Image) */}
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl p-2.5 rounded-[1.8rem] border border-white/10 shadow-2xl">
                    {actions}
                </div>
            </div>
        </div>
    );
};
