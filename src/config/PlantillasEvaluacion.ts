// =====================================================
// CONFIG: Plantillas por Tipo de Evaluación Médica
// Ingreso, Periódico, Retorno, Egreso, Especial
// =====================================================

export type TipoEvaluacion = 'ingreso' | 'periodico' | 'retorno' | 'egreso' | 'especial';

export interface CampoPlantilla {
    id: string;
    label: string;
    tipo: 'texto' | 'numero' | 'select' | 'checkbox' | 'fecha' | 'textarea';
    requerido: boolean;
    opciones?: string[];
    valor_default?: string;
}

export interface SeccionPlantilla {
    id: string;
    nombre: string;
    icono: string;
    campos: CampoPlantilla[];
}

export interface PlantillaEvaluacion {
    tipo: TipoEvaluacion;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    estudios_obligatorios: string[];
    estudios_opcionales: string[];
    secciones: SeccionPlantilla[];
}

// =====================================================
// PLANTILLAS
// =====================================================

export const PLANTILLAS_EVALUACION: PlantillaEvaluacion[] = [
    {
        tipo: 'ingreso',
        nombre: 'Examen Médico de Ingreso',
        descripcion: 'Evaluación pre-empleo completa para nuevo ingreso',
        icono: '🆕',
        color: 'blue',
        estudios_obligatorios: [
            'historia_clinica_completa',
            'exploracion_fisica',
            'laboratorio_completo',
            'rx_torax',
            'audiometria',
            'espirometria',
            'vision',
        ],
        estudios_opcionales: ['ekg', 'prueba_esfuerzo', 'psicometrico'],
        secciones: [
            {
                id: 'antecedentes',
                nombre: 'Antecedentes Personales',
                icono: '📋',
                campos: [
                    { id: 'ahf', label: 'Antecedentes Heredofamiliares', tipo: 'textarea', requerido: true },
                    { id: 'apnp', label: 'Antecedentes Personales No Patológicos', tipo: 'textarea', requerido: true },
                    { id: 'app', label: 'Antecedentes Personales Patológicos', tipo: 'textarea', requerido: true },
                    { id: 'agineco', label: 'Antecedentes Gineco-Obstétricos', tipo: 'textarea', requerido: false },
                    { id: 'alergias', label: 'Alergias', tipo: 'texto', requerido: true },
                    { id: 'tabaquismo', label: 'Tabaquismo', tipo: 'select', requerido: true, opciones: ['No', 'Sí activo', 'Ex fumador'] },
                    { id: 'alcoholismo', label: 'Alcoholismo', tipo: 'select', requerido: true, opciones: ['No', 'Social', 'Regular', 'Frecuente'] },
                ],
            },
            {
                id: 'historia_ocupacional',
                nombre: 'Historia Ocupacional',
                icono: '🏭',
                campos: [
                    { id: 'empresa_anterior', label: 'Empresa Anterior', tipo: 'texto', requerido: false },
                    { id: 'puesto_anterior', label: 'Puesto Anterior', tipo: 'texto', requerido: false },
                    { id: 'antiguedad_anterior', label: 'Antigüedad (años)', tipo: 'numero', requerido: false },
                    { id: 'riesgos_previos', label: 'Exposición a Riesgos Previos', tipo: 'textarea', requerido: true },
                    { id: 'accidentes_previos', label: 'Accidentes/Enfermedades Laborales Previas', tipo: 'textarea', requerido: false },
                    { id: 'incapacidades', label: 'Incapacidades Previas', tipo: 'textarea', requerido: false },
                ],
            },
            {
                id: 'exploracion',
                nombre: 'Exploración Física',
                icono: '🩺',
                campos: [
                    { id: 'peso', label: 'Peso (kg)', tipo: 'numero', requerido: true },
                    { id: 'talla', label: 'Talla (cm)', tipo: 'numero', requerido: true },
                    { id: 'imc', label: 'IMC', tipo: 'numero', requerido: true },
                    { id: 'ta_sistolica', label: 'T.A. Sistólica', tipo: 'numero', requerido: true },
                    { id: 'ta_diastolica', label: 'T.A. Diastólica', tipo: 'numero', requerido: true },
                    { id: 'fc', label: 'Frecuencia Cardíaca', tipo: 'numero', requerido: true },
                    { id: 'fr', label: 'Frecuencia Respiratoria', tipo: 'numero', requerido: true },
                    { id: 'temperatura', label: 'Temperatura', tipo: 'numero', requerido: true },
                    { id: 'spo2', label: 'SpO₂ (%)', tipo: 'numero', requerido: true },
                    { id: 'aspecto_general', label: 'Aspecto General', tipo: 'textarea', requerido: true },
                    { id: 'cabeza_cuello', label: 'Cabeza y Cuello', tipo: 'textarea', requerido: true },
                    { id: 'torax', label: 'Tórax', tipo: 'textarea', requerido: true },
                    { id: 'abdomen', label: 'Abdomen', tipo: 'textarea', requerido: true },
                    { id: 'extremidades', label: 'Extremidades', tipo: 'textarea', requerido: true },
                    { id: 'piel', label: 'Piel', tipo: 'textarea', requerido: true },
                    { id: 'columna', label: 'Columna', tipo: 'textarea', requerido: true },
                    { id: 'neurologico', label: 'Neurológico', tipo: 'textarea', requerido: true },
                ],
            },
        ],
    },
    {
        tipo: 'periodico',
        nombre: 'Examen Médico Periódico',
        descripcion: 'Evaluación de vigilancia médica periódica',
        icono: '🔄',
        color: 'green',
        estudios_obligatorios: [
            'exploracion_fisica',
            'laboratorio_basico',
            'audiometria',
            'espirometria',
            'vision',
        ],
        estudios_opcionales: ['laboratorio_completo', 'rx_torax', 'ekg'],
        secciones: [
            {
                id: 'actualizacion',
                nombre: 'Actualización de Antecedentes',
                icono: '📝',
                campos: [
                    { id: 'cambios_salud', label: 'Cambios en Estado de Salud', tipo: 'textarea', requerido: true },
                    { id: 'nuevos_padecimientos', label: 'Nuevos Padecimientos', tipo: 'textarea', requerido: false },
                    { id: 'medicamentos_actuales', label: 'Medicamentos Actuales', tipo: 'textarea', requerido: true },
                    { id: 'incapacidades_periodo', label: 'Incapacidades en el Periodo', tipo: 'textarea', requerido: false },
                    { id: 'accidentes_periodo', label: 'Accidentes de Trabajo en el Periodo', tipo: 'textarea', requerido: false },
                ],
            },
            {
                id: 'exploracion',
                nombre: 'Exploración Física',
                icono: '🩺',
                campos: [
                    { id: 'peso', label: 'Peso (kg)', tipo: 'numero', requerido: true },
                    { id: 'talla', label: 'Talla (cm)', tipo: 'numero', requerido: true },
                    { id: 'imc', label: 'IMC', tipo: 'numero', requerido: true },
                    { id: 'ta_sistolica', label: 'T.A. Sistólica', tipo: 'numero', requerido: true },
                    { id: 'ta_diastolica', label: 'T.A. Diastólica', tipo: 'numero', requerido: true },
                    { id: 'fc', label: 'Frecuencia Cardíaca', tipo: 'numero', requerido: true },
                    { id: 'spo2', label: 'SpO₂ (%)', tipo: 'numero', requerido: true },
                    { id: 'hallazgos', label: 'Hallazgos Relevantes', tipo: 'textarea', requerido: true },
                ],
            },
            {
                id: 'comparativo',
                nombre: 'Comparativo con Evaluación Anterior',
                icono: '📊',
                campos: [
                    { id: 'variacion_peso', label: 'Variación de Peso', tipo: 'select', requerido: true, opciones: ['Sin cambio', 'Aumento', 'Disminución'] },
                    { id: 'variacion_audiometria', label: 'Cambio en Audiometría', tipo: 'select', requerido: false, opciones: ['Sin cambio', 'Mejoría', 'Deterioro'] },
                    { id: 'variacion_espirometria', label: 'Cambio en Espirometría', tipo: 'select', requerido: false, opciones: ['Sin cambio', 'Mejoría', 'Deterioro'] },
                    { id: 'observaciones_comparativo', label: 'Observaciones del Comparativo', tipo: 'textarea', requerido: false },
                ],
            },
        ],
    },
    {
        tipo: 'retorno',
        nombre: 'Examen Médico de Retorno',
        descripcion: 'Evaluación post-incapacidad o ausencia prolongada',
        icono: '↩️',
        color: 'amber',
        estudios_obligatorios: [
            'exploracion_fisica',
            'laboratorio_basico',
        ],
        estudios_opcionales: ['rx_torax', 'audiometria', 'espirometria', 'ekg'],
        secciones: [
            {
                id: 'motivo_ausencia',
                nombre: 'Motivo de Ausencia',
                icono: '📄',
                campos: [
                    { id: 'tipo_incapacidad', label: 'Tipo de Incapacidad', tipo: 'select', requerido: true, opciones: ['Enfermedad general', 'Riesgo de trabajo', 'Maternidad', 'Otro'] },
                    { id: 'diagnostico_incapacidad', label: 'Diagnóstico de la Incapacidad', tipo: 'textarea', requerido: true },
                    { id: 'dias_incapacidad', label: 'Días de Incapacidad', tipo: 'numero', requerido: true },
                    { id: 'fecha_alta', label: 'Fecha de Alta Médica', tipo: 'fecha', requerido: true },
                    { id: 'tratamiento_recibido', label: 'Tratamiento Recibido', tipo: 'textarea', requerido: true },
                    { id: 'secuelas', label: 'Secuelas', tipo: 'textarea', requerido: false },
                ],
            },
            {
                id: 'valoracion_retorno',
                nombre: 'Valoración de Retorno',
                icono: '🩺',
                campos: [
                    { id: 'condicion_actual', label: 'Condición Actual del Trabajador', tipo: 'textarea', requerido: true },
                    { id: 'restricciones_temporales', label: 'Restricciones Temporales', tipo: 'textarea', requerido: false },
                    { id: 'tiempo_restricciones', label: 'Duración de Restricciones (días)', tipo: 'numero', requerido: false },
                    { id: 'apto_retorno', label: 'Apto para Retorno', tipo: 'select', requerido: true, opciones: ['Sí, sin restricciones', 'Sí, con restricciones', 'No apto, requiere más recuperación'] },
                ],
            },
        ],
    },
    {
        tipo: 'egreso',
        nombre: 'Examen Médico de Egreso',
        descripcion: 'Evaluación al término de la relación laboral',
        icono: '🚪',
        color: 'red',
        estudios_obligatorios: [
            'exploracion_fisica',
            'audiometria',
        ],
        estudios_opcionales: ['laboratorio_basico', 'espirometria', 'vision', 'rx_torax'],
        secciones: [
            {
                id: 'datos_laborales',
                nombre: 'Datos Laborales',
                icono: '🏢',
                campos: [
                    { id: 'motivo_egreso', label: 'Motivo de Egreso', tipo: 'select', requerido: true, opciones: ['Renuncia voluntaria', 'Rescisión', 'Término de contrato', 'Jubilación', 'Otro'] },
                    { id: 'antiguedad_total', label: 'Antigüedad Total (años)', tipo: 'numero', requerido: true },
                    { id: 'ultimo_puesto', label: 'Último Puesto', tipo: 'texto', requerido: true },
                    { id: 'riesgos_exposicion', label: 'Riesgos a los que Estuvo Expuesto', tipo: 'textarea', requerido: true },
                ],
            },
            {
                id: 'estado_salud_final',
                nombre: 'Estado de Salud Final',
                icono: '🩺',
                campos: [
                    { id: 'condicion_general', label: 'Condición General al Egreso', tipo: 'textarea', requerido: true },
                    { id: 'padecimientos_laborales', label: 'Padecimientos Adquiridos en el Trabajo', tipo: 'textarea', requerido: false },
                    { id: 'comparativo_ingreso', label: 'Comparativo con Examen de Ingreso', tipo: 'textarea', requerido: true },
                    { id: 'recomendaciones_egreso', label: 'Recomendaciones al Egreso', tipo: 'textarea', requerido: false },
                ],
            },
        ],
    },
    {
        tipo: 'especial',
        nombre: 'Examen Médico Especial',
        descripcion: 'Evaluación por cambio de puesto, exposición especial o protocolo específico',
        icono: '⚡',
        color: 'purple',
        estudios_obligatorios: [
            'exploracion_fisica',
        ],
        estudios_opcionales: ['laboratorio_completo', 'rx_torax', 'audiometria', 'espirometria', 'vision', 'ekg', 'prueba_esfuerzo'],
        secciones: [
            {
                id: 'motivo_especial',
                nombre: 'Motivo de Evaluación Especial',
                icono: '📄',
                campos: [
                    { id: 'motivo', label: 'Motivo de la Evaluación', tipo: 'select', requerido: true, opciones: ['Cambio de puesto', 'Exposición a nuevo riesgo', 'Protocolo de vigilancia', 'Aptitud específica', 'Evento centinela', 'Otro'] },
                    { id: 'detalle_motivo', label: 'Detalle del Motivo', tipo: 'textarea', requerido: true },
                    { id: 'puesto_nuevo', label: 'Puesto Nuevo (si aplica)', tipo: 'texto', requerido: false },
                    { id: 'riesgos_nuevos', label: 'Nuevos Riesgos a Evaluar', tipo: 'textarea', requerido: false },
                ],
            },
            {
                id: 'evaluacion_especifica',
                nombre: 'Evaluación Específica',
                icono: '🔬',
                campos: [
                    { id: 'hallazgos', label: 'Hallazgos Relevantes', tipo: 'textarea', requerido: true },
                    { id: 'aptitud_especifica', label: 'Aptitud para la Tarea/Puesto', tipo: 'select', requerido: true, opciones: ['Apto', 'Apto con restricciones', 'No apto'] },
                    { id: 'restricciones', label: 'Restricciones (si aplica)', tipo: 'textarea', requerido: false },
                    { id: 'seguimiento', label: 'Plan de Seguimiento', tipo: 'textarea', requerido: false },
                ],
            },
        ],
    },
];

