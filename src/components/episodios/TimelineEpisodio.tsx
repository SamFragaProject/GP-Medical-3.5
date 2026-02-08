// =====================================================
// COMPONENTE: TimelineEpisodio
// Visualización de la línea de tiempo del episodio
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React from 'react';
import type { TimelineEntry, EstadoEpisodio } from '@/types/episodio';
import {
  CheckCircle2,
  Circle,
  Clock,
  User,
  ArrowRight,
  Play,
  Square,
  Activity,
  FileText,
  Stethoscope,
  FlaskConical,
  Image,
  Ear,
  Wind,
  ClipboardCheck,
  XCircle,
} from 'lucide-react';

// =====================================================
// CONFIGURACIÓN DE ICONOS POR ESTADO
// =====================================================

const ICONOS_ESTADO: Record<EstadoEpisodio, React.ReactNode> = {
  registro: <FileText className="w-4 h-4" />,
  triage: <Activity className="w-4 h-4" />,
  evaluaciones: <Stethoscope className="w-4 h-4" />,
  laboratorio: <FlaskConical className="w-4 h-4" />,
  imagen: <Image className="w-4 h-4" />,
  audiometria: <Ear className="w-4 h-4" />,
  espirometria: <Wind className="w-4 h-4" />,
  dictamen: <ClipboardCheck className="w-4 h-4" />,
  cerrado: <XCircle className="w-4 h-4" />,
};

const COLORES_ESTADO: Record<EstadoEpisodio, { bg: string; border: string; text: string }> = {
  registro: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  triage: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  evaluaciones: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700' },
  laboratorio: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  imagen: { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700' },
  audiometria: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700' },
  espirometria: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  dictamen: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700' },
  cerrado: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' },
};

// =====================================================
// INTERFACES
// =====================================================

interface TimelineEpisodioProps {
  timeline: TimelineEntry[];
  estadoActual?: EstadoEpisodio;
  showDetails?: boolean;
  compact?: boolean;
}

// =====================================================
// HELPERS
// =====================================================

function formatFechaHora(timestamp: string): string {
  const fecha = new Date(timestamp);
  return fecha.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuracion(minutos?: number): string {
  if (!minutos || minutos === 0) return '';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
}

// =====================================================
// COMPONENTE
// =====================================================

export function TimelineEpisodio({
  timeline,
  estadoActual,
  showDetails = true,
  compact = false,
}: TimelineEpisodioProps) {
  // Ordenar timeline por timestamp
  const timelineOrdenado = [...timeline].sort(
    (a, b) => new Date(a.timestamp_inicio).getTime() - new Date(b.timestamp_inicio).getTime()
  );

  // Determinar estado actual si no se proporciona
  const estadoActivo = estadoActual || timelineOrdenado[timelineOrdenado.length - 1]?.estado;

  if (compact) {
    // Vista compacta (horizontal)
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {timelineOrdenado.map((entry, index) => {
          const colores = COLORES_ESTADO[entry.estado];
          const esActivo = entry.estado === estadoActivo && !entry.timestamp_fin;
          const esCompletado = !!entry.timestamp_fin;

          return (
            <React.Fragment key={entry.id}>
              <div
                className={`
                  flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap
                  ${esCompletado ? colores.bg : esActivo ? 'bg-primary/10' : 'bg-gray-50'}
                  ${esCompletado ? colores.text : esActivo ? 'text-primary' : 'text-gray-400'}
                `}
              >
                {esCompletado ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : esActivo ? (
                  <Play className="w-3 h-3" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                <span className="capitalize">{entry.estado}</span>
              </div>
              {index < timelineOrdenado.length - 1 && (
                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Vista completa (vertical)
  return (
    <div className="relative">
      {/* Línea vertical conectora */}
      <div className="absolute left-[19px] top-8 bottom-4 w-0.5 bg-gray-200" />

      <div className="space-y-0">
        {timelineOrdenado.map((entry, index) => {
          const colores = COLORES_ESTADO[entry.estado];
          const esActivo = entry.estado === estadoActivo && !entry.timestamp_fin;
          const esCompletado = !!entry.timestamp_fin;
          const esUltimo = index === timelineOrdenado.length - 1;

          return (
            <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Icono/Nodo */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${esCompletado
                      ? `${colores.bg} ${colores.border} ${colores.text}`
                      : esActivo
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-400 border-gray-200'
                    }
                  `}
                >
                  {esCompletado ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : esActivo ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    ICONOS_ESTADO[entry.estado]
                  )}
                </div>

                {/* Indicador de estado activo */}
                {esActivo && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 pt-1">
                {/* Header: Estado + Tiempo */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`font-semibold capitalize ${
                      esActivo ? 'text-primary' : esCompletado ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {entry.estado}
                      {esActivo && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (En progreso)
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatFechaHora(entry.timestamp_inicio)}
                      </span>
                      {entry.timestamp_fin && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span>{formatFechaHora(entry.timestamp_fin)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Duración */}
                  {(entry.duracion_minutos || esActivo) && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      esActivo
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {esActivo ? 'En curso' : formatDuracion(entry.duracion_minutos)}
                    </div>
                  )}
                </div>

                {/* Detalles */}
                {showDetails && (
                  <div className="mt-2 space-y-1">
                    {/* Usuario */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-gray-700">{entry.usuario_nombre}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({entry.rol})
                      </span>
                    </div>

                    {/* Observaciones */}
                    {entry.observaciones && (
                      <p className="text-sm text-muted-foreground mt-1 pl-5">
                        {entry.observaciones}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado futuro (si no está cerrado) */}
      {estadoActivo !== 'cerrado' && (
        <div className="relative flex gap-4 pt-2 opacity-50">
          <div className="relative z-10 flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 bg-white text-gray-300">
              <Circle className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-sm text-muted-foreground">Próximo paso...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// COMPONENTE: TimelineMini
// Versión ultra compacta para indicadores
// =====================================================

interface TimelineMiniProps {
  timeline: TimelineEntry[];
  estadoActual: EstadoEpisodio;
}

export function TimelineMini({ timeline, estadoActual }: TimelineMiniProps) {
  const estadosUnicos = [...new Set(timeline.map(t => t.estado))];
  const estadosOrdenados: EstadoEpisodio[] = [
    'registro', 'triage', 'evaluaciones', 'laboratorio', 
    'imagen', 'audiometria', 'espirometria', 'dictamen', 'cerrado'
  ];

  // Solo mostrar estados relevantes (hasta el actual + 1)
  const indiceActual = estadosOrdenados.indexOf(estadoActual);
  const estadosAMostrar = estadosOrdenados.slice(0, Math.min(indiceActual + 2, estadosOrdenados.length));

  return (
    <div className="flex items-center gap-1">
      {estadosAMostrar.map((estado, index) => {
        const completado = estadosUnicos.includes(estado) && estado !== estadoActual;
        const activo = estado === estadoActual;

        return (
          <React.Fragment key={estado}>
            <div
              className={`
                w-2 h-2 rounded-full
                ${completado ? 'bg-green-500' : activo ? 'bg-primary animate-pulse' : 'bg-gray-200'}
              `}
              title={estado}
            />
            {index < estadosAMostrar.length - 1 && (
              <div className={`w-3 h-0.5 ${completado ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
