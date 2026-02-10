// =====================================================
// SERVICIO: Búsqueda Global - GPMedical ERP Pro
// Busca en pacientes, empresas, citas y episodios
// =====================================================

import { supabase } from '@/lib/supabase';

export interface ResultadoBusqueda {
    tipo: 'paciente' | 'empresa' | 'cita' | 'episodio' | 'campania' | 'cotizacion';
    id: string;
    titulo: string;
    subtitulo: string;
    ruta: string;
    icono: string;
}

export const searchService = {

    /**
     * Búsqueda global multi-entidad
     * Busca en pacientes, empresas, citas, episodios, campañas y cotizaciones
     */
    async buscar(termino: string, limite: number = 20): Promise<ResultadoBusqueda[]> {
        if (!termino || termino.length < 2) return [];

        const query = `%${termino}%`;
        const resultados: ResultadoBusqueda[] = [];

        // Búsqueda paralela en todas las entidades
        const [pacientes, empresas, citas, episodios, campanias, cotizaciones] = await Promise.allSettled([
            // 1. Pacientes
            supabase
                .from('pacientes')
                .select('id, nombre, apellido_paterno, curp')
                .or(`nombre.ilike.${query},apellido_paterno.ilike.${query},curp.ilike.${query}`)
                .limit(limite),

            // 2. Empresas
            supabase
                .from('empresas')
                .select('id, nombre, rfc')
                .or(`nombre.ilike.${query},rfc.ilike.${query}`)
                .limit(limite),

            // 3. Citas
            supabase
                .from('citas')
                .select('id, motivo, paciente:pacientes(nombre, apellido_paterno)')
                .ilike('motivo', query)
                .limit(limite),

            // 4. Episodios
            supabase
                .from('episodios_medicos')
                .select('id, tipo_episodio, paciente:pacientes(nombre, apellido_paterno)')
                .or(`tipo_episodio.ilike.${query}`)
                .limit(limite),

            // 5. Campañas
            supabase
                .from('campanias')
                .select('id, nombre, empresa:empresas(nombre)')
                .ilike('nombre', query)
                .limit(limite),

            // 6. Cotizaciones
            supabase
                .from('cotizaciones')
                .select('id, folio, empresa:empresas(nombre)')
                .ilike('folio', query)
                .limit(limite),
        ]);

        // Procesar pacientes
        if (pacientes.status === 'fulfilled' && pacientes.value.data) {
            for (const p of pacientes.value.data) {
                resultados.push({
                    tipo: 'paciente',
                    id: p.id,
                    titulo: `${p.nombre} ${p.apellido_paterno}`,
                    subtitulo: p.curp || 'Sin CURP',
                    ruta: `/pacientes/${p.id}`,
                    icono: '👤',
                });
            }
        }

        // Procesar empresas
        if (empresas.status === 'fulfilled' && empresas.value.data) {
            for (const e of empresas.value.data) {
                resultados.push({
                    tipo: 'empresa',
                    id: e.id,
                    titulo: e.nombre,
                    subtitulo: e.rfc || 'Sin RFC',
                    ruta: `/empresas/${e.id}`,
                    icono: '🏢',
                });
            }
        }

        // Procesar citas
        if (citas.status === 'fulfilled' && citas.value.data) {
            for (const c of citas.value.data) {
                const pac = c.paciente as any;
                resultados.push({
                    tipo: 'cita',
                    id: c.id,
                    titulo: c.motivo || 'Cita',
                    subtitulo: pac ? `${pac.nombre} ${pac.apellido_paterno}` : '',
                    ruta: `/agenda`,
                    icono: '📅',
                });
            }
        }

        // Procesar episodios
        if (episodios.status === 'fulfilled' && episodios.value.data) {
            for (const ep of episodios.value.data) {
                const pac = ep.paciente as any;
                resultados.push({
                    tipo: 'episodio',
                    id: ep.id,
                    titulo: ep.tipo_episodio || 'Episodio',
                    subtitulo: pac ? `${pac.nombre} ${pac.apellido_paterno}` : '',
                    ruta: `/episodios/${ep.id}`,
                    icono: '🏥',
                });
            }
        }

        // Procesar campañas
        if (campanias.status === 'fulfilled' && campanias.value.data) {
            for (const cam of campanias.value.data) {
                const emp = cam.empresa as any;
                resultados.push({
                    tipo: 'campania',
                    id: cam.id,
                    titulo: cam.nombre,
                    subtitulo: emp?.nombre || '',
                    ruta: `/campanias`,
                    icono: '📋',
                });
            }
        }

        // Procesar cotizaciones
        if (cotizaciones.status === 'fulfilled' && cotizaciones.value.data) {
            for (const cot of cotizaciones.value.data) {
                const emp = cot.empresa as any;
                resultados.push({
                    tipo: 'cotizacion',
                    id: cot.id,
                    titulo: cot.folio || 'Cotización',
                    subtitulo: emp?.nombre || '',
                    ruta: `/cotizaciones`,
                    icono: '💰',
                });
            }
        }

        return resultados;
    },

    /**
     * Búsqueda rápida solo en pacientes (para autocompletado)
     */
    async buscarPacientes(termino: string, limite: number = 5) {
        if (!termino || termino.length < 2) return [];
        const { data } = await supabase
            .from('pacientes')
            .select('id, nombre, apellido_paterno, curp')
            .or(`nombre.ilike.%${termino}%,apellido_paterno.ilike.%${termino}%,curp.ilike.%${termino}%`)
            .limit(limite);
        return data || [];
    },
};

export default searchService;
