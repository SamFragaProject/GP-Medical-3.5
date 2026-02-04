import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    gradient?: boolean;
    animated?: boolean;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
}

const variantClasses = {
    primary: {
        gradient: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 hover:shadow-emerald-500/40 text-white',
        solid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    secondary: {
        gradient: 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-500/30 hover:shadow-slate-500/40 text-white',
        solid: 'bg-slate-700 hover:bg-slate-800 text-white',
    },
    success: {
        gradient: 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30 hover:shadow-green-500/40 text-white',
        solid: 'bg-green-600 hover:bg-green-700 text-white',
    },
    danger: {
        gradient: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/30 hover:shadow-rose-500/40 text-white',
        solid: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
        gradient: 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/40 text-white',
        solid: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
};

export function PremiumButton({
    variant = 'primary',
    gradient = true,
    animated = true,
    children,
    className = '',
    onClick,
    disabled = false,
    icon,
}: PremiumButtonProps) {
    const baseClasses = 'px-4 py-3 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2';
    const classes = gradient ? variantClasses[variant].gradient : variantClasses[variant].solid;
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer';

    const ButtonContent = (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(baseClasses, classes, disabledClasses, className)}
        >
            {icon}
            {children}
        </button>
    );

    if (animated && !disabled) {
        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {ButtonContent}
            </motion.div>
        );
    }

    return ButtonContent;
}
