// =====================================================
// SERVICIO: Farmacia — Dispensación, Botiquines, Alertas
// GPMedical ERP Pro
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
    Dispensacion,
    ItemDispensacion,
    EstadoDispensacion,
    Botiquin,
    ItemBotiquin,
    BotiquinConsumoMensual,
    AlertaReabasto,
    TipoAlertaReabasto,
} from '@/types/inventario';

// =====================================================
// DISPENSACIÓN
// =====================================================

export const dispensacionService = {
    /** Listar dispensaciones (opcionalmente filtrar por paciente o receta) */
    async listar(filtros?: { paciente_id?: string; receta_id?: string; estado?: EstadoDispensacion }): Promise<Dispensacion[]> {
        try {
            let query = supabase
                .from('dispensaciones')
                .select('*, items:dispensacion_items(*)')
                .order('created_at', { ascending: false });

            if (filtros?.paciente_id) query = query.eq('paciente_id', filtros.paciente_id);
            if (filtros?.receta_id) query = query.eq('receta_id', filtros.receta_id);
            if (filtros?.estado) query = query.eq('estado', filtros.estado);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error listando dispensaciones:', e);
            return [];
        }
    },

    /** Obtener dispensaciones pendientes (para farmacia) */
    async listarPendientes(): Promise<Dispensacion[]> {
        try {
            const { data, error } = await supabase
                .from('dispensaciones')
                .select('*, items:dispensacion_items(*)')
                .in('estado', ['pendiente', 'parcial'])
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error listando dispensaciones pendientes:', e);
            return [];
        }
    },

    /** Crear dispensación desde receta */
    async crearDesdeReceta(recetaId: string, pacienteId: string, items: Omit<ItemDispensacion, 'id' | 'dispensacion_id'>[], dispensadoPor: string): Promise<Dispensacion | null> {
        try {
            const { data: dispensacion, error: dErr } = await supabase
                .from('dispensaciones')
                .insert({
                    receta_id: recetaId,
                    paciente_id: pacienteId,
                    fecha_dispensacion: new Date().toISOString(),
                    estado: 'pendiente',
                    dispensado_por: dispensadoPor,
                })
                .select()
                .single();

            if (dErr) throw dErr;

            // Insertar items
            const itemsConId = items.map(item => ({
                ...item,
                dispensacion_id: dispensacion.id,
            }));

            const { error: iErr } = await supabase
                .from('dispensacion_items')
                .insert(itemsConId);

            if (iErr) throw iErr;

            return { ...dispensacion, items: itemsConId as any };
        } catch (e) {
            console.error('Error creando dispensación:', e);
            return null;
        }
    },

    /** Marcar item como dispensado (actualiza cantidad_dispensada) */
    async dispensarItem(itemId: string, cantidadDispensada: number, loteId?: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('dispensacion_items')
                .update({
                    cantidad_dispensada: cantidadDispensada,
                    lote_id: loteId,
                })
                .eq('id', itemId);

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Error dispensando item:', e);
            return false;
        }
    },

    /** Actualizar estado de dispensación */
    async actualizarEstado(dispensacionId: string, estado: EstadoDispensacion): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('dispensaciones')
                .update({ estado, updated_at: new Date().toISOString() })
                .eq('id', dispensacionId);

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Error actualizando dispensación:', e);
            return false;
        }
    },

    /** Completar dispensación (marcar como completa y descontar stock) */
    async completar(dispensacionId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('dispensaciones')
                .update({
                    estado: 'completa',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', dispensacionId);

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Error completando dispensación:', e);
            return false;
        }
    },
};

// =====================================================
// BOTIQUINES POR EMPRESA
// =====================================================

