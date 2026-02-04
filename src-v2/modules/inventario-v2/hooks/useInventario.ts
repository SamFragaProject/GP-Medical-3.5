/**
 * 🪝 HOOK DE INVENTARIO V2
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '../services/inventarioService';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';
import type {
  Producto,
  CreateProductoInput,
  UpdateStockInput,
  InventarioFilters,
  InventarioStats,
} from '../types/inventario.types';

const QUERY_KEYS = {
  all: ['inventario'] as const,
  lists: (empresaId: string) => [...QUERY_KEYS.all, 'list', empresaId] as const,
  list: (empresaId: string, filters: InventarioFilters) =>
    [...QUERY_KEYS.lists(empresaId), filters] as const,
  bajoStock: (empresaId: string) => [...QUERY_KEYS.all, 'bajo-stock', empresaId] as const,
  stats: (empresaId: string) => [...QUERY_KEYS.all, 'stats', empresaId] as const,
  detail: (empresaId: string, id: string) =>
    [...QUERY_KEYS.all, 'detail', empresaId, id] as const,
  movimientos: (empresaId: string, productoId: string) =>
    [...QUERY_KEYS.all, 'movimientos', empresaId, productoId] as const,
};

export function useInventario() {
  const { user, empresaId } = useAuthContext();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<InventarioFilters>({});

  // Query: Productos
  const productosQuery = useQuery<Producto[], Error>({
    queryKey: QUERY_KEYS.list(empresaId, filters),
    queryFn: () => inventarioService.getProductos(empresaId, filters),
    staleTime: 5 * 60 * 1000,
    enabled: !!empresaId,
  });

  // Query: Productos con bajo stock
  const bajoStockQuery = useQuery<Producto[], Error>({
    queryKey: QUERY_KEYS.bajoStock(empresaId),
    queryFn: () => inventarioService.getProductosBajoStock(empresaId),
    staleTime: 1 * 60 * 1000,
    enabled: !!empresaId,
  });

  // Query: Stats
  const statsQuery = useQuery<InventarioStats, Error>({
    queryKey: QUERY_KEYS.stats(empresaId),
    queryFn: () => inventarioService.getStats(empresaId),
    staleTime: 5 * 60 * 1000,
    enabled: !!empresaId,
  });

  // Mutation: Crear producto
  const createMutation = useMutation<Producto, Error, CreateProductoInput>({
    mutationFn: (input) =>
      inventarioService.createProducto(input, empresaId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(empresaId) });
    },
  });

  // Mutation: Actualizar stock
  const updateStockMutation = useMutation<void, Error, UpdateStockInput>({
    mutationFn: (input) =>
      inventarioService.updateStock(input, empresaId, user!.id),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bajoStock(empresaId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(empresaId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.movimientos(empresaId, input.productoId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(empresaId, input.productoId),
      });
    },
  });

  // Handlers
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  const setTipoFilter = useCallback((tipo: string | undefined) => {
    setFilters((prev) => ({ ...prev, tipo: tipo as any }));
  }, []);

  const setBajoStockFilter = useCallback((activo: boolean) => {
    setFilters((prev) => ({ ...prev, bajoStock: activo || undefined }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Entrada de inventario
  const entradaInventario = useCallback(
    (productoId: string, cantidad: number, motivo: string) => {
      return updateStockMutation.mutate({
        productoId,
        cantidad,
        tipo: 'entrada',
        motivo,
      });
    },
    [updateStockMutation]
  );

  // Salida de inventario
  const salidaInventario = useCallback(
    (productoId: string, cantidad: number, motivo: string) => {
      return updateStockMutation.mutate({
        productoId,
        cantidad,
        tipo: 'salida',
        motivo,
      });
    },
    [updateStockMutation]
  );

  return {
    // Datos
    productos: productosQuery.data ?? [],
    productosBajoStock: bajoStockQuery.data ?? [],
    stats: statsQuery.data,
    filters,
    
    // Loading
    isLoading: productosQuery.isLoading,
    isLoadingBajoStock: bajoStockQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    
    // Acciones
    setSearch,
    setTipoFilter,
    setBajoStockFilter,
    clearFilters,
    create: createMutation.mutate,
    entradaInventario,
    salidaInventario,
    
    // Loading mutations
    isCreating: createMutation.isPending,
    isUpdatingStock: updateStockMutation.isPending,
    
    // Refetch
    refetch: productosQuery.refetch,
  };
}
