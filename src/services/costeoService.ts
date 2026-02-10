// =====================================================
// SERVICIO: Costeo por Paciente - GPMedical ERP Pro
// Costo real por paciente + margen por empresa
// =====================================================

import { supabase } from '@/lib/supabase';

// =====================================================
// TIPOS
// =====================================================

export interface CostoPaciente {
    id: string;
    paciente_id: string;
    empresa_id: string;
    campania_id?: string;
    paciente_nombre?: string;
    empresa_nombre?: string;

    // Costos desglosados
    costo_consulta: number;
    costo_laboratorio: number;
    costo_imagen: number;
    costo_audiometria: number;
    costo_espirometria: number;
    costo_vision: number;
    costo_medicamentos: number;
    costo_otros: number;
    costo_total: number;

    // Precio facturado y margen
    precio_facturado: number;
    margen: number;
    margen_porcentaje: number;

    fecha_calculo: string;
    created_at: string;
}

export interface MargenEmpresa {
    empresa_id: string;
    empresa_nombre: string;
    total_pacientes: number;
    costo_total: number;
    ingreso_total: number;
    margen_total: number;
    margen_porcentaje: number;
}

export interface ResumenCosteo {
    total_empresas: number;
    total_pacientes: number;
    costo_promedio_paciente: number;
    margen_promedio: number;
    empresa_mayor_margen: string;
    empresa_menor_margen: string;
    costos_por_servicio: {
        servicio: string;
        total: number;
        porcentaje: number;
    }[];
}

// =====================================================
// CATÁLOGO DE COSTOS BASE
// =====================================================

export const COSTOS_BASE: Record<string, number> = {
    consulta_general: 350,
    consulta_especialidad: 600,
    laboratorio_basico: 280,
    laboratorio_completo: 650,
    rx_torax: 180,
    audiometria: 120,
    espirometria: 150,
    vision: 100,
    ekg: 200,
    prueba_esfuerzo: 800,
    medicamento_receta: 50, // promedio
};

// =====================================================
// SERVICIO
// =====================================================

