// =====================================================
// COMPONENTE: ColaTrabajo
// Vista de cola para cada rol (recepción, triage, etc.)
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React, { useState } from 'react';
import { useColaTrabajo } from '@/hooks/useEpisodios';
import { useAuth } from '@/contexts/AuthContext';
import type { TipoCola, PacienteEnCola } from '@/types/episodio';
import {
  Users,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  UserCheck,
  RefreshCw,
  ChevronRight,
  Activity,
  Timer,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

// =====================================================
// CONFIGURACIÓN
// =====================================================

const COLORES_PRIORIDAD: Record<number, string> = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
};

const ETIQUETAS_COLA: Record<TipoCola, { titulo: string; color: string; icono: React.ReactNode }> = {
  recepcion: {
    titulo: 'Recepción',
    color: 'text-gray-700',
    icono: <Users className="w-5 h-5" />,
  },
  triage: {
    titulo: 'Triage',
    color: 'text-blue-700',
    icono: <Activity className="w-5 h-5" />,
  },
  consulta: {
    titulo: 'Consulta Médica',
    color: 'text-indigo-700',
    icono: <UserCheck className="w-5 h-5" />,
  },
  laboratorio: {
    titulo: 'Laboratorio',
    color: 'text-purple-700',
    icono: <Activity className="w-5 h-5" />,
  },
  imagen: {
    titulo: 'Imagen',
    color: 'text-cyan-700',
    icono: <Activity className="w-5 h-5" />,
  },
  audiometria: {
    titulo: 'Audiometría',
    color: 'text-pink-700',
    icono: <Activity className="w-5 h-5" />,
  },
  espirometria: {
    titulo: 'Espirometría',
    color: 'text-orange-700',
    icono: <Activity className="w-5 h-5" />,
  },
  dictamen: {
    titulo: 'Dictamen',
    color: 'text-emerald-700',
    icono: <UserCheck className="w-5 h-5" />,
  },
};

// =====================================================
// INTERFACES
// =====================================================

interface ColaTrabajoProps {
  sedeId: string;
  tipo: TipoCola;
  className?: string;
  onPacienteSelect?: (paciente: PacienteEnCola) => void;
}

// =====================================================
// COMPONENTE: PacienteCard
// =====================================================

interface PacienteCardProps {
  paciente: PacienteEnCola;
  index: number;
  onClick?: () => void;
}

