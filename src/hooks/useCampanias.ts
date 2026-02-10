// =====================================================
// HOOK: useCampanias - GPMedical ERP Pro
// =====================================================
// Hook reactivo para gestión de campañas masivas
// Con estados, filtros, y métricas en tiempo real.
// =====================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { campaniaService } from '@/services/campaniaService';
import type {
    Campania,
    TrabajadorPadron,
    MetricasCampania,
    FiltrosCampania,
    FiltrosTrabajadorPadron,
    CrearCampaniaDTO,
    ActualizarCampaniaDTO,
    ImportarPadronDTO,
    EstadoCampania,
} from '@/types/campania';

interface UseCampaniasOptions {
    empresaId?: string;
    autoLoad?: boolean;
}

interface UseCampaniasReturn {
    // Data
    campanias: Campania[];
    campaniaActiva: Campania | null;
    padron: TrabajadorPadron[];
    metricas: MetricasCampania | null;
    // Estado
    loading: boolean;
    loadingPadron: boolean;
    error: string | null;
    // Filtros
    filtros: FiltrosCampania;
    filtrosPadron: FiltrosTrabajadorPadron;
    setFiltros: (filtros: FiltrosCampania) => void;
    setFiltrosPadron: (filtros: FiltrosTrabajadorPadron) => void;
    // Acciones CRUD
    cargarCampanias: () => Promise<void>;
    crearCampania: (dto: CrearCampaniaDTO) => Promise<Campania>;
    actualizarCampania: (id: string, dto: ActualizarCampaniaDTO) => Promise<void>;
    eliminarCampania: (id: string) => Promise<void>;
    cambiarEstado: (id: string, estado: EstadoCampania) => Promise<void>;
    // Selección
    seleccionarCampania: (id: string) => Promise<void>;
    deseleccionar: () => void;
    // Padrón
    cargarPadron: (campaniaId: string) => Promise<void>;
    importarPadron: (dto: ImportarPadronDTO) => Promise<{ insertados: number; errores: string[] }>;
    eliminarTrabajador: (id: string) => Promise<void>;
    // Métricas
    cargarMetricas: (campaniaId: string) => Promise<void>;
}

export function useCampanias(options: UseCampaniasOptions = {}): UseCampaniasReturn {
    const { empresaId, autoLoad = true } = options;

    // State
    const [campanias, setCampanias] = useState<Campania[]>([]);
    const [campaniaActiva, setCampaniaActiva] = useState<Campania | null>(null);
    const [padron, setPadron] = useState<TrabajadorPadron[]>([]);
    const [metricas, setMetricas] = useState<MetricasCampania | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingPadron, setLoadingPadron] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<FiltrosCampania>({});
    const [filtrosPadron, setFiltrosPadron] = useState<FiltrosTrabajadorPadron>({});

    // =====================================================
    // CAMPAÑAS
    // =====================================================

    const cargarCampanias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const allFiltros = { ...filtros };
            if (empresaId) allFiltros.empresa_id = empresaId;
            const data = await campaniaService.listar(allFiltros);
            setCampanias(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando campañas');
        } finally {
            setLoading(false);
        }
    }, [filtros, empresaId]);

    const crearCampania = useCallback(async (dto: CrearCampaniaDTO): Promise<Campania> => {
        try {
            const nueva = await campaniaService.crear(dto);
            setCampanias(prev => [nueva, ...prev]);
            return nueva;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creando campaña');
            throw err;
        }
    }, []);

    const actualizarCampania = useCallback(async (id: string, dto: ActualizarCampaniaDTO) => {
        try {
            const updated = await campaniaService.actualizar(id, dto);
            setCampanias(prev => prev.map(c => c.id === id ? updated : c));
            if (campaniaActiva?.id === id) setCampaniaActiva(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error actualizando campaña');
            throw err;
        }
    }, [campaniaActiva]);

    const eliminarCampania = useCallback(async (id: string) => {
        try {
            await campaniaService.eliminar(id);
            setCampanias(prev => prev.filter(c => c.id !== id));
            if (campaniaActiva?.id === id) {
                setCampaniaActiva(null);
                setPadron([]);
                setMetricas(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error eliminando campaña');
            throw err;
        }
    }, [campaniaActiva]);

    const cambiarEstado = useCallback(async (id: string, estado: EstadoCampania) => {
        try {
            await campaniaService.cambiarEstado(id, estado);
            setCampanias(prev =>
                prev.map(c => c.id === id ? { ...c, estado } : c)
            );
            if (campaniaActiva?.id === id) {
                setCampaniaActiva(prev => prev ? { ...prev, estado } : null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cambiando estado');
            throw err;
        }
    }, [campaniaActiva]);

    // =====================================================
    // SELECCIÓN
    // =====================================================

    const seleccionarCampania = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const campania = await campaniaService.obtener(id);
            setCampaniaActiva(campania);
            if (campania) {
                await Promise.all([
                    cargarPadron(campania.id),
                    cargarMetricas(campania.id),
                ]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando campaña');
        } finally {
            setLoading(false);
        }
    }, []);

    const deseleccionar = useCallback(() => {
        setCampaniaActiva(null);
        setPadron([]);
        setMetricas(null);
    }, []);

    // =====================================================
    // PADRÓN
    // =====================================================

    const cargarPadron = useCallback(async (campaniaId: string) => {
        setLoadingPadron(true);
        try {
            const data = await campaniaService.obtenerPadron(campaniaId, filtrosPadron);
            setPadron(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando padrón');
        } finally {
            setLoadingPadron(false);
        }
    }, [filtrosPadron]);

    const importarPadron = useCallback(
        async (dto: ImportarPadronDTO): Promise<{ insertados: number; errores: string[] }> => {
            const result = await campaniaService.importarPadron(dto);
            if (campaniaActiva) {
                await cargarPadron(campaniaActiva.id);
                await cargarMetricas(campaniaActiva.id);
            }
            return result;
        },
        [campaniaActiva, cargarPadron]
    );

    const eliminarTrabajador = useCallback(async (id: string) => {
        if (!campaniaActiva) return;
        try {
            await campaniaService.eliminarTrabajador(id, campaniaActiva.id);
            setPadron(prev => prev.filter(t => t.id !== id));
            await cargarMetricas(campaniaActiva.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error eliminando trabajador');
        }
    }, [campaniaActiva]);

    // =====================================================
    // MÉTRICAS
    // =====================================================

    const cargarMetricas = useCallback(async (campaniaId: string) => {
        try {
            const data = await campaniaService.obtenerMetricas(campaniaId);
            setMetricas(data);
        } catch (err) {
            console.error('Error cargando métricas:', err);
        }
    }, []);

    // =====================================================
    // EFECTOS
    // =====================================================

    useEffect(() => {
        if (autoLoad) {
            cargarCampanias();
        }
    }, [autoLoad, cargarCampanias]);

    // Recargar padrón cuando cambian filtros
    useEffect(() => {
        if (campaniaActiva) {
            cargarPadron(campaniaActiva.id);
        }
    }, [filtrosPadron, campaniaActiva?.id]);

    return {
        campanias,
        campaniaActiva,
        padron,
        metricas,
        loading,
        loadingPadron,
        error,
        filtros,
        filtrosPadron,
        setFiltros,
        setFiltrosPadron,
        cargarCampanias,
        crearCampania,
        actualizarCampania,
        eliminarCampania,
        cambiarEstado,
        seleccionarCampania,
        deseleccionar,
        cargarPadron,
        importarPadron,
        eliminarTrabajador,
        cargarMetricas,
    };
}

export default useCampanias;
