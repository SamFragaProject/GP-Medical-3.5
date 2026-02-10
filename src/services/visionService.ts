// =====================================================
// SERVICIO: Estudios Visuales - GPMedical ERP Pro
// =====================================================

import { supabase } from '@/lib/supabase';
import {
    clasificarVision,
    type EstudioVisual,
    type CrearEstudioVisualDTO,
    type FiltrosVision,
} from '@/types/vision';

export const visionService = {

    async listar(filtros: FiltrosVision = {}): Promise<EstudioVisual[]> {
        let query = supabase
            .from('estudios_visuales')
            .select(`*, paciente:pacientes(id, nombre, apellido_paterno)`)
            .order('fecha_estudio', { ascending: false });

        if (filtros.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros.paciente_id) query = query.eq('paciente_id', filtros.paciente_id);
        if (filtros.clasificacion) query = query.eq('clasificacion', filtros.clasificacion);
        if (filtros.fecha_desde) query = query.gte('fecha_estudio', filtros.fecha_desde);
        if (filtros.fecha_hasta) query = query.lte('fecha_estudio', filtros.fecha_hasta);

        const { data, error } = await query;
        if (error) throw new Error(`Error listando estudios visuales: ${error.message}`);
        return data || [];
    },

    async obtener(id: string): Promise<EstudioVisual | null> {
        const { data, error } = await supabase
            .from('estudios_visuales')
            .select(`*, paciente:pacientes(id, nombre, apellido_paterno)`)
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },

    async crear(dto: CrearEstudioVisualDTO): Promise<EstudioVisual> {
        const { data: userData } = await supabase.auth.getUser();

        // Classify vision
        const clasificacion = clasificarVision(
            dto.od_sin_correccion < dto.oi_sin_correccion ? dto.oi_sin_correccion : dto.od_sin_correccion,
            dto.od_con_correccion || dto.oi_con_correccion,
        );

        // Determine Ishihara result
        const ishiharaRatio = dto.ishihara_placas_total > 0
            ? dto.ishihara_placas_correctas / dto.ishihara_placas_total
            : 1;
        const ishihara_resultado = ishiharaRatio >= 0.85
            ? 'normal' as const
            : 'daltonismo_rojo_verde' as const;

        // Determine aptitude
        const apto = clasificacion === 'normal' || clasificacion === 'deficiencia_leve';

        // Restrictions
        const restricciones: string[] = [];
        if (clasificacion !== 'normal') restricciones.push('Requiere evaluación oftalmológica');
        if (ishihara_resultado !== 'normal') restricciones.push('No apto para actividades que requieran discriminación cromática');
        if (dto.usa_lentes) restricciones.push('Debe usar lentes correctivos durante su jornada laboral');

        const { data, error } = await supabase
            .from('estudios_visuales')
            .insert({
                empresa_id: dto.empresa_id,
                paciente_id: dto.paciente_id,
                od_sin_correccion: dto.od_sin_correccion,
                od_con_correccion: dto.od_con_correccion,
                oi_sin_correccion: dto.oi_sin_correccion,
                oi_con_correccion: dto.oi_con_correccion,
                ishihara_placas_total: dto.ishihara_placas_total,
                ishihara_placas_correctas: dto.ishihara_placas_correctas,
                ishihara_resultado,
                campimetria_realizada: dto.campimetria_realizada,
                estereopsis_segundos_arco: dto.estereopsis_segundos_arco,
                estereopsis_normal: dto.estereopsis_segundos_arco ? dto.estereopsis_segundos_arco <= 60 : undefined,
                usa_lentes: dto.usa_lentes,
                tipo_lentes: dto.tipo_lentes,
                clasificacion,
                apto_para_puesto: apto,
                restricciones,
                observaciones: dto.observaciones,
                referencia_oftalmologo: dto.referencia_oftalmologo,
                episodio_id: dto.episodio_id,
                campania_id: dto.campania_id,
                realizado_por: userData.user?.id || '',
                fecha_estudio: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (error) throw new Error(`Error creando estudio visual: ${error.message}`);
        return { ...data, paciente: undefined };
    },

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase.from('estudios_visuales').delete().eq('id', id);
        if (error) throw new Error(`Error eliminando: ${error.message}`);
    },

    async obtenerResumen(empresaId?: string): Promise<{
        total: number;
        normales: number;
        con_deficiencia: number;
        usan_lentes: number;
        daltonismo: number;
    }> {
        let query = supabase.from('estudios_visuales').select('clasificacion, usa_lentes, ishihara_resultado');
        if (empresaId) query = query.eq('empresa_id', empresaId);

        const { data } = await query;
        const estudios = data || [];
        return {
            total: estudios.length,
            normales: estudios.filter(e => e.clasificacion === 'normal').length,
            con_deficiencia: estudios.filter(e => e.clasificacion !== 'normal').length,
            usan_lentes: estudios.filter(e => e.usa_lentes).length,
            daltonismo: estudios.filter(e => e.ishihara_resultado !== 'normal').length,
        };
    },
};

export default visionService;
