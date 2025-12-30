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
    blue: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-white border-blue-100/50 shadow-blue-500/20',
    purple: 'bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-white border-purple-100/50 shadow-purple-500/20',
    emerald: 'bg-gradient-to-br from-emerald-500/10 via-green-400/5 to-white border-emerald-100/50 shadow-emerald-500/20',
    rose: 'bg-gradient-to-br from-rose-500/10 via-pink-400/5 to-white border-rose-100/50 shadow-rose-500/20',
    amber: 'bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-white border-amber-100/50 shadow-amber-500/20',
};

export function PremiumCard({
    variant = 'default',
    gradient = 'blue',
    children,
    className = '',
    animated = true,
    hover = true,
}: PremiumCardProps) {
    const baseClasses = 'rounded-3xl shadow-lg border transition-all duration-300';

    const variantClasses = {
        default: 'bg-white border-slate-200',
        glassmorphism: 'bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl',
        gradient: gradientClasses[gradient],
    };

    const hoverClasses = hover ? 'hover:shadow-2xl' : '';

    const CardContent = (
        <div className={cn(
            baseClasses,
            variantClasses[variant],
            hoverClasses,
            className
        )}>
            {children}
        </div>
    );

    if (animated) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={hover ? { scale: 1.02, y: -4 } : {}}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                {CardContent}
            </motion.div>
        );
    }

    return CardContent;
}
