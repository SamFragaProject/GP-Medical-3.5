// =====================================================
// HOOK: useEpisodios - Gestión de Episodios de Atención
// GPMedical ERP Pro - Motor de Flujos
// =====================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { episodioService } from '@/services/episodioService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type {
  EpisodioAtencion,
  EstadoEpisodio,
  CrearEpisodioDTO,
  TransicionEstadoDTO,
  AgregarBloqueoDTO,
  ColaTrabajo,
  TipoCola,
  AlertaSLA,
} from '@/types/episodio';

// =====================================================
// HOOK: useEpisodios
// =====================================================

interface UseEpisodiosOptions {
  empresaId?: string;
  sedeId?: string;
  estado?: EstadoEpisodio;
  tipo?: string;
  refetchInterval?: number; // ms
  enableRealtime?: boolean;
}

export function useEpisodios(options: UseEpisodiosOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const empresaId = options.empresaId || user?.empresa_id;
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Query key base
  const queryKey = ['episodios', empresaId, options.sedeId, options.estado, options.tipo];

  // =====================================================
  // QUERY: Listar episodios
  // =====================================================
  const {
    data: episodios = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!empresaId) return [];
      return episodioService.listarPorEmpresa(empresaId, {
        estado: options.estado,
        tipo: options.tipo,
        sedeId: options.sedeId,
      });
    },
    enabled: !!empresaId,
    refetchInterval: options.refetchInterval || 30000, // 30 segundos por defecto
    staleTime: 10000, // 10 segundos
  });

  // =====================================================
  // REALTIME: Suscripción a cambios
  // =====================================================
  useEffect(() => {
    if (!options.enableRealtime || !empresaId) return;

    const channel = supabase
      .channel('episodios_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'episodios_atencion',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          console.log('📡 Cambio detectado en episodios:', payload);
          queryClient.invalidateQueries({ queryKey: ['episodios'] });
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      channel.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [empresaId, options.enableRealtime, queryClient]);

  // =====================================================
  // MUTATION: Crear episodio
  // =====================================================
  const crearMutation = useMutation({
    mutationFn: async (dto: CrearEpisodioDTO) => {
      return episodioService.crear(dto);
    },
    onSuccess: () => {
      toast.success('Episodio creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['episodios'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al crear episodio: ${error.message}`);
    },
  });

  // =====================================================
  // MUTATION: Transicionar estado
  // =====================================================
  const transicionarMutation = useMutation({
    mutationFn: async ({
      episodioId,
      nuevoEstado,
      data,
    }: {
      episodioId: string;
      nuevoEstado: EstadoEpisodio;
      data: TransicionEstadoDTO;
    }) => {
      return episodioService.transicionar(episodioId, nuevoEstado, data);
    },
    onSuccess: (_, variables) => {
      toast.success(`Episodio movido a: ${variables.nuevoEstado}`);
      queryClient.invalidateQueries({ queryKey: ['episodios'] });
      queryClient.invalidateQueries({ queryKey: ['episodio', variables.episodioId] });
    },
    onError: (error: Error) => {
      toast.error(`Error al transicionar: ${error.message}`);
    },
  });

  // =====================================================
  // MUTATION: Agregar bloqueo
  // =====================================================
  const agregarBloqueoMutation = useMutation({
    mutationFn: async ({
      episodioId,
      bloqueo,
    }: {
      episodioId: string;
      bloqueo: AgregarBloqueoDTO;
    }) => {
      return episodioService.agregarBloqueo(episodioId, bloqueo);
    },
    onSuccess: () => {
      toast.success('Bloqueo agregado');
      queryClient.invalidateQueries({ queryKey: ['episodios'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // =====================================================
  // MUTATION: Resolver bloqueo
  // =====================================================
  const resolverBloqueoMutation = useMutation({
    mutationFn: async ({
      episodioId,
      bloqueoId,
    }: {
      episodioId: string;
      bloqueoId: string;
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return episodioService.resolverBloqueo(episodioId, bloqueoId, user.id);
    },
    onSuccess: () => {
      toast.success('Bloqueo resuelto');
      queryClient.invalidateQueries({ queryKey: ['episodios'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // =====================================================
  // MUTATION: Check-in / Check-out
  // =====================================================
  const checkInMutation = useMutation({
    mutationFn: async ({ episodioId, area }: { episodioId: string; area: string }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return episodioService.checkIn(episodioId, area, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodios'] });
    },
    onError: (error: Error) => {
      toast.error(`Error en check-in: ${error.message}`);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async ({ episodioId, area }: { episodioId: string; area: string }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return episodioService.checkOut(episodioId, area, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodios'] });
    },
    onError: (error: Error) => {
      toast.error(`Error en check-out: ${error.message}`);
    },
  });

  // =====================================================
  // HELPERS
  // =====================================================
  const crearEpisodio = useCallback(
    async (dto: Omit<CrearEpisodioDTO, 'creado_por'> & { empresa_id?: string; sede_id?: string }) => {
      if (!user?.id || (!dto.empresa_id && !empresaId)) {
        toast.error('Usuario no autenticado o empresa no definida');
        return null;
      }

      return crearMutation.mutateAsync({
        ...dto,
        creado_por: user.id,
        empresa_id: dto.empresa_id || empresaId || '',
        sede_id: dto.sede_id || options.sedeId || user.sede_id || '',
      } as CrearEpisodioDTO);
    },
    [user, empresaId, options.sedeId, crearMutation]
  );

  const transicionar = useCallback(
    async (episodioId: string, nuevoEstado: EstadoEpisodio, observaciones?: string) => {
      if (!user?.id || !user.nombre || !user.rol) {
        toast.error('Usuario no autenticado');
        return null;
      }

      return transicionarMutation.mutateAsync({
        episodioId,
        nuevoEstado,
        data: {
          usuario_id: user.id,
          usuario_nombre: user.nombre,
          rol: user.rol,
          observaciones,
        },
      });
    },
    [user, transicionarMutation]
  );

  return {
    // Estado
    episodios,
    isLoading,
    isError,
    error,

    // Queries
    refetch,

    // Mutations
    crearEpisodio,
    transicionar,
    agregarBloqueo: agregarBloqueoMutation.mutateAsync,
    resolverBloqueo: resolverBloqueoMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,

    // Estados de mutations
    isCreating: crearMutation.isPending,
    isTransicionando: transicionarMutation.isPending,
  };
}

// =====================================================
// HOOK: useEpisodio (singular)
// =====================================================

interface UseEpisodioOptions {
  refetchInterval?: number;
  enableRealtime?: boolean;
}

export function useEpisodio(episodioId?: string, options: UseEpisodioOptions = {}) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const queryKey = ['episodio', episodioId];

  // Query: Obtener episodio
  const {
    data: episodio,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!episodioId) return null;
      return episodioService.obtener(episodioId);
    },
    enabled: !!episodioId,
    refetchInterval: options.refetchInterval || 30000,
  });

  // Realtime: Suscripción a cambios del episodio específico
  useEffect(() => {
    if (!options.enableRealtime || !episodioId) return;

    const channel = supabase
      .channel(`episodio_${episodioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'episodios_atencion',
          filter: `id=eq.${episodioId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      channel.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [episodioId, options.enableRealtime, queryClient, queryKey]);

  return {
    episodio,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// =====================================================
// HOOK: useColaTrabajo
// =====================================================

interface UseColaTrabajoOptions {
  refetchInterval?: number;
  enableRealtime?: boolean;
}

export function useColaTrabajo(
  sedeId?: string,
  tipo?: TipoCola,
  options: UseColaTrabajoOptions = {}
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const queryKey = ['cola', sedeId, tipo];

  // Query: Obtener cola
  const {
    data: cola,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!sedeId || !tipo) return null;
      return episodioService.obtenerCola(sedeId, tipo);
    },
    enabled: !!sedeId && !!tipo,
    refetchInterval: options.refetchInterval || 15000, // 15 segundos para colas
  });

  // Realtime: Suscripción a cambios
  useEffect(() => {
    if (!options.enableRealtime || !sedeId) return;

    const channel = supabase
      .channel(`cola_${sedeId}_${tipo}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'episodios_atencion',
          filter: `sede_id=eq.${sedeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      channel.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [sedeId, tipo, options.enableRealtime, queryClient, queryKey]);

  // Mutation: Llamar siguiente
  const llamarSiguienteMutation = useMutation({
    mutationFn: async () => {
      if (!sedeId || !tipo || !user?.id || !user.nombre || !user.rol) {
        throw new Error('Datos incompletos');
      }
      return episodioService.llamarSiguiente(sedeId, tipo, user.id, user.nombre, user.rol);
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(`Paciente asignado: ${data.paciente?.nombre || ''}`);
      } else {
        toast('No hay pacientes en espera', { icon: 'ℹ️' });
      }
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutation: Liberar asignación
  const liberarMutation = useMutation({
    mutationFn: async (episodioId: string) => {
      return episodioService.liberarAsignacion(episodioId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    cola,
    isLoading,
    isError,
    error,
    refetch,

    // Acciones
    llamarSiguiente: llamarSiguienteMutation.mutateAsync,
    liberarAsignacion: liberarMutation.mutateAsync,

    // Estados
    isLlamando: llamarSiguienteMutation.isPending,
  };
}

// =====================================================
// HOOK: useSLA
// =====================================================

export function useSLAs(empresaId?: string) {
  const queryClient = useQueryClient();

  const {
    data: alertas = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['slas', empresaId],
    queryFn: async () => {
      return episodioService.verificarSLAs();
    },
    refetchInterval: 60000, // Verificar cada minuto
  });

  return {
    alertas,
    isLoading,
    refetch,
    count: alertas.length,
  };
}

// =====================================================
// HOOK: useStatsPipeline
// =====================================================

export function useStatsPipeline(sedeId?: string, fecha?: string) {
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stats', sedeId, fecha],
    queryFn: async () => {
      if (!sedeId) return null;
      return episodioService.obtenerStats(sedeId, fecha);
    },
    enabled: !!sedeId,
    refetchInterval: 60000,
  });

  return {
    stats,
    isLoading,
    refetch,
  };
}
