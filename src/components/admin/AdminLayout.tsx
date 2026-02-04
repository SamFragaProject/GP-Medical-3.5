/**
 * Layout unificado para todos los módulos de administración
 * Proporciona consistencia visual en todo el panel admin
 */
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface AdminBadge {
  text: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'info' | 'success' | 'warning';
  icon?: React.ReactNode;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badges?: AdminBadge[];
  actions?: React.ReactNode;
  backButton?: boolean;
  backTo?: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  secondary: 'bg-slate-100 text-slate-700',
  destructive: 'bg-red-100 text-red-700',
  outline: 'border border-slate-200 text-slate-700',
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
};

export function AdminLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  badges = [],
  actions,
  backButton = false,
  backTo,
  className = ''
}: AdminLayoutProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Back Button */}
              {backButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => backTo ? navigate(backTo) : navigate(-1)}
                  className="mt-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}

              {/* Icon */}
              {Icon && (
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
              )}

              {/* Title Section */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-slate-500 mt-1">{subtitle}</p>
                )}

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {badges.map((badge, i) => (
                      <Badge
                        key={i}
                        className={`${variantStyles[badge.variant || 'default']} font-medium`}
                      >
                        {badge.icon && <span className="mr-1">{badge.icon}</span>}
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Card estándar para secciones admin
 */
export interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function AdminCard({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  noPadding = false
}: AdminCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-slate-400" />}
            <div>
              {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}

/**
 * Grid de estadísticas estándar
 */
export interface StatItem {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: LucideIcon;
  color?: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'cyan';
}

export interface AdminStatsGridProps {
  stats: StatItem[];
  className?: string;
}

const colorStyles: Record<string, { bg: string; text: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'text-rose-500' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' },
};

export function AdminStatsGrid({ stats, className = '' }: AdminStatsGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => {
        const colors = colorStyles[stat.color || 'emerald'];
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                {stat.trend && (
                  <p className={`text-sm mt-2 ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend}
                  </p>
                )}
              </div>
              {Icon && (
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Barra de búsqueda estándar
 */
export interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = ''
}: AdminSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
      />
    </div>
  );
}

import { Search, Loader2 } from 'lucide-react';

/**
 * Estado de carga estándar
 */
export function AdminLoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
      <p className="text-slate-500">{message}</p>
    </div>
  );
}

/**
 * Estado vacío estándar
 */
export interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function AdminEmptyState({ title, description, icon: Icon, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-slate-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-500 max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
