// =====================================================
// COMPONENTE: PipelineEpisodios
// Vista Kanban del pipeline de atención médica
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import React, { useState, useMemo } from 'react';
import { useEpisodios } from '@/hooks/useEpisodios';
import { EpisodioCard } from './EpisodioCard';
import { TimelineEpisodio } from './TimelineEpisodio';
import type { EpisodioAtencion, EstadoEpisodio, TipoEvaluacion } from '@/types/episodio';
import {
  Filter,
  RefreshCw,
  LayoutGrid,
  Clock,
  AlertTriangle,
  Users,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// =====================================================
// CONFIGURACIÓN DE COLUMNAS
// =====================================================

interface ColumnaConfig {
  id: EstadoEpisodio;
  titulo: string;
  color: string;
  bgColor: string;
  icono: React.ReactNode;
}

const COLUMNAS: ColumnaConfig[] = [
  {
    id: 'registro',
    titulo: 'Registro',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icono: <Users className="w-4 h-4" />,
  },
  {
    id: 'triage',
    titulo: 'Triage',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icono: <Clock className="w-4 h-4" />,
  },
  {
    id: 'evaluaciones',
    titulo: 'Evaluaciones',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    icono: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: 'laboratorio',
    titulo: 'Laboratorio',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icono: <Filter className="w-4 h-4" />,
  },
  {
    id: 'imagen',
    titulo: 'Imagen',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    icono: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: 'audiometria',
    titulo: 'Audiometría',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    icono: <Clock className="w-4 h-4" />,
  },
  {
    id: 'espirometria',
    titulo: 'Espirometría',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    icono: <Clock className="w-4 h-4" />,
  },
  {
    id: 'dictamen',
    titulo: 'Dictamen',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icono: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: 'cerrado',
    titulo: 'Cerrado',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    icono: <X className="w-4 h-4" />,
  },
];

// =====================================================
// INTERFACES
// =====================================================

interface PipelineEpisodiosProps {
  sedeId: string;
  empresaId?: string;
  className?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function PipelineEpisodios({ sedeId, empresaId, className }: PipelineEpisodiosProps) {
  // Estado local
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoEvaluacion | 'todos'>('todos');
  const [filtroSLA, setFiltroSLA] = useState<boolean>(false);
  const [columnasVisibles, setColumnasVisibles] = useState<EstadoEpisodio[]>(
    COLUMNAS.map(c => c.id)
  );
  const [episodioSeleccionado, setEpisodioSeleccionado] = useState<EpisodioAtencion | null>(null);
  const [vistaCompacta, setVistaCompacta] = useState(false);

  // Hook de datos
  const { episodios, isLoading, refetch, isError } = useEpisodios({
    sedeId,
    empresaId,
    refetchInterval: 30000,
    enableRealtime: true,
  });

  // Filtrar episodios
  const episodiosFiltrados = useMemo(() => {
    return episodios.filter(ep => {
      // Filtro por búsqueda
      if (busqueda) {
        const termino = busqueda.toLowerCase();
        const nombreCompleto = `${ep.paciente?.nombre || ''} ${ep.paciente?.apellido_paterno || ''} ${ep.paciente?.apellido_materno || ''}`.toLowerCase();
        const curp = (ep.paciente?.curp || '').toLowerCase();
        
        if (!nombreCompleto.includes(termino) && !curp.includes(termino)) {
          return false;
        }
      }

      // Filtro por tipo
      if (filtroTipo !== 'todos' && ep.tipo !== filtroTipo) {
        return false;
      }

      // Filtro por SLA
      if (filtroSLA) {
        const tiempoTotal = ep.tiempo_total_minutos || 0;
        if (tiempoTotal <= ep.sla_minutos) {
          return false;
        }
      }

      return true;
    });
  }, [episodios, busqueda, filtroTipo, filtroSLA]);

  // Agrupar por estado
  const episodiosPorColumna = useMemo(() => {
    const grupos: Record<EstadoEpisodio, EpisodioAtencion[]> = {
      registro: [],
      triage: [],
      evaluaciones: [],
      laboratorio: [],
      imagen: [],
      audiometria: [],
      espirometria: [],
      dictamen: [],
      cerrado: [],
    };

    episodiosFiltrados.forEach(ep => {
      if (grupos[ep.estado_actual]) {
        grupos[ep.estado_actual].push(ep);
      }
    });

    // Ordenar cada columna por prioridad/tiempo
    Object.keys(grupos).forEach(key => {
      grupos[key as EstadoEpisodio].sort((a, b) => {
        // Primero por SLA excedido
        const aExcedido = (a.tiempo_total_minutos || 0) > a.sla_minutos;
        const bExcedido = (b.tiempo_total_minutos || 0) > b.sla_minutos;
        if (aExcedido !== bExcedido) return aExcedido ? -1 : 1;

        // Luego por fecha de creación (más antiguo primero)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    });

    return grupos;
  }, [episodiosFiltrados]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = episodios.length;
    const conAlertaSLA = episodios.filter(
      ep => (ep.tiempo_total_minutos || 0) > ep.sla_minutos
    ).length;
    const conBloqueos = episodios.filter(
      ep => (ep.bloqueos || []).some(b => !b.resuelto)
    ).length;

    return { total, conAlertaSLA, conBloqueos };
  }, [episodios]);

  // Handlers
  const toggleColumna = (columnaId: EstadoEpisodio) => {
    setColumnasVisibles(prev =>
      prev.includes(columnaId)
        ? prev.filter(id => id !== columnaId)
        : [...prev, columnaId]
    );
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('todos');
    setFiltroSLA(false);
  };

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p>Error al cargar los episodios. Intente nuevamente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header con controles */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Pipeline de Atención</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stats.total} episodios activos
                  {stats.conAlertaSLA > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.conAlertaSLA} SLA excedido
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 w-[200px]"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-2.5 top-2.5"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Filtro tipo */}
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoEvaluacion | 'todos')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="preempleo">Preempleo</SelectItem>
                  <SelectItem value="periodico">Periódico</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro SLA */}
              <Button
                variant={filtroSLA ? "destructive" : "outline"}
                size="sm"
                onClick={() => setFiltroSLA(!filtroSLA)}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                SLA
              </Button>

              {/* Columnas visibles */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Columnas
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {COLUMNAS.map(columna => (
                    <DropdownMenuCheckboxItem
                      key={columna.id}
                      checked={columnasVisibles.includes(columna.id)}
                      onCheckedChange={() => toggleColumna(columna.id)}
                    >
                      <span className="flex items-center gap-2">
                        {columna.icono}
                        {columna.titulo}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Vista compacta */}
              <Button
                variant={vistaCompacta ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaCompacta(!vistaCompacta)}
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Compacto
              </Button>

              {/* Refresh */}
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Limpiar */}
              {(busqueda || filtroTipo !== 'todos' || filtroSLA) && (
                <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNAS.filter(col => columnasVisibles.includes(col.id)).map(columna => {
            const episodiosColumna = episodiosPorColumna[columna.id];
            const hayAlertaSLA = episodiosColumna.some(
              ep => (ep.tiempo_total_minutos || 0) > ep.sla_minutos
            );

            return (
              <div
                key={columna.id}
                className={`w-[280px] flex-shrink-0 rounded-lg ${columna.bgColor} border`}
              >
                {/* Header de columna */}
                <div className="p-3 border-b bg-white/50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={columna.color}>{columna.icono}</span>
                      <h3 className={`font-semibold text-sm ${columna.color}`}>
                        {columna.titulo}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {hayAlertaSLA && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {episodiosColumna.length}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {isLoading ? (
                    // Skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-24 bg-white/50 rounded-lg animate-pulse"
                      />
                    ))
                  ) : episodiosColumna.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Sin pacientes
                    </div>
                  ) : (
                    episodiosColumna.map(episodio => (
                      <EpisodioCard
                        key={episodio.id}
                        episodio={episodio}
                        onClick={() => setEpisodioSeleccionado(episodio)}
                        compact={vistaCompacta}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalle */}
      <Dialog open={!!episodioSeleccionado} onOpenChange={() => setEpisodioSeleccionado(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {episodioSeleccionado?.paciente?.nombre} {episodioSeleccionado?.paciente?.apellido_paterno}
              <Badge variant="outline">{episodioSeleccionado?.estado_actual}</Badge>
            </DialogTitle>
          </DialogHeader>

          {episodioSeleccionado && (
            <div className="space-y-6">
              {/* Info del paciente */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{episodioSeleccionado.empresa?.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{episodioSeleccionado.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo total</p>
                  <p className={`font-medium ${
                    (episodioSeleccionado.tiempo_total_minutos || 0) > episodioSeleccionado.sla_minutos
                      ? 'text-red-600'
                      : ''
                  }`}>
                    {episodioSeleccionado.tiempo_total_minutos} min / {episodioSeleccionado.sla_minutos} min SLA
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bloqueos</p>
                  <p className="font-medium">
                    {(episodioSeleccionado.bloqueos || []).filter(b => !b.resuelto).length} activos
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-3">Timeline de Atención</h4>
                <TimelineEpisodio timeline={episodioSeleccionado.timeline || []} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
