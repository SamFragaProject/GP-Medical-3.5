// =====================================================
// COMPONENTE: EpisodioCard
// Tarjeta de episodio para el pipeline
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React, { useMemo } from 'react';
import type { EpisodioAtencion } from '@/types/episodio';
import {
  COLORES_TIPO_EVALUACION,
  ETIQUETAS_TIPO_EVALUACION,
} from '@/types/episodio';
import {
  Clock,
  AlertTriangle,
  Lock,
  User,
  Building2,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// =====================================================
// INTERFACES
// =====================================================

interface EpisodioCardProps {
  episodio: EpisodioAtencion;
  onClick?: () => void;
  compact?: boolean;
}

// =====================================================
// COMPONENTE
// =====================================================

export function EpisodioCard({ episodio, onClick, compact = false }: EpisodioCardProps) {
  // Cálculos
  const tiempoEnEstado = useMemo(() => {
    if (!episodio.timeline || episodio.timeline.length === 0) return 0;

    const entradaActual = episodio.timeline.find(
      t => t.estado === episodio.estado_actual && !t.timestamp_fin
    );

    if (!entradaActual) return 0;

    const inicio = new Date(entradaActual.timestamp_inicio).getTime();
    const ahora = Date.now();
    return Math.round((ahora - inicio) / (1000 * 60));
  }, [episodio.timeline, episodio.estado_actual]);

  const slaExcedido = (episodio.tiempo_total_minutos || 0) > episodio.sla_minutos;
  const tiempoEnEstadoAlerta = tiempoEnEstado > 20; // Alerta si más de 20 min en un estado

  const bloqueosActivos = useMemo(
    () => (episodio.bloqueos || []).filter(b => !b.resuelto),
    [episodio.bloqueos]
  );

  const tieneAsignacion = !!episodio.asignado_a;

  // Colores según tipo
  const colores = COLORES_TIPO_EVALUACION[episodio.tipo] || COLORES_TIPO_EVALUACION.consulta;
  const etiquetaTipo = ETIQUETAS_TIPO_EVALUACION[episodio.tipo] || episodio.tipo;

  // Iniciales del paciente
  const iniciales = useMemo(() => {
    const nombre = episodio.paciente?.nombre?.[0] || '';
    const apellido = episodio.paciente?.apellido_paterno?.[0] || '';
    return `${nombre}${apellido}`.toUpperCase();
  }, [episodio.paciente]);

  if (compact) {
    // Vista compacta
    return (
      <Card
        onClick={onClick}
        className={`
          p-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]
          ${slaExcedido ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}
          ${bloqueosActivos.length > 0 ? 'border-l-4 border-l-amber-500' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={episodio.paciente?.foto_url} />
            <AvatarFallback className="text-xs bg-primary/10">
              {iniciales}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {episodio.paciente?.nombre} {episodio.paciente?.apellido_paterno}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className={tiempoEnEstadoAlerta ? 'text-amber-600 font-medium' : ''}>
                {tiempoEnEstado}m
              </span>
              {bloqueosActivos.length > 0 && (
                <Lock className="w-3 h-3 text-amber-600 ml-1" />
              )}
            </div>
          </div>

          <Badge className={`text-[10px] ${colores.bg} ${colores.text} border-0`}>
            {etiquetaTipo.slice(0, 3)}
          </Badge>
        </div>
      </Card>
    );
  }

  // Vista completa
  return (
    <Card
      onClick={onClick}
      className={`
        p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]
        ${slaExcedido ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}
        ${bloqueosActivos.length > 0 ? 'border-l-4 border-l-amber-500' : ''}
        ${tieneAsignacion ? 'ring-1 ring-blue-200' : ''}
      `}
    >
      {/* Header: Avatar + Nombre + Tipo */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={episodio.paciente?.foto_url} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {iniciales}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {episodio.paciente?.nombre} {episodio.paciente?.apellido_paterno}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-5 ${colores.bg} ${colores.text} ${colores.border}`}
            >
              {etiquetaTipo}
            </Badge>
            {episodio.paciente?.curp && (
              <span className="text-[10px] text-muted-foreground truncate">
                {episodio.paciente.curp.slice(-6)}
              </span>
            )}
          </div>
        </div>

        {/* SLA Alerta */}
        {slaExcedido && (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
      </div>

      {/* Empresa */}
      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
        <Building2 className="w-3 h-3" />
        <span className="truncate">{episodio.empresa?.nombre || 'Sin empresa'}</span>
      </div>

      {/* Footer: Tiempo + Bloqueos + Asignación */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Tiempo en estado */}
          <div className={`flex items-center gap-1 text-xs ${
            tiempoEnEstadoAlerta ? 'text-amber-600' : 'text-muted-foreground'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{tiempoEnEstado} min</span>
          </div>

          {/* Bloqueos */}
          {bloqueosActivos.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Lock className="w-3 h-3" />
              <span>{bloqueosActivos.length}</span>
            </div>
          )}
        </div>

        {/* Asignación */}
        <div className="flex items-center gap-2">
          {tieneAsignacion ? (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">
                {episodio.asignado_a?.nombre.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">Sin asignar</span>
          )}

          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Next Best Action (si existe) */}
      {episodio.siguiente_accion && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground truncate">
              {episodio.siguiente_accion.descripcion}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
