import { z } from 'zod';

export const incapacidadSchema = z.object({
  paciente_id: z.string().uuid(),

  tipo: z.enum([
    'enfermedad_general',
    'riesgo_trabajo',
    'maternidad',
    'licencia_medica'
  ], {
    required_error: 'Seleccione tipo de incapacidad',
  }),

  cie10_codigo: z.string().min(1, 'Diagnóstico CIE-10 requerido'),
  diagnostico_descripcion: z.string().optional(),

  fecha_inicio: z.coerce.date({
    required_error: 'Fecha inicio requerida',
  }),

  fecha_fin: z.coerce.date({
    required_error: 'Fecha fin requerida',
  }),

  folio_imss: z.string().optional(),
  numero_incapacidad: z.string().optional(),
  observaciones: z.string().optional(),
}).refine(
  (data) => data.fecha_fin >= data.fecha_inicio,
  {
    message: 'Fecha fin debe ser posterior a fecha inicio',
    path: ['fecha_fin'],
  }
);

export type IncapacidadFormData = z.infer<typeof incapacidadSchema>;
