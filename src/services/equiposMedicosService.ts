// =====================================================
// SERVICIO: API para Equipos Médicos — GPMedical ERP Pro
// Integración con audiometría, espirometría, etc.
// =====================================================

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type TipoEquipo = 'audiometro' | 'espirometro' | 'bascula' | 'electrocardiografo' | 'glucometro' | 'oximetro';

export interface EquipoMedico {
    id: string;
    nombre: string;
    tipo: TipoEquipo;
    modelo: string;
    marca: string;
    numero_serie: string;
    sede_id: string;
    estado: 'activo' | 'mantenimiento' | 'inactivo';
    ultima_calibracion: string;
    proxima_calibracion: string;
    protocolo_conexion: 'usb' | 'bluetooth' | 'serial' | 'red' | 'manual';
    ip_dispositivo?: string;
    puerto?: number;
}

export interface LecturaEquipo {
    id?: string;
    equipo_id: string;
    paciente_id: string;
    episodio_id?: string;
    tipo_estudio: string;
    datos_raw: Record<string, any>;
    datos_procesados: Record<string, any>;
    fecha_lectura: string;
    operador_id: string;
    validado: boolean;
    observaciones?: string;
}

// ── Parsers por tipo de equipo ──

const parsearAudiometria = (rawData: string): Record<string, any> => {
    // Parser genérico para datos audiométricos
    // Formato esperado: frecuencias con umbrales en dB
    try {
        const lineas = rawData.split('\n').filter(l => l.trim());
        const frecuencias = [250, 500, 1000, 2000, 3000, 4000, 6000, 8000];
        const resultado: Record<string, any> = {
            oido_derecho: {} as Record<string, number>,
            oido_izquierdo: {} as Record<string, number>,
            conduccion: 'aerea',
            fecha_calibracion: new Date().toISOString(),
        };

        // Intentar parsear CSV: freq,od_db,oi_db
        for (const linea of lineas) {
            const parts = linea.split(/[,;\t]/).map(p => p.trim());
            if (parts.length >= 3) {
                const freq = parseInt(parts[0]);
                if (frecuencias.includes(freq)) {
                    resultado.oido_derecho[freq] = parseFloat(parts[1]) || 0;
                    resultado.oido_izquierdo[freq] = parseFloat(parts[2]) || 0;
                }
            }
        }

        // Calcular PTA (Pure Tone Average)
        const ptaFreqs = [500, 1000, 2000, 4000];
        const odValues = ptaFreqs.map(f => resultado.oido_derecho[f] || 0);
        const oiValues = ptaFreqs.map(f => resultado.oido_izquierdo[f] || 0);
        resultado.pta_derecho = Math.round(odValues.reduce((a, b) => a + b, 0) / odValues.length);
        resultado.pta_izquierdo = Math.round(oiValues.reduce((a, b) => a + b, 0) / oiValues.length);

        // Clasificación
        resultado.clasificacion_od = clasificarAudiometria(resultado.pta_derecho);
        resultado.clasificacion_oi = clasificarAudiometria(resultado.pta_izquierdo);

        return resultado;
    } catch (e) {
        return { error: 'No se pudieron parsear los datos audiométricos', raw: rawData };
    }
};

const clasificarAudiometria = (pta: number): string => {
    if (pta <= 25) return 'Normal';
    if (pta <= 40) return 'Hipoacusia leve';
    if (pta <= 55) return 'Hipoacusia moderada';
    if (pta <= 70) return 'Hipoacusia moderada-severa';
    if (pta <= 90) return 'Hipoacusia severa';
    return 'Hipoacusia profunda';
};

