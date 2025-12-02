import { z } from 'zod';

export const signosVitalesSchema = z.object({
  peso_kg: z.coerce.number()
    .min(1, 'Peso mínimo 1 kg')
    .max(500, 'Peso máximo 500 kg'),

  talla_cm: z.coerce.number()
    .min(50, 'Talla mínima 50 cm')
    .max(300, 'Talla máxima 300 cm'),

  presion_sistolica: z.coerce.number()
    .min(60, 'Presión sistólica muy baja')
    .max(250, 'Presión sistólica muy alta'),

  presion_diastolica: z.coerce.number()
    .min(40, 'Presión diastólica muy baja')
    .max(150, 'Presión diastólica muy alta'),

  frecuencia_cardiaca: z.coerce.number()
    .min(30, 'FC muy baja')
    .max(200, 'FC muy alta'),

  frecuencia_respiratoria: z.coerce.number()
    .min(8, 'FR muy baja')
    .max(40, 'FR muy alta')
    .optional(),

  temperatura: z.coerce.number()
    .min(34, 'Temperatura muy baja')
    .max(42, 'Temperatura muy alta')
    .optional(),

  saturacion_oxigeno: z.coerce.number()
    .min(70, 'SpO2 muy baja')
    .max(100, 'SpO2 máximo 100%')
    .optional(),
});

export const examenMedicoSchema = z.object({
  paciente_id: z.string().uuid('Paciente inválido'),

  tipo_examen: z.enum([
    'ingreso',
    'periodico',
    'especifico',
    'reintegro',
    'egreso'
  ], {
    required_error: 'Seleccione tipo de examen',
  }),

  fecha_realizacion: z.coerce.date(),

  // Signos vitales
  ...signosVitalesSchema.shape,

  // Exploración física
  exploracion_cabeza: z.string().optional(),
  exploracion_cuello: z.string().optional(),
  exploracion_torax: z.string().optional(),
  exploracion_abdomen: z.string().optional(),
  exploracion_extremidades: z.string().optional(),
  exploracion_columna: z.string().optional(),
  exploracion_piel: z.string().optional(),
  exploracion_neurologico: z.string().optional(),

  // Visión
  agudeza_visual_od: z.string().optional(),
  agudeza_visual_oi: z.string().optional(),

  // Resultado
  aptitud: z.enum([
    'apto',
    'apto_con_restricciones',
    'no_apto_temporal',
    'no_apto_permanente',
    'pendiente'
  ]).optional(),

  restricciones: z.string().optional(),
  recomendaciones: z.string().optional(),
  observaciones: z.string().optional(),
  proxima_evaluacion: z.coerce.date().optional(),

  // Diagnósticos CIE-10
  diagnosticos: z.array(z.object({
    cie10_codigo: z.string().min(1, 'Código CIE-10 requerido'),
    tipo: z.enum(['principal', 'secundario', 'antecedente']),
    descripcion_adicional: z.string().optional(),
  })).optional(),
});

export type ExamenMedicoFormData = z.infer<typeof examenMedicoSchema>;
export type SignosVitalesFormData = z.infer<typeof signosVitalesSchema>;
