// =====================================================
// SERVICIO: Envío Automático de Reportes — GPMedical ERP Pro
// Generación y envío de reportes a empresas cliente
// =====================================================

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type TipoReporte = 'resumen_campania' | 'dictamenes' | 'ausentismo' | 'riesgos' | 'cumplimiento_stps' | 'facturacion';
export type FrecuenciaEnvio = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'manual';
export type FormatoReporte = 'pdf' | 'excel' | 'csv';

export interface ConfigReporte {
    id?: string;
    empresa_id: string;
    tipo_reporte: TipoReporte;
    frecuencia: FrecuenciaEnvio;
    formato: FormatoReporte;
    destinatarios: string[];
    copia_a?: string[];
    activo: boolean;
    ultimo_envio?: string;
    proximo_envio?: string;
    filtros?: Record<string, any>;
    incluir_graficas: boolean;
    incluir_detalle: boolean;
    template?: string;
}

export interface RegistroEnvio {
    id?: string;
    config_id: string;
    empresa_id: string;
    tipo_reporte: TipoReporte;
    fecha_envio: string;
    destinatarios: string[];
    estado: 'enviado' | 'error' | 'pendiente';
    error?: string;
    tamano_archivo?: number;
}

// Datos para cada tipo de reporte
const TIPOS_REPORTE: Record<TipoReporte, { label: string; descripcion: string; tablas: string[] }> = {
    resumen_campania: {
        label: 'Resumen de Campaña',
        descripcion: 'Avance y resultados de campañas médicas activas',
        tablas: ['campanias', 'episodios_medicos', 'dictamenes']
    },
    dictamenes: {
        label: 'Dictámenes Médicos',
        descripcion: 'Listado de dictámenes de aptitud laboral',
        tablas: ['dictamenes', 'pacientes']
    },
    ausentismo: {
        label: 'Ausentismo Laboral',
        descripcion: 'Incapacidades y faltas por motivos médicos',
        tablas: ['incapacidades', 'pacientes']
    },
    riesgos: {
        label: 'Riesgos de Trabajo',
        descripcion: 'Accidentes y enfermedades profesionales',
        tablas: ['riesgos_trabajo', 'pacientes']
    },
    cumplimiento_stps: {
        label: 'Cumplimiento STPS',
        descripcion: 'Estado de cumplimiento normativo STPS',
        tablas: ['evidencias_stps', 'nom035_campañas']
    },
    facturacion: {
        label: 'Estado de Cuenta',
        descripcion: 'Servicios prestados y estado de facturación',
        tablas: ['facturas', 'cuentas_por_cobrar']
    },
};

// Generador de datos de ejemplo para cada tipo de reporte
const generarDatosReporte = async (tipo: TipoReporte, empresaId: string, filtros?: Record<string, any>) => {
    switch (tipo) {
        case 'resumen_campania': {
            const { data: campanias } = await supabase
                .from('campanias')
                .select('*, episodios_medicos(count)')
                .eq('empresa_cliente_id', empresaId)
                .order('created_at', { ascending: false })
                .limit(10);
            return { campanias: campanias || [], generado: new Date().toISOString() };
        }
        case 'dictamenes': {
            const { data: dictamenes } = await supabase
                .from('dictamenes')
                .select('*, paciente:pacientes(nombre, apellido_paterno)')
                .eq('empresa_id', empresaId)
                .order('fecha_emision', { ascending: false })
                .limit(50);
            return { dictamenes: dictamenes || [], generado: new Date().toISOString() };
        }
        case 'facturacion': {
            const { data: facturas } = await supabase
                .from('facturas')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('fecha_emision', { ascending: false })
                .limit(20);
            return { facturas: facturas || [], generado: new Date().toISOString() };
        }
        default: {
            return { datos: [], tipo, empresa_id: empresaId, generado: new Date().toISOString() };
        }
    }
};

// Generar CSV de los datos
const generarCSV = (datos: Record<string, any>[], columnas: string[]): string => {
    const BOM = '\uFEFF';
    const header = columnas.join(',');
    const rows = datos.map(d => columnas.map(c => {
        const val = d[c];
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','));
    return BOM + header + '\n' + rows.join('\n');
};

export const reportesAutoService = {
    // Obtener configuraciones de reportes para una empresa
    async obtenerConfiguraciones(empresaId?: string) {
        let query = supabase
            .from('configuraciones_reportes')
            .select('*, empresa:empresas_clientes(nombre)')
            .order('created_at', { ascending: false });

        if (empresaId) query = query.eq('empresa_id', empresaId);
        return query;
    },

    // Crear/actualizar configuración
    async guardarConfiguracion(config: ConfigReporte) {
        if (config.id) {
            return supabase.from('configuraciones_reportes').update(config).eq('id', config.id).select().single();
        }
        return supabase.from('configuraciones_reportes').insert(config).select().single();
    },

    // Generar reporte bajo demanda
    async generarReporte(tipo: TipoReporte, empresaId: string, formato: FormatoReporte = 'csv') {
        try {
            const datos = await generarDatosReporte(tipo, empresaId);
            const info = TIPOS_REPORTE[tipo];

            if (formato === 'csv') {
                const key = Object.keys(datos).find(k => Array.isArray(datos[k]));
                if (key && datos[key].length > 0) {
                    const columnas = Object.keys(datos[key][0]);
                    const csv = generarCSV(datos[key], columnas);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(`Reporte "${info.label}" descargado`);
                } else {
                    toast.warning('No hay datos para exportar');
                }
            }

            // Registrar envío
            await supabase.from('registro_envios_reportes').insert({
                empresa_id: empresaId,
                tipo_reporte: tipo,
                fecha_envio: new Date().toISOString(),
                estado: 'enviado',
                destinatarios: ['descarga_manual'],
            }).catch(() => { });

            return datos;
        } catch (err: any) {
            toast.error(`Error generando reporte: ${err.message}`);
            return null;
        }
    },

    // Obtener historial de envíos
    async obtenerHistorial(empresaId?: string, limit = 20) {
        let query = supabase
            .from('registro_envios_reportes')
            .select('*')
            .order('fecha_envio', { ascending: false })
            .limit(limit);

        if (empresaId) query = query.eq('empresa_id', empresaId);
        return query;
    },

    // Info de tipos disponibles
    getTiposReporte: () => TIPOS_REPORTE,

    // Calcular próximo envío según frecuencia
    calcularProximoEnvio(ultimoEnvio: string, frecuencia: FrecuenciaEnvio): string {
        const fecha = new Date(ultimoEnvio);
        switch (frecuencia) {
            case 'diario': fecha.setDate(fecha.getDate() + 1); break;
            case 'semanal': fecha.setDate(fecha.getDate() + 7); break;
            case 'quincenal': fecha.setDate(fecha.getDate() + 15); break;
            case 'mensual': fecha.setMonth(fecha.getMonth() + 1); break;
            default: break;
        }
        return fecha.toISOString();
    },
};

export default reportesAutoService;
