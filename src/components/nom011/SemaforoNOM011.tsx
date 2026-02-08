import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SemaforoNOM011 as SemaforoType } from '@/types/nom011';

interface SemaforoNOM011Props {
  estado: SemaforoType;
  mensaje?: string;
  showDetails?: boolean;
}

const semaforoConfig: Record<SemaforoType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  verde: {
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: 'Normal',
    description: 'Audición dentro de límites normales',
    color: '#22c55e',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
  },
  amarillo: {
    icon: <AlertTriangle className="w-8 h-8" />,
    title: 'Observación',
    description: 'Audición con alteración leve',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
  },
  rojo: {
    icon: <AlertCircle className="w-8 h-8" />,
    title: 'Daño Auditivo',
    description: 'Audición con alteración significativa',
    color: '#ef4444',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-800',
  },
};

export function SemaforoNOM011({ estado, mensaje, showDetails = true }: SemaforoNOM011Props) {
  const config = semaforoConfig[estado];

  return (
    <div className={`p-4 rounded-xl border-2 ${config.bgColor} ${config.borderColor} transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
          style={{ 
            backgroundColor: config.color,
            boxShadow: `0 0 20px ${config.color}40`,
          }}
        >
          <div className="text-white">
            {config.icon}
          </div>
        </div>
        <div className="flex-1">
          <h4 className={`text-lg font-bold ${config.textColor}`}>
            {config.title}
          </h4>
          <p className={`text-sm ${config.textColor} opacity-80`}>
            {mensaje || config.description}
          </p>
        </div>
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2 rounded ${estado === 'verde' ? 'bg-white/50 font-semibold' : 'opacity-50'}`}>
              <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
              <span className="text-emerald-800">&lt; 25 dB</span>
            </div>
            <div className={`p-2 rounded ${estado === 'amarillo' ? 'bg-white/50 font-semibold' : 'opacity-50'}`}>
              <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
              <span className="text-amber-800">25 - 45 dB</span>
            </div>
            <div className={`p-2 rounded ${estado === 'rojo' ? 'bg-white/50 font-semibold' : 'opacity-50'}`}>
              <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1" />
              <span className="text-rose-800">&gt; 45 dB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Versión compacta para tablas
export function SemaforoNOM011Badge({ estado }: { estado: SemaforoType }) {
  const config = semaforoConfig[estado];
  
  return (
    <Badge 
      className={`${config.bgColor} ${config.textColor} ${config.borderColor} border`}
    >
      <span 
        className="w-2 h-2 rounded-full mr-1.5"
        style={{ backgroundColor: config.color }}
      />
      {config.title}
    </Badge>
  );
}

// Indicador visual simple (solo el círculo)
export function SemaforoNOM011Indicator({ estado, size = 'md' }: { estado: SemaforoType; size?: 'sm' | 'md' | 'lg' }) {
  const config = semaforoConfig[estado];
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };
  
  return (
    <div
      className={`${sizeClasses[size]} rounded-full`}
      style={{ 
        backgroundColor: config.color,
        boxShadow: `0 0 10px ${config.color}60`,
      }}
      title={config.title}
    />
  );
}