const parsearEspirometria = (rawData: string): Record<string, any> => {
    try {
        const datos: Record<string, any> = {};
        const lineas = rawData.split('\n').filter(l => l.trim());

        for (const linea of lineas) {
            const [key, value] = linea.split(/[=:,;\t]/).map(p => p.trim());
            if (key && value) {
                const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
                datos[keyNorm] = isNaN(parseFloat(value)) ? value : parseFloat(value);
            }
        }

        // Valores esperados
        const fvc = datos.fvc || datos.capacidad_vital_forzada || 0;
        const fev1 = datos.fev1 || datos.volumen_espiratorio_forzado_1s || 0;
        const relacion = fev1 && fvc ? Math.round((fev1 / fvc) * 100) : 0;

        return {
            fvc: fvc,
            fev1: fev1,
            fev1_fvc: relacion,
            fef_25_75: datos.fef_25_75 || datos.fef2575 || 0,
            pef: datos.pef || datos.flujo_espiratorio_pico || 0,
            interpretacion: interpretarEspirometria(fev1, fvc, relacion),
            calidad_prueba: datos.calidad || 'aceptable',
            ...datos,
        };
    } catch (e) {
        return { error: 'No se pudieron parsear los datos espirométricos', raw: rawData };
    }
};

const interpretarEspirometria = (fev1: number, fvc: number, relacion: number): string => {
    if (relacion >= 70 && fvc >= 80) return 'Normal';
    if (relacion < 70) return 'Patrón obstructivo';
    if (fvc < 80 && relacion >= 70) return 'Patrón restrictivo';
    return 'Patrón mixto';
};

// ── Servicio principal ──

export const equiposMedicosService = {
    // Registrar lectura de equipo
    async registrarLectura(lectura: LecturaEquipo): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('lecturas_equipos')
            .insert(lectura)
            .select()
            .single();

        if (!error) {
            toast.success('Lectura registrada exitosamente');
        }
        return { data, error };
    },

    // Obtener lecturas por paciente
    async obtenerLecturasPaciente(pacienteId: string, tipoEstudio?: string) {
        let query = supabase
            .from('lecturas_equipos')
            .select('*, equipo:equipos_medicos(nombre, tipo, marca)')
            .eq('paciente_id', pacienteId)
            .order('fecha_lectura', { ascending: false });

        if (tipoEstudio) query = query.eq('tipo_estudio', tipoEstudio);
        return query;
    },

    // Listar equipos activos
    async listarEquipos(sedeId?: string) {
        let query = supabase
            .from('equipos_medicos')
            .select('*')
            .eq('estado', 'activo')
            .order('nombre');

        if (sedeId) query = query.eq('sede_id', sedeId);
        return query;
    },

    // Parsear datos según tipo de equipo
    parsearDatos(tipo: TipoEquipo, rawData: string): Record<string, any> {
        switch (tipo) {
            case 'audiometro': return parsearAudiometria(rawData);
            case 'espirometro': return parsearEspirometria(rawData);
            default: {
                // Parser genérico: busca pares key=value
                const datos: Record<string, any> = {};
                rawData.split('\n').forEach(line => {
                    const [k, v] = line.split(/[=:;\t]/).map(p => p.trim());
                    if (k && v) datos[k] = isNaN(parseFloat(v)) ? v : parseFloat(v);
                });
                return datos;
            }
        }
    },

    // Simular lectura de equipo (para demo)
    async simularLectura(tipo: TipoEquipo): Promise<Record<string, any>> {
        switch (tipo) {
            case 'audiometro':
                return parsearAudiometria(
                    '250,15,20\n500,10,15\n1000,15,10\n2000,20,25\n3000,25,30\n4000,30,35\n6000,35,40\n8000,25,30'
                );
            case 'espirometro':
                return parsearEspirometria('FVC=4.2\nFEV1=3.5\nFEF_25_75=3.0\nPEF=8.5');
            default:
                return { mensaje: 'Datos de simulación', valor: Math.random() * 100 };
        }
    },

    // Verificar calibración de equipos
    async verificarCalibraciones() {
        const hoy = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('equipos_medicos')
            .select('id, nombre, tipo, proxima_calibracion')
            .lte('proxima_calibracion', hoy)
            .eq('estado', 'activo');

        return data || [];
    }
};

export default equiposMedicosService;