function PacienteCard({ paciente, index, onClick }: PacienteCardProps) {
  const iniciales = `${paciente.paciente.nombre?.[0] || ''}${paciente.paciente.apellido_paterno?.[0] || ''}`.toUpperCase();

  const getEstadoBadge = () => {
    switch (paciente.estado) {
      case 'en_atencion':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Play className="w-3 h-3 mr-1" />
            En atención
          </Badge>
        );
      case 'pausado':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Pause className="w-3 h-3 mr-1" />
            Pausado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Esperando
          </Badge>
        );
    }
  };

  return (
    <Card
      onClick={onClick}
      className={`
        cursor-pointer transition-all hover:shadow-md
        ${paciente.alerta_sla ? 'border-red-300 bg-red-50/30' : ''}
        ${paciente.estado === 'en_atencion' ? 'ring-1 ring-blue-200' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Número en cola */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>

          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={paciente.paciente.foto_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {iniciales}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold truncate">
                  {paciente.paciente.nombre} {paciente.paciente.apellido_paterno}
                </h4>
                <p className="text-sm text-muted-foreground">{paciente.empresa_nombre}</p>
              </div>
              {getEstadoBadge()}
            </div>

            {/* Detalles */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <Badge variant="outline" className="capitalize">
                {paciente.tipo_evaluacion}
              </Badge>

              {/* Prioridad */}
              <span className={`px-2 py-0.5 rounded text-xs ${COLORES_PRIORIDAD[paciente.prioridad]}`}>
                P{paciente.prioridad}
              </span>

              {/* Tiempo espera */}
              <span className={`flex items-center gap-1 ${
                paciente.tiempo_espera_minutos > 30 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {paciente.tiempo_espera_minutos} min
              </span>

              {/* SLA */}
              {paciente.alerta_sla && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  SLA
                </span>
              )}
            </div>

            {/* Asignado a */}
            {paciente.asignado_a && (
              <div className="mt-2 pt-2 border-t flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-muted-foreground">Atendiendo:</span>
                <span className="font-medium">{paciente.asignado_a.nombre}</span>
              </div>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function ColaTrabajo({ sedeId, tipo, className, onPacienteSelect }: ColaTrabajoProps) {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'esperando' | 'en_atencion'>('todos');

  const config = ETIQUETAS_COLA[tipo];

  const {
    cola,
    isLoading,
    isError,
    refetch,
    llamarSiguiente,
    liberarAsignacion,
    isLlamando,
  } = useColaTrabajo(sedeId, tipo, {
    refetchInterval: 15000,
    enableRealtime: true,
  });

  // Filtrar pacientes
  const pacientesFiltrados = cola?.pacientes.filter(p => {
    // Filtro de búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      const nombre = `${p.paciente.nombre} ${p.paciente.apellido_paterno}`.toLowerCase();
      if (!nombre.includes(termino) && !p.paciente.curp?.toLowerCase().includes(termino)) {
        return false;
      }
    }

    // Filtro de estado
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) {
      return false;
    }

    return true;
  }) || [];

  // Separar por estado
  const pacientesEsperando = pacientesFiltrados.filter(p => p.estado === 'esperando');
  const pacientesEnAtencion = pacientesFiltrados.filter(p => p.estado === 'en_atencion');

  // Handlers
  const handleLlamarSiguiente = async () => {
    try {
      await llamarSiguiente();
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleLiberar = async (episodioId: string) => {
    try {
      await liberarAsignacion(episodioId);
      toast.success('Paciente liberado');
    } catch (error) {
      toast.error('Error al liberar');
    }
  };

  // Verificar si el usuario tiene un paciente asignado
  const miPaciente = cola?.pacientes.find(
    p => p.asignado_a?.usuario_id === user?.id
  );

  if (isError) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Error al cargar la cola</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                {config.icono}
              </div>
              <div>
                <CardTitle>{config.titulo}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {cola?.pacientes.length || 0} pacientes en cola
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              {tipo !== 'recepcion' && (
                <Button
                  onClick={handleLlamarSiguiente}
                  disabled={isLlamando || pacientesEsperando.length === 0}
                  className="gap-2"
                >
                  {isLlamando ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Llamar siguiente
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Stats */}
        {cola?.estadisticas_hoy && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{cola.estadisticas_hoy.atendidos}</p>
                <p className="text-xs text-muted-foreground">Atendidos hoy</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{cola.estadisticas_hoy.en_espera}</p>
                <p className="text-xs text-muted-foreground">En espera</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{cola.estadisticas_hoy.tiempo_promedio_espera}</p>
                <p className="text-xs text-muted-foreground">Min. espera promedio</p>
              </div>
              <div className={`p-3 rounded-lg ${cola.estadisticas_hoy.alertas_sla > 0 ? 'bg-red-100' : 'bg-muted'}`}>
                <p className={`text-2xl font-bold ${cola.estadisticas_hoy.alertas_sla > 0 ? 'text-red-600' : ''}`}>
                  {cola.estadisticas_hoy.alertas_sla}
                </p>
                <p className="text-xs text-muted-foreground">Alertas SLA</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mi paciente actual */}
      {miPaciente && (
        <Card className="mb-4 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Mi paciente actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={miPaciente.paciente.foto_url} />
                  <AvatarFallback>
                    {miPaciente.paciente.nombre?.[0]}{miPaciente.paciente.apellido_paterno?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {miPaciente.paciente.nombre} {miPaciente.paciente.apellido_paterno}
                  </p>
                  <p className="text-sm text-muted-foreground">{miPaciente.empresa_nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {miPaciente.tipo_evaluacion}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {miPaciente.tiempo_espera_minutos} min esperando
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => onPacienteSelect?.(miPaciente)}>
                  Ver detalle
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleLiberar(miPaciente.episodio_id)}>
                  Liberar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as any)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="esperando">Esperando</SelectItem>
            <SelectItem value="en_atencion">En atención</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de pacientes */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : pacientesFiltrados.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay pacientes en cola</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pacientes en atención */}
            {pacientesEnAtencion.length > 0 && filtroEstado !== 'esperando' && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  En atención ({pacientesEnAtencion.length})
                </h3>
                <div className="space-y-2">
                  {pacientesEnAtencion.map((paciente, index) => (
                    <PacienteCard
                      key={paciente.episodio_id}
                      paciente={paciente}
                      index={index}
                      onClick={() => onPacienteSelect?.(paciente)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pacientes esperando */}
            {pacientesEsperando.length > 0 && filtroEstado !== 'en_atencion' && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  En espera ({pacientesEsperando.length})
                </h3>
                <div className="space-y-2">
                  {pacientesEsperando.map((paciente, index) => (
                    <PacienteCard
                      key={paciente.episodio_id}
                      paciente={paciente}
                      index={index}
                      onClick={() => onPacienteSelect?.(paciente)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