export const costeoService = {

    /**
     * Calcular costo de un paciente específico
     */
    async calcularCostoPaciente(
        paciente_id: string,
        empresa_id: string,
        desglose: Partial<CostoPaciente>,
        precio_facturado: number
    ): Promise<CostoPaciente | null> {
        const costo_total = (desglose.costo_consulta || 0)
            + (desglose.costo_laboratorio || 0)
            + (desglose.costo_imagen || 0)
            + (desglose.costo_audiometria || 0)
            + (desglose.costo_espirometria || 0)
            + (desglose.costo_vision || 0)
            + (desglose.costo_medicamentos || 0)
            + (desglose.costo_otros || 0);

        const margen = precio_facturado - costo_total;
        const margen_porcentaje = precio_facturado > 0
            ? Math.round((margen / precio_facturado) * 100)
            : 0;

        const registro = {
            paciente_id,
            empresa_id,
            campania_id: desglose.campania_id || null,
            costo_consulta: desglose.costo_consulta || 0,
            costo_laboratorio: desglose.costo_laboratorio || 0,
            costo_imagen: desglose.costo_imagen || 0,
            costo_audiometria: desglose.costo_audiometria || 0,
            costo_espirometria: desglose.costo_espirometria || 0,
            costo_vision: desglose.costo_vision || 0,
            costo_medicamentos: desglose.costo_medicamentos || 0,
            costo_otros: desglose.costo_otros || 0,
            costo_total,
            precio_facturado,
            margen,
            margen_porcentaje,
            fecha_calculo: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('costeo_paciente')
            .insert(registro)
            .select()
            .single();

        if (error) { console.error('Error calculando costeo:', error); return null; }
        return data as CostoPaciente;
    },

    /**
     * Obtener margen por empresa
     */
    async obtenerMargenEmpresas(): Promise<MargenEmpresa[]> {
        const { data: empresas } = await supabase
            .from('empresas')
            .select('id, nombre');
        if (!empresas) return [];

        const resultados: MargenEmpresa[] = [];

        for (const emp of empresas) {
            const { data: costeos } = await supabase
                .from('costeo_paciente')
                .select('costo_total, precio_facturado, margen')
                .eq('empresa_id', emp.id);

            if (!costeos || costeos.length === 0) continue;

            const costo_total = costeos.reduce((s, c) => s + c.costo_total, 0);
            const ingreso_total = costeos.reduce((s, c) => s + c.precio_facturado, 0);
            const margen_total = costeos.reduce((s, c) => s + c.margen, 0);

            resultados.push({
                empresa_id: emp.id,
                empresa_nombre: emp.nombre,
                total_pacientes: costeos.length,
                costo_total,
                ingreso_total,
                margen_total,
                margen_porcentaje: ingreso_total > 0
                    ? Math.round((margen_total / ingreso_total) * 100) : 0,
            });
        }

        return resultados.sort((a, b) => b.margen_total - a.margen_total);
    },

    /**
     * Resumen global de costeo
     */
    async obtenerResumen(): Promise<ResumenCosteo> {
        const margenes = await this.obtenerMargenEmpresas();

        const total_pacientes = margenes.reduce((s, m) => s + m.total_pacientes, 0);
        const costo_total = margenes.reduce((s, m) => s + m.costo_total, 0);
        const ingreso_total = margenes.reduce((s, m) => s + m.ingreso_total, 0);

        const { data: desglose } = await supabase
            .from('costeo_paciente')
            .select('costo_consulta, costo_laboratorio, costo_imagen, costo_audiometria, costo_espirometria, costo_vision, costo_medicamentos, costo_otros');

        const servicios = [
            { servicio: 'Consultas', total: 0 },
            { servicio: 'Laboratorio', total: 0 },
            { servicio: 'Imagen', total: 0 },
            { servicio: 'Audiometría', total: 0 },
            { servicio: 'Espirometría', total: 0 },
            { servicio: 'Visión', total: 0 },
            { servicio: 'Medicamentos', total: 0 },
            { servicio: 'Otros', total: 0 },
        ];

        if (desglose) {
            for (const d of desglose) {
                servicios[0].total += d.costo_consulta || 0;
                servicios[1].total += d.costo_laboratorio || 0;
                servicios[2].total += d.costo_imagen || 0;
                servicios[3].total += d.costo_audiometria || 0;
                servicios[4].total += d.costo_espirometria || 0;
                servicios[5].total += d.costo_vision || 0;
                servicios[6].total += d.costo_medicamentos || 0;
                servicios[7].total += d.costo_otros || 0;
            }
        }

        const totalCostoInt = servicios.reduce((s, sv) => s + sv.total, 0);

        return {
            total_empresas: margenes.length,
            total_pacientes,
            costo_promedio_paciente: total_pacientes > 0 ? Math.round(costo_total / total_pacientes) : 0,
            margen_promedio: ingreso_total > 0 ? Math.round(((ingreso_total - costo_total) / ingreso_total) * 100) : 0,
            empresa_mayor_margen: margenes[0]?.empresa_nombre || '—',
            empresa_menor_margen: margenes[margenes.length - 1]?.empresa_nombre || '—',
            costos_por_servicio: servicios.map(sv => ({
                ...sv,
                porcentaje: totalCostoInt > 0 ? Math.round((sv.total / totalCostoInt) * 100) : 0,
            })),
        };
    },

    /**
     * Listar costeos por empresa
     */
    async listarPorEmpresa(empresa_id: string): Promise<CostoPaciente[]> {
        const { data } = await supabase
            .from('costeo_paciente')
            .select('*, paciente:pacientes(nombre, apellido_paterno), empresa:empresas(nombre)')
            .eq('empresa_id', empresa_id)
            .order('created_at', { ascending: false });
        return (data || []) as CostoPaciente[];
    },
};

export default costeoService;
