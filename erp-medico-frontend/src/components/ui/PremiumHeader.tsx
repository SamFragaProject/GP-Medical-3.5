import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumHeaderProps {
    title: string;
    subtitle?: string;
    badges?: Array<{
        text: string;
        variant: 'success' | 'info' | 'warning' | 'danger';
        icon?: ReactNode;
    }>;
    gradient?: boolean;
    className?: string;
}

const badgeVariants = {
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30',
    danger: 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30',
};

export function PremiumHeader({
    title,
    subtitle,
    badges = [],
    gradient = true,
    className = '',
}: PremiumHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 p-8 relative overflow-hidden',
                className
            )}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />

            <div className="relative z-10 flex justify-between items-end">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                            'text-4xl font-bold mb-2',
                            gradient
                                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                                : 'text-slate-900'
                        )}
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-600 text-lg"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>
                {badges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-3"
                    >
                        {badges.map((badge, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'px-4 py-2 rounded-xl shadow-lg flex items-center gap-2',
                                    badgeVariants[badge.variant]
                                )}
                            >
                                {badge.icon}
                                <span className="text-white font-semibold text-sm">
                                    {badge.text}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
