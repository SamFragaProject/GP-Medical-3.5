// =====================================================
// SERVICIO: Finanzas — KPIs Globales de Administración
// GPMedical ERP Pro
// =====================================================

import { supabase } from '@/lib/supabase';
import { billingService } from './billingService';
import { cxcService } from './cxcService';
import { costeoService } from './costeoService';

export const finanzasService = {
    /**
     * Obtener resumen global para el Dashboard de Finanzas
     */
    async obtenerResumenGlobal() {
        try {
            const [cfdis, aging, costeo] = await Promise.all([
                supabase.from('facturacion_cfdis').select('total, estado, fecha_emision'),
                cxcService.obtenerAgingResumen(),
                costeoService.obtenerResumen(),
            ]);

            const facturasHoy = (cfdis.data || []).filter(f =>
                new Date(f.fecha_emision).toDateString() === new Date().toDateString()
            );

            const totalFacturadoMes = (cfdis.data || [])
                .filter(f => f.estado === 'timbrada' && new Date(f.fecha_emision).getMonth() === new Date().getMonth())
                .reduce((sum, f) => sum + (f.total || 0), 0);

            return {
                facturacion: {
                    total_hoy: facturasHoy.reduce((sum, f) => sum + (f.total || 0), 0),
                    count_hoy: facturasHoy.length,
                    total_mes: totalFacturadoMes,
                    timbradas: (cfdis.data || []).filter(f => f.estado === 'timbrada').length,
                    borradores: (cfdis.data || []).filter(f => f.estado === 'borrador').length,
                },
                cobranza: {
                    total_cartera: aging.total_saldo,
                    vencido: aging.total_vencido,
                    porcentaje_recuperacion: aging.porcentaje_cobranza,
                },
                rentabilidad: {
                    margen_promedio: costeo.margen_promedio,
                    costo_promedio: costeo.costo_promedio_paciente,
                    empresa_top: costeo.empresa_mayor_margen,
                }
            };
        } catch (e) {
            console.error('Error en resumen global finanzas:', e);
            return null;
        }
    },

    /**
     * Conciliación de ingresos por categoría de servicio
     */
    async obtenerIngresosPorCategoria() {
        try {
            const { data, error } = await supabase
                .from('facturacion_conceptos')
                .select(`
          importe,
          descripcion,
          clave_prod_serv,
          cfdi:facturacion_cfdis(estado, fecha_emision)
        `)
                .eq('cfdi.estado', 'timbrada');

            if (error) throw error;

            // Categorizar por clave SAT o descripción (Heurística simple)
            const categorias = {
                consultas: 0,
                laboratorio: 0,
                imagen: 0,
                estudios_esp: 0,
                checkups: 0,
                otros: 0
            };

            (data || []).forEach((c: any) => {
                const desc = c.descripcion.toLowerCase();
                const clave = c.clave_prod_serv;

                if (clave?.startsWith('8512') || desc.includes('consulta') || desc.includes('medico')) {
                    categorias.consultas += c.importe;
                } else if (clave?.startsWith('851315') || desc.includes('lab') || desc.includes('analisis')) {
                    categorias.laboratorio += c.importe;
                } else if (clave?.startsWith('851317') || desc.includes('rx') || desc.includes('imagen') || desc.includes('rayos')) {
                    categorias.imagen += c.importe;
                } else if (desc.includes('checkup') || desc.includes('paquete') || desc.includes('campaña')) {
                    categorias.checkups += c.importe;
                } else if (desc.includes('audiometria') || desc.includes('espirometria') || desc.includes('electro')) {
                    categorias.estudios_esp += c.importe;
                } else {
                    categorias.otros += c.importe;
                }
            });

            return Object.entries(categorias).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }));
        } catch (e) {
            console.error('Error en conciliación de ingresos:', e);
            return [];
        }
    }
};
