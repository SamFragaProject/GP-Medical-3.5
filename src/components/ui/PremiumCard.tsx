import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
    variant?: 'default' | 'glassmorphism' | 'gradient';
    gradient?: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
    children: ReactNode;
    className?: string;
    animated?: boolean;
    hover?: boolean;
}

const gradientClasses = {
    blue: {
        bg: 'bg-gradient-to-br from-blue-500/8 via-blue-400/4 to-white/80 border-blue-100/40',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(59,130,246,0.06),0_8px_24px_-4px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.1),0_20px_48px_-8px_rgba(59,130,246,0.16)]',
        glow: 'rgba(59, 130, 246, 0.05)',
        accent: 'from-blue-400 to-indigo-500',
        borderHover: 'hover:border-blue-200/60',
    },
    purple: {
        bg: 'bg-gradient-to-br from-purple-500/8 via-purple-400/4 to-white/80 border-purple-100/40',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(168,85,247,0.06),0_8px_24px_-4px_rgba(168,85,247,0.1)] hover:shadow-[0_8px_16px_-4px_rgba(168,85,247,0.1),0_20px_48px_-8px_rgba(168,85,247,0.16)]',
        glow: 'rgba(168, 85, 247, 0.05)',
        accent: 'from-purple-400 to-violet-500',
        borderHover: 'hover:border-purple-200/60',
    },
    emerald: {
        bg: 'bg-gradient-to-br from-emerald-500/8 via-green-400/4 to-white/80 border-emerald-100/40',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(16,185,129,0.06),0_8px_24px_-4px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_16px_-4px_rgba(16,185,129,0.1),0_20px_48px_-8px_rgba(16,185,129,0.16)]',
        glow: 'rgba(16, 185, 129, 0.05)',
        accent: 'from-emerald-400 to-teal-500',
        borderHover: 'hover:border-emerald-200/60',
    },
    rose: {
        bg: 'bg-gradient-to-br from-rose-500/8 via-pink-400/4 to-white/80 border-rose-100/40',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(244,63,94,0.06),0_8px_24px_-4px_rgba(244,63,94,0.1)] hover:shadow-[0_8px_16px_-4px_rgba(244,63,94,0.1),0_20px_48px_-8px_rgba(244,63,94,0.16)]',
        glow: 'rgba(244, 63, 94, 0.05)',
        accent: 'from-rose-400 to-pink-500',
        borderHover: 'hover:border-rose-200/60',
    },
    amber: {
        bg: 'bg-gradient-to-br from-amber-500/8 via-yellow-400/4 to-white/80 border-amber-100/40',
        shadow: 'shadow-[0_2px_8px_-2px_rgba(245,158,11,0.06),0_8px_24px_-4px_rgba(245,158,11,0.1)] hover:shadow-[0_8px_16px_-4px_rgba(245,158,11,0.1),0_20px_48px_-8px_rgba(245,158,11,0.16)]',
        glow: 'rgba(245, 158, 11, 0.05)',
        accent: 'from-amber-400 to-orange-500',
        borderHover: 'hover:border-amber-200/60',
    },
};

export function PremiumCard({
    variant = 'default',
    gradient = 'blue',
    children,
    className = '',
    animated = true,
    hover = true,
}: PremiumCardProps) {
    const config = gradientClasses[gradient];

    const variantClasses = {
        default: cn(
            'bg-white/80 backdrop-blur-sm border-white/60',
            'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(0,0,0,0.08)]',
            hover && 'hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_20px_48px_-8px_rgba(0,0,0,0.12)] hover:border-emerald-200/40',
        ),
        glassmorphism: cn(
            'bg-white/60 backdrop-blur-xl border-white/30',
            'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06),0_12px_36px_-8px_rgba(0,0,0,0.1)]',
            hover && 'hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1),0_24px_56px_-12px_rgba(0,0,0,0.15)] hover:bg-white/70',
        ),
        gradient: cn(config.bg, config.shadow, hover && config.borderHover),
    };

    const CardContent = (
        <div className={cn(
            'group relative rounded-2xl border overflow-hidden',
            'transition-all duration-500 ease-out',
            variantClasses[variant],
            className
        )}>
            {/* Accent line on top — only for gradient variant */}
            {variant === 'gradient' && hover && (
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            )}

            {/* Inner glass overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none z-0" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );

    if (animated) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={hover ? { y: -3, scale: 1.01 } : {}}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
                {CardContent}
            </motion.div>
        );
    }

    return CardContent;
}