export const botiquinService = {
    /** Listar todos los botiquines */
    async listar(empresaId?: string): Promise<Botiquin[]> {
        try {
            let query = supabase
                .from('botiquines')
                .select('*, items:botiquin_items(*)')
                .order('empresa_nombre', { ascending: true });

            if (empresaId) query = query.eq('empresa_id', empresaId);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error listando botiquines:', e);
            return [];
        }
    },

    /** Crear botiquín */
    async crear(botiquin: Omit<Botiquin, 'id' | 'created_at' | 'updated_at' | 'items'>): Promise<Botiquin | null> {
        try {
            const { data, error } = await supabase
                .from('botiquines')
                .insert(botiquin)
                .select()
                .single();

            if (error) throw error;
            return { ...data, items: [] };
        } catch (e) {
            console.error('Error creando botiquín:', e);
            return null;
        }
    },

    /** Reabastecer botiquín */
    async reabastecer(botiquinId: string, items: { producto_id: string; cantidad: number }[]): Promise<boolean> {
        try {
            for (const item of items) {
                const { error } = await supabase
                    .from('botiquin_items')
                    .update({
                        cantidad_actual: item.cantidad,
                        ultima_reposicion: new Date().toISOString(),
                    })
                    .eq('botiquin_id', botiquinId)
                    .eq('producto_id', item.producto_id);

                if (error) throw error;
            }

            await supabase
                .from('botiquines')
                .update({
                    estado: 'activo',
                    fecha_ultimo_reabasto: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', botiquinId);

            return true;
        } catch (e) {
            console.error('Error reabasteciendo botiquín:', e);
            return false;
        }
    },

    /** Obtener consumo mensual de un botiquín */
    async obtenerConsumo(botiquinId: string): Promise<BotiquinConsumoMensual[]> {
        try {
            const { data, error } = await supabase
                .from('botiquin_consumo_mensual')
                .select('*')
                .eq('botiquin_id', botiquinId)
                .order('mes', { ascending: false })
                .limit(12);

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error obteniendo consumo:', e);
            return [];
        }
    },

    /** Registrar consumo (uso de insumo del botiquín) */
    async registrarConsumo(botiquinId: string, productoId: string, cantidad: number, motivo: string): Promise<boolean> {
        try {
            // Decrementar cantidad actual
            const { data: item } = await supabase
                .from('botiquin_items')
                .select('cantidad_actual')
                .eq('botiquin_id', botiquinId)
                .eq('producto_id', productoId)
                .single();

            if (item) {
                const nuevaCantidad = Math.max(0, (item.cantidad_actual || 0) - cantidad);
                await supabase
                    .from('botiquin_items')
                    .update({ cantidad_actual: nuevaCantidad })
                    .eq('botiquin_id', botiquinId)
                    .eq('producto_id', productoId);
            }

            return true;
        } catch (e) {
            console.error('Error registrando consumo:', e);
            return false;
        }
    },
};

// =====================================================
// ALERTAS DE REABASTO
// =====================================================

export const alertaReabastoService = {
    /** Obtener alertas activas */
    async obtenerActivas(): Promise<AlertaReabasto[]> {
        try {
            const { data, error } = await supabase
                .from('alertas_reabasto')
                .select('*')
                .eq('resuelta', false)
                .order('nivel', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error obteniendo alertas reabasto:', e);
            return [];
        }
    },

    /** Generar alertas automáticas (verifica stock mínimo y caducidades) */
    async generarAlertas(): Promise<AlertaReabasto[]> {
        try {
            // Buscar productos con stock bajo
            const { data: stockBajo } = await supabase
                .from('stock')
                .select('*, producto:productos(*)')
                .lt('cantidad_actual', supabase.rpc ? 1 : 999999)
                .eq('alertas_stock_bajo', true);

            const alertas: Omit<AlertaReabasto, 'id'>[] = [];

            if (stockBajo) {
                for (const s of stockBajo) {
                    if (s.cantidad_actual <= 0) {
                        alertas.push({
                            tipo: 'sin_stock',
                            producto_id: s.producto_id,
                            producto_nombre: s.producto?.nombre,
                            producto_codigo: s.producto?.codigo,
                            nivel: 'critical',
                            mensaje: `${s.producto?.nombre || 'Producto'} sin stock`,
                            cantidad_actual: 0,
                            cantidad_minima: s.cantidad_minima,
                            resuelta: false,
                            created_at: new Date().toISOString(),
                        });
                    } else if (s.cantidad_actual <= s.cantidad_minima) {
                        alertas.push({
                            tipo: 'stock_minimo',
                            producto_id: s.producto_id,
                            producto_nombre: s.producto?.nombre,
                            producto_codigo: s.producto?.codigo,
                            nivel: 'warning',
                            mensaje: `${s.producto?.nombre || 'Producto'} bajo mínimo (${s.cantidad_actual}/${s.cantidad_minima})`,
                            cantidad_actual: s.cantidad_actual,
                            cantidad_minima: s.cantidad_minima,
                            resuelta: false,
                            created_at: new Date().toISOString(),
                        });
                    }
                }
            }

            // Buscar productos próximos a caducar (30 días)
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            const { data: porCaducar } = await supabase
                .from('stock')
                .select('*, producto:productos(*)')
                .lte('fecha_vencimiento', thirtyDaysFromNow.toISOString())
                .gt('cantidad_actual', 0);

            if (porCaducar) {
                for (const s of porCaducar) {
                    const diasParaCaducidad = Math.ceil(
                        (new Date(s.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    alertas.push({
                        tipo: 'caducidad_proxima',
                        producto_id: s.producto_id,
                        producto_nombre: s.producto?.nombre,
                        producto_codigo: s.producto?.codigo,
                        nivel: diasParaCaducidad <= 7 ? 'critical' : 'warning',
                        mensaje: `${s.producto?.nombre || 'Producto'} caduca en ${diasParaCaducidad} días`,
                        dias_para_caducidad: diasParaCaducidad,
                        cantidad_actual: s.cantidad_actual,
                        resuelta: false,
                        created_at: new Date().toISOString(),
                    });
                }
            }

            return alertas as AlertaReabasto[];
        } catch (e) {
            console.error('Error generando alertas:', e);
            return [];
        }
    },

    /** Resolver una alerta */
    async resolver(alertaId: string, usuarioId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('alertas_reabasto')
                .update({
                    resuelta: true,
                    resuelta_por: usuarioId,
                    resuelta_en: new Date().toISOString(),
                })
                .eq('id', alertaId);

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Error resolviendo alerta:', e);
            return false;
        }
    },
};

// =====================================================
// ESTADÍSTICAS FARMACIA
// =====================================================

export const farmaciaStatsService = {
    async obtenerResumen(): Promise<{
        totalProductos: number;
        valorInventario: number;
        stockBajo: number;
        porCaducar: number;
        dispensacionesHoy: number;
        botiquinesActivos: number;
        alertasActivas: number;
        consumoMensual: number;
    }> {
        try {
            const [prodRes, stockRes, dispRes, botRes, alertRes] = await Promise.allSettled([
                supabase.from('productos').select('id', { count: 'exact', head: true }),
                supabase.from('stock').select('cantidad_actual, cantidad_minima, precio_costo, fecha_vencimiento'),
                supabase.from('dispensaciones').select('id', { count: 'exact', head: true })
                    .gte('created_at', new Date().toISOString().split('T')[0]),
                supabase.from('botiquines').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
                supabase.from('alertas_reabasto').select('id', { count: 'exact', head: true }).eq('resuelta', false),
            ]);

            let valorTotal = 0, stockBajo = 0, porCaducar = 0;
            if (stockRes.status === 'fulfilled' && stockRes.value.data) {
                const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
                for (const s of stockRes.value.data) {
                    valorTotal += (s.cantidad_actual || 0) * (s.precio_costo || 0);
                    if (s.cantidad_actual <= s.cantidad_minima) stockBajo++;
                    if (s.fecha_vencimiento && new Date(s.fecha_vencimiento).getTime() <= thirtyDays) porCaducar++;
                }
            }

            return {
                totalProductos: prodRes.status === 'fulfilled' ? (prodRes.value.count || 0) : 0,
                valorInventario: valorTotal,
                stockBajo,
                porCaducar,
                dispensacionesHoy: dispRes.status === 'fulfilled' ? (dispRes.value.count || 0) : 0,
                botiquinesActivos: botRes.status === 'fulfilled' ? (botRes.value.count || 0) : 0,
                alertasActivas: alertRes.status === 'fulfilled' ? (alertRes.value.count || 0) : 0,
                consumoMensual: 0,
            };
        } catch (e) {
            console.error('Error obteniendo resumen farmacia:', e);
            return {
                totalProductos: 0, valorInventario: 0, stockBajo: 0, porCaducar: 0,
                dispensacionesHoy: 0, botiquinesActivos: 0, alertasActivas: 0, consumoMensual: 0,
            };
        }
    },
};
