// =====================================================
// COMPONENTE: NextBestActionWidget
// Widget que muestra la siguiente acción recomendada
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React from 'react';
import { useEpisodio } from '@/hooks/useEpisodios';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  Clock,
  User,
  AlertCircle,
  Play,
  CheckCircle2,
  Activity,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// =====================================================
// INTERFACES
// =====================================================

interface NextBestActionWidgetProps {
  episodioId?: string;
  className?: string;
  onActionClick?: () => void;
}

// =====================================================
// HELPERS
// =====================================================

const COLORES_PRIORIDAD = {
  baja: 'bg-gray-100 text-gray-700 border-gray-200',
  media: 'bg-blue-100 text-blue-700 border-blue-200',
  alta: 'bg-orange-100 text-orange-700 border-orange-200',
  urgente: 'bg-red-100 text-red-700 border-red-200',
};

function formatTiempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
}

// =====================================================
// COMPONENTE
// =====================================================

export function NextBestActionWidget({
  episodioId,
  className,
  onActionClick,
}: NextBestActionWidgetProps) {
  const { user } = useAuth();
  const { episodio, isLoading } = useEpisodio(episodioId, {
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!episodio) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No hay episodio activo asignado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { siguiente_accion, paciente, estado_actual, tiempo_total_minutos, sla_minutos } = episodio;
  const slaExcedido = (tiempo_total_minutos || 0) > sla_minutos;

  // Verificar si la acción es para el rol actual
  const esMiAccion = !siguiente_accion || 
    siguiente_accion.rol_responsable === user?.rol ||
    user?.rol === 'super_admin';

  const iniciales = `${paciente?.nombre?.[0] || ''}${paciente?.apellido_paterno?.[0] || ''}`.toUpperCase();

  return (
    <Card className={`overflow-hidden ${className} ${esMiAccion ? 'border-primary/50' : ''}`}>
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${esMiAccion ? 'text-primary' : 'text-muted-foreground'}`} />
            <CardTitle className="text-base">Siguiente Acción</CardTitle>
          </div>
          {siguiente_accion && (
            <Badge className={COLORES_PRIORIDAD[siguiente_accion.prioridad]}>
              {siguiente_accion.prioridad}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info del paciente */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={paciente?.foto_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">
              {paciente?.nombre} {paciente?.apellido_paterno}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs capitalize">
                {estado_actual}
              </Badge>
              <span className={`flex items-center gap-1 ${slaExcedido ? 'text-red-600' : ''}`}>
                <Clock className="w-3 h-3" />
                {formatTiempo(tiempo_total_minutos || 0)} / {formatTiempo(sla_minutos)}
              </span>
            </div>
          </div>
        </div>

        {/* Acción recomendada */}
        {siguiente_accion ? (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{siguiente_accion.descripcion}</h5>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {siguiente_accion.rol_responsable}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{siguiente_accion.tiempo_estimado_minutos} min
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            {esMiAccion ? (
              <Button className="w-full gap-2" onClick={onActionClick}>
                <Play className="w-4 h-4" />
                Atender Ahora
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Esta acción es para: <strong>{siguiente_accion.rol_responsable}</strong>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">No hay acciones pendientes</p>
          </div>
        )}

        {/* Alerta SLA */}
        {slaExcedido && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">
              <strong>¡Atención!</strong> SLA excedido por {formatTiempo((tiempo_total_minutos || 0) - sla_minutos)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// VARIANTE: Compacta para dashboards
// =====================================================

interface NextBestActionCompactProps {
  sedeId: string;
  tipo: string;
  onActionClick?: () => void;
}

export function NextBestActionCompact({ sedeId, tipo, onActionClick }: NextBestActionCompactProps) {
  const { user } = useAuth();
  const { cola, isLoading, llamarSiguiente, isLlamando } = useColaTrabajo(sedeId, tipo as any);

  const siguientePaciente = cola?.pacientes.find(p => p.estado === 'esperando');

  if (isLoading) {
    return (
      <div className="p-4 bg-muted rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!siguientePaciente) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground">No hay pacientes en espera</p>
      </div>
    );
  }

  const iniciales = `${siguientePaciente.paciente.nombre?.[0] || ''}${siguientePaciente.paciente.apellido_paterno?.[0] || ''}`.toUpperCase();

  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-white text-sm">
            {iniciales}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {siguientePaciente.paciente.nombre} {siguientePaciente.paciente.apellido_paterno}
          </p>
          <p className="text-xs text-muted-foreground">
            Esperando: {siguientePaciente.tiempo_espera_minutos} min
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => llamarSiguiente()}
          disabled={isLlamando}
        >
          {isLlamando ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Atender
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Import necesario para la variante compacta
import { useColaTrabajo } from '@/hooks/useEpisodios';