/**
 * Obtener plantilla por tipo
 */
export function getPlantilla(tipo: TipoEvaluacion): PlantillaEvaluacion | undefined {
    return PLANTILLAS_EVALUACION.find(p => p.tipo === tipo);
}

/**
 * Obtener estudios obligatorios/opcionales para un tipo
 */
export function getEstudiosRequeridos(tipo: TipoEvaluacion) {
    const plantilla = getPlantilla(tipo);
    return {
        obligatorios: plantilla?.estudios_obligatorios || [],
        opcionales: plantilla?.estudios_opcionales || [],
    };
}

/**
 * Validar completitud de plantilla
 */
export function validarPlantilla(tipo: TipoEvaluacion, datos: Record<string, any>): {
    completa: boolean;
    faltantes: string[];
} {
    const plantilla = getPlantilla(tipo);
    if (!plantilla) return { completa: false, faltantes: ['Plantilla no encontrada'] };

    const faltantes: string[] = [];
    for (const seccion of plantilla.secciones) {
        for (const campo of seccion.campos) {
            if (campo.requerido && (!datos[campo.id] || datos[campo.id] === '')) {
                faltantes.push(`${seccion.nombre}: ${campo.label}`);
            }
        }
    }

    return { completa: faltantes.length === 0, faltantes };
}
