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
        gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/40',
        solid: 'bg-blue-600 hover:bg-blue-700',
    },
    secondary: {
        gradient: 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/40',
        solid: 'bg-purple-600 hover:bg-purple-700',
    },
    success: {
        gradient: 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30 hover:shadow-emerald-500/40',
        solid: 'bg-emerald-600 hover:bg-emerald-700',
    },
    danger: {
        gradient: 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30 hover:shadow-rose-500/40',
        solid: 'bg-rose-600 hover:bg-rose-700',
    },
    warning: {
        gradient: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 hover:shadow-amber-500/40',
        solid: 'bg-amber-600 hover:bg-amber-700',
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
