/**
 * 🪝 HOOK DE AGENDA V2
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaService } from '../services/agendaService';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';
import type {
  Cita,
  CreateCitaInput,
  UpdateCitaInput,
  AgendaFilters,
  AgendaStats,
  EstadoCita,
} from '../types/agenda.types';

const QUERY_KEYS = {
  all: ['agenda'] as const,
  lists: (empresaId: string) => [...QUERY_KEYS.all, 'list', empresaId] as const,
  list: (empresaId: string, filters: AgendaFilters) =>
    [...QUERY_KEYS.lists(empresaId), filters] as const,
  hoy: (empresaId: string) => [...QUERY_KEYS.all, 'hoy', empresaId] as const,
  stats: (empresaId: string) => [...QUERY_KEYS.all, 'stats', empresaId] as const,
  detail: (empresaId: string, id: string) =>
    [...QUERY_KEYS.all, 'detail', empresaId, id] as const,
};

interface UseAgendaOptions {
  enableRealtime?: boolean;
}

export function useAgenda(options: UseAgendaOptions = {}) {
  const { enableRealtime = true } = options;
  const { user, empresaId } = useAuthContext();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AgendaFilters>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());

  // Query: Citas con filtros
  const citasQuery = useQuery<Cita[], Error>({
    queryKey: QUERY_KEYS.list(empresaId, filters),
    queryFn: () => agendaService.getCitas(empresaId, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!empresaId,
  });

  // Query: Citas de hoy
  const citasHoyQuery = useQuery<Cita[], Error>({
    queryKey: QUERY_KEYS.hoy(empresaId),
    queryFn: () => agendaService.getCitasHoy(empresaId),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60000, // Refrescar cada minuto
    enabled: !!empresaId,
  });

  // Query: Stats
  const statsQuery = useQuery<AgendaStats, Error>({
    queryKey: QUERY_KEYS.stats(empresaId),
    queryFn: () => agendaService.getStats(empresaId),
    staleTime: 1 * 60 * 1000,
    enabled: !!empresaId,
  });

  // Mutation: Crear cita
  const createMutation = useMutation<Cita, Error, CreateCitaInput>({
    mutationFn: (input) =>
      agendaService.createCita(input, empresaId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hoy(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(empresaId) });
    },
  });

  // Mutation: Actualizar cita
  const updateMutation = useMutation<
    Cita,
    Error,
    { id: string; input: UpdateCitaInput }
  >({
    mutationFn: ({ id, input }) =>
      agendaService.updateCita(id, input, empresaId, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hoy(empresaId) });
      queryClient.setQueryData(
        QUERY_KEYS.detail(empresaId, data.id),
        data
      );
    },
  });

  // Mutation: Cancelar cita
  const cancelarMutation = useMutation<
    void,
    Error,
    { id: string; motivo: string }
  >({
    mutationFn: ({ id, motivo }) =>
      agendaService.cancelarCita(id, motivo, empresaId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hoy(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(empresaId) });
    },
  });

  // Mutation: Completar cita
  const completarMutation = useMutation<void, Error, string>({
    mutationFn: (id) => agendaService.completarCita(id, empresaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(empresaId) });
    },
  });

  // Handlers
  const setFecha = useCallback((fecha: Date) => {
    setFechaSeleccionada(fecha);
    const fechaStr = fecha.toISOString().split('T')[0];
    const manana = new Date(fecha);
    manana.setDate(manana.getDate() + 1);
    
    setFilters((prev) => ({
      ...prev,
      fechaDesde: fechaStr,
      fechaHasta: manana.toISOString().split('T')[0],
    }));
  }, []);

  const setMedicoFilter = useCallback((medicoId: string | undefined) => {
    setFilters((prev) => ({ ...prev, medicoId }));
  }, []);

  const setEstadoFilter = useCallback((estado: EstadoCita | undefined) => {
    setFilters((prev) => ({ ...prev, estado }));
  }, []);

  // Verificar disponibilidad
  const verificarDisponibilidad = useCallback(
    async (medicoId: string, fecha: string, hora: string, duracion: number) => {
      return agendaService.verificarDisponibilidad(
        medicoId,
        fecha,
        hora,
        duracion,
        empresaId
      );
    },
    [empresaId]
  );

  return {
    // Datos
    citas: citasQuery.data ?? [],
    citasHoy: citasHoyQuery.data ?? [],
    stats: statsQuery.data,
    fechaSeleccionada,
    filters,
    
    // Loading
    isLoading: citasQuery.isLoading,
    isLoadingHoy: citasHoyQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    
    // Acciones
    setFecha,
    setMedicoFilter,
    setEstadoFilter,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    cancelar: cancelarMutation.mutate,
    completar: completarMutation.mutate,
    verificarDisponibilidad,
    
    // Loading mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelando: cancelarMutation.isPending,
    isCompletando: completarMutation.isPending,
    
    // Refetch
    refetch: citasQuery.refetch,
  };
}
