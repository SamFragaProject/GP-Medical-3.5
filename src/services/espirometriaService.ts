// =====================================================
// SERVICIO: Espirometría - GPMedical ERP Pro
// =====================================================

import { supabase } from '@/lib/supabase';
import {
    calcularPredichos,
    clasificarEspirometria,
    type Espirometria,
    type CrearEspirometriaDTO,
    type FiltrosEspirometria,
} from '@/types/espirometria';

export const espirometriaService = {

    async listar(filtros: FiltrosEspirometria = {}): Promise<Espirometria[]> {
        let query = supabase
            .from('espirometrias')
            .select(`*, paciente:pacientes(id, nombre, apellido_paterno)`)
            .order('fecha_estudio', { ascending: false });

        if (filtros.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros.paciente_id) query = query.eq('paciente_id', filtros.paciente_id);
        if (filtros.clasificacion) query = query.eq('clasificacion', filtros.clasificacion);
        if (filtros.fecha_desde) query = query.gte('fecha_estudio', filtros.fecha_desde);
        if (filtros.fecha_hasta) query = query.lte('fecha_estudio', filtros.fecha_hasta);
        if (filtros.search) {
            query = query.or(`paciente.nombre.ilike.%${filtros.search}%,paciente.apellido_paterno.ilike.%${filtros.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error listando espirometrías: ${error.message}`);
        return data || [];
    },

    async obtener(id: string): Promise<Espirometria | null> {
        const { data, error } = await supabase
            .from('espirometrias')
            .select(`*, paciente:pacientes(id, nombre, apellido_paterno)`)
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },

    async crear(dto: CrearEspirometriaDTO): Promise<Espirometria> {
        const { data: userData } = await supabase.auth.getUser();

        // Calculate predicted values
        const predichos = calcularPredichos({
            edad: dto.edad,
            talla_cm: dto.talla_cm,
            sexo: dto.sexo,
        });

        const fev1_fvc = dto.fvc > 0 ? Math.round((dto.fev1 / dto.fvc) * 100) : 0;
        const fvc_porcentaje = predichos.fvc_predicho > 0 ? Math.round((dto.fvc / predichos.fvc_predicho) * 100) : 0;
        const fev1_porcentaje = predichos.fev1_predicho > 0 ? Math.round((dto.fev1 / predichos.fev1_predicho) * 100) : 0;

        const clasificacion = clasificarEspirometria(fvc_porcentaje, fev1_porcentaje, fev1_fvc);

        // Calculate bronchodilator response
        let respuesta_bd = undefined;
        if (dto.broncodilatador && dto.respuesta_bd) {
            const mejoria = dto.fev1 > 0 ? ((dto.respuesta_bd.fev1_post - dto.fev1) / dto.fev1) * 100 : 0;
            respuesta_bd = {
                fev1_post: dto.respuesta_bd.fev1_post,
                fvc_post: dto.respuesta_bd.fvc_post,
                mejoria_porcentaje: Math.round(mejoria),
                positiva: mejoria >= 12 && (dto.respuesta_bd.fev1_post - dto.fev1) >= 0.2,
            };
        }

        const { data, error } = await supabase
            .from('espirometrias')
            .insert({
                empresa_id: dto.empresa_id,
                paciente_id: dto.paciente_id,
                edad: dto.edad,
                sexo: dto.sexo,
                talla_cm: dto.talla_cm,
                peso_kg: dto.peso_kg,
                fvc: dto.fvc,
                fev1: dto.fev1,
                fev1_fvc: fev1_fvc,
                pef: dto.pef,
                fef_2575: dto.fef_2575,
                fvc_predicho: predichos.fvc_predicho,
                fev1_predicho: predichos.fev1_predicho,
                fev1_fvc_predicho: predichos.fev1_fvc_predicho,
                fvc_porcentaje,
                fev1_porcentaje,
                clasificacion,
                calidad_prueba: dto.calidad_prueba,
                numero_intentos: dto.numero_intentos,
                criterio_referencia: 'NHANES_III',
                broncodilatador: dto.broncodilatador,
                respuesta_bd,
                observaciones: dto.observaciones,
                episodio_id: dto.episodio_id,
                campania_id: dto.campania_id,
                realizado_por: userData.user?.id || '',
                fecha_estudio: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (error) throw new Error(`Error creando espirometría: ${error.message}`);
        return data;
    },

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase.from('espirometrias').delete().eq('id', id);
        if (error) throw new Error(`Error eliminando: ${error.message}`);
    },

    async obtenerResumen(empresaId?: string): Promise<{
        total: number;
        normales: number;
        obstruccion: number;
        restriccion: number;
    }> {
        let query = supabase.from('espirometrias').select('clasificacion');
        if (empresaId) query = query.eq('empresa_id', empresaId);

        const { data } = await query;
        const estudios = data || [];
        return {
            total: estudios.length,
            normales: estudios.filter(e => e.clasificacion === 'normal').length,
            obstruccion: estudios.filter(e => e.clasificacion?.includes('obstruccion')).length,
            restriccion: estudios.filter(e => e.clasificacion?.includes('restriccion')).length,
        };
    },
};

export default espirometriaService;
