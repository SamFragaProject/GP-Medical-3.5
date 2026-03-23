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
        gradient: 'bg-gradient-to-b from-emerald-500 to-teal-700 shadow-[0_6px_20px_-4px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_10px_32px_-4px_rgba(16,185,129,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] text-white',
        solid: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.3)]',
    },
    secondary: {
        gradient: 'bg-gradient-to-b from-slate-700 to-slate-900 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_10px_32px_-4px_rgba(0,0,0,0.5)] text-white',
        solid: 'bg-slate-700 hover:bg-slate-800 text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)]',
    },
    success: {
        gradient: 'bg-gradient-to-b from-green-500 to-emerald-600 shadow-[0_6px_20px_-4px_rgba(34,197,94,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_10px_32px_-4px_rgba(34,197,94,0.6)] text-white',
        solid: 'bg-green-600 hover:bg-green-700 text-white shadow-[0_4px_12px_-2px_rgba(34,197,94,0.3)]',
    },
    danger: {
        gradient: 'bg-gradient-to-b from-rose-500 to-red-600 shadow-[0_6px_20px_-4px_rgba(244,63,94,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_10px_32px_-4px_rgba(244,63,94,0.6)] text-white',
        solid: 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_12px_-2px_rgba(244,63,94,0.3)]',
    },
    warning: {
        gradient: 'bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_6px_20px_-4px_rgba(245,158,11,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_32px_-4px_rgba(245,158,11,0.6)] text-white',
        solid: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_12px_-2px_rgba(245,158,11,0.3)]',
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
    const baseClasses = cn(
        'relative px-5 py-3 text-white rounded-xl font-bold',
        'transition-all duration-300 ease-out',
        'flex items-center justify-center gap-2',
        'overflow-hidden',
        // Shimmer sweep effect
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
    );
    const classes = gradient ? variantClasses[variant].gradient : variantClasses[variant].solid;
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-[2px] cursor-pointer';

    const ButtonContent = (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(baseClasses, classes, disabledClasses, className)}
        >
            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
            </span>
        </button>
    );

    if (animated && !disabled) {
        return (
            <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
                {ButtonContent}
            </motion.div>
        );
    }

    return ButtonContent;
}
