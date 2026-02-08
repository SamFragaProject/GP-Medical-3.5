/**
 * 🪝 HOOK DE PACIENTES V2
 * 
 * Features:
 * - React Query para caché y estado server
 * - Paginación real
 * - Filtros server-side
 * - Búsqueda con debounce
 * - Optimistic updates
 * - Sincronización en tiempo real
 */

import { useState, useCallback, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { pacienteService } from '../services/pacienteService';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import type {
  Paciente,
  CreatePacienteInput,
  UpdatePacienteInput,
  PacienteFilters,
  PacienteSort,
  PacienteStats,
} from '../types/paciente.types';
import type { PaginatedResult } from '../services/pacienteService';

// Claves de caché
const QUERY_KEYS = {
  all: ['pacientes'] as const,
  lists: (empresaId: string) => [...QUERY_KEYS.all, 'list', empresaId] as const,
  list: (empresaId: string, filters: PacienteFilters, page: number, pageSize: number) =>
    [...QUERY_KEYS.lists(empresaId), { filters, page, pageSize }] as const,
  details: (empresaId: string) => [...QUERY_KEYS.all, 'detail', empresaId] as const,
  detail: (empresaId: string, id: string) =>
    [...QUERY_KEYS.details(empresaId), id] as const,
  stats: (empresaId: string) => [...QUERY_KEYS.all, 'stats', empresaId] as const,
};

interface UsePacientesOptions {
  pageSize?: number;
  enableRealtime?: boolean;
}

export function usePacientes(options: UsePacientesOptions = {}) {
  const { pageSize = 20, enableRealtime = true } = options;
  const { user } = useAuthContext();
  const empresaId = user?.empresaId || '';
  const queryClient = useQueryClient();

  // Estado local para filtros y paginación
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PacienteFilters>({});
  const [sort, setSort] = useState<PacienteSort>({
    field: 'createdAt',
    direction: 'desc',
  });

  // Debounce para búsqueda
  const debouncedFilters = useDebounce(filters, 300);

  // Reset página cuando cambian filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  // =====================================================
  // QUERIES
  // =====================================================

  /**
   * Query: Listado paginado de pacientes
   */
  const pacientesQuery = useQuery<PaginatedResult<Paciente>, Error>({
    queryKey: QUERY_KEYS.list(empresaId, debouncedFilters, page, pageSize),
    queryFn: () =>
      pacienteService.getPacientes(empresaId, {
        page,
        pageSize,
        filters: debouncedFilters,
        sort,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: keepPreviousData,
    enabled: !!empresaId,
  });

  /**
   * Query: Estadísticas
   */
  const statsQuery = useQuery<PacienteStats, Error>({
    queryKey: QUERY_KEYS.stats(empresaId),
    queryFn: () => pacienteService.getStats(empresaId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!empresaId,
  });

  // =====================================================
  // MUTATIONS
  // =====================================================

  /**
   * Mutation: Crear paciente
   */
  const createMutation = useMutation<Paciente, Error, CreatePacienteInput>({
    mutationFn: (input) =>
      pacienteService.createPaciente(input, empresaId, user!.id),

    onSuccess: (newPaciente) => {
      // Invalidar listados
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(empresaId),
      });

      // Agregar a caché
      queryClient.setQueryData(
        QUERY_KEYS.detail(empresaId, newPaciente.id),
        newPaciente
      );

      // Actualizar stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats(empresaId),
      });
    },
  });

  /**
   * Mutation: Actualizar paciente
   */
  const updateMutation = useMutation<
    Paciente,
    Error,
    { id: string; input: UpdatePacienteInput },
    { previousPaciente: Paciente | undefined }
  >({
    mutationFn: ({ id, input }) =>
      pacienteService.updatePaciente(id, input, empresaId, user!.id),

    onMutate: async ({ id, input }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.detail(empresaId, id),
      });

      // Snapshot del valor anterior
      const previousPaciente = queryClient.getQueryData<Paciente>(
        QUERY_KEYS.detail(empresaId, id)
      );

      // Optimistic update
      if (previousPaciente) {
        queryClient.setQueryData(
          QUERY_KEYS.detail(empresaId, id),
          { ...previousPaciente, ...input }
        );
      }

      return { previousPaciente };
    },

    onError: (err, { id }, context) => {
      // Rollback en error
      if (context?.previousPaciente) {
        queryClient.setQueryData(
          QUERY_KEYS.detail(empresaId, id),
          context.previousPaciente
        );
      }
    },

    onSettled: (data, error, { id }) => {
      // Invalidar queries afectadas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(empresaId, id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(empresaId),
      });
    },
  });

  /**
   * Mutation: Eliminar paciente (soft delete)
   */
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) =>
      pacienteService.deletePaciente(id, empresaId, user!.id),

    onSuccess: (_, id) => {
      // Invalidar listados
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(empresaId),
      });

      // Remover de caché
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.detail(empresaId, id),
      });

      // Actualizar stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats(empresaId),
      });
    },
  });

  /**
   * Mutation: Reactivar paciente
   */
  const reactivateMutation = useMutation<void, Error, string>({
    mutationFn: (id) =>
      pacienteService.reactivatePaciente(id, empresaId, user!.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(empresaId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats(empresaId),
      });
    },
  });

  // =====================================================
  // HANDLERS
  // =====================================================

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  const setFilter = useCallback(<K extends keyof PacienteFilters>(
    key: K,
    value: PacienteFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (pacientesQuery.data && page < pacientesQuery.data.totalPages) {
      setPage((p) => p + 1);
    }
  }, [page, pacientesQuery.data]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const setSorting = useCallback((field: PacienteSort['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // =====================================================
  // REALTIME
  // =====================================================

  useEffect(() => {
    if (!enableRealtime || !empresaId) return;

    const subscription = pacienteService.subscribeToChanges(
      empresaId,
      (payload) => {
        // Invalidar caché cuando hay cambios externos
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.lists(empresaId),
        });

        if (payload.eventType === 'DELETE') {
          queryClient.removeQueries({
            queryKey: QUERY_KEYS.detail(empresaId, payload.old.id),
          });
        } else if (payload.new?.id) {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.detail(empresaId, payload.new.id),
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime, empresaId, queryClient]);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Datos
    pacientes: pacientesQuery.data?.data ?? [],
    total: pacientesQuery.data?.total ?? 0,
    page,
    pageSize,
    totalPages: pacientesQuery.data?.totalPages ?? 0,
    stats: statsQuery.data,

    // Loading states
    isLoading: pacientesQuery.isLoading,
    isFetching: pacientesQuery.isFetching,
    isLoadingStats: statsQuery.isLoading,

    // Errors
    error: pacientesQuery.error,
    statsError: statsQuery.error,

    // Filtros
    filters,
    sort,
    setSearch,
    setFilter,
    clearFilters,
    setSorting,

    // Paginación
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: page < (pacientesQuery.data?.totalPages ?? 0),
    hasPreviousPage: page > 1,

    // Acciones
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    reactivate: reactivateMutation.mutate,

    // Loading de mutaciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReactivating: reactivateMutation.isPending,

    // Refetch
    refetch: pacientesQuery.refetch,
    refetchStats: statsQuery.refetch,
  };
}

/**
 * Hook para un paciente específico
 */
export function usePaciente(id: string | null) {
  const { user } = useAuthContext();
  const empresaId = user?.empresaId || '';
  const queryClient = useQueryClient();

  const query = useQuery<Paciente | null, Error>({
    queryKey: QUERY_KEYS.detail(empresaId, id || ''),
    queryFn: () =>
      id ? pacienteService.getPaciente(id, empresaId) : null,
    enabled: !!id && !!empresaId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    paciente: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
