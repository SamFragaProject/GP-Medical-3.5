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
    gradient?: string;
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
        <div className="relative z-50 mb-8 px-6 py-6 transition-all duration-300 rounded-2xl overflow-hidden shadow-lg">
            {/* Background — Clean Dark Navy */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1222] via-[#0f172a] to-[#0c1222] border border-white/[0.06] rounded-2xl" />

            {/* Subtle accent line */}
            <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-5">
                    {/* Icon */}
                    {Icon && (
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-emerald-400" />
                        </div>
                    )}

                    {avatar && !Icon && (
                        React.isValidElement(avatar) ? (
                            avatar
                        ) : (
                            <Avatar className="h-14 w-14 ring-2 ring-white/10 shadow-lg">
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
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xl md:text-2xl font-black tracking-tight text-white"
                            >
                                {title}
                            </motion.h1>
                            {badge && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black tracking-widest uppercase py-1 px-3 border rounded-full">
                                    {badge}
                                </Badge>
                            )}
                        </div>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-500 mt-1 font-medium text-sm leading-relaxed max-w-xl"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>
        </div>
    );
};
