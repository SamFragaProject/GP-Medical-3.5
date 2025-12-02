import { z } from 'zod';

export const citaSchema = z.object({
  paciente_id: z.string().uuid(),
  medico_id: z.string().uuid().optional(),

  tipo_cita: z.enum([
    'examen_medico',
    'consulta',
    'seguimiento',
    'urgencia',
    'vacunacion'
  ]),

  fecha: z.coerce.date({
    required_error: 'Fecha requerida',
  }),

  hora_inicio: z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    'Formato de hora inválido (HH:MM)'
  ),

  duracion_minutos: z.coerce.number()
    .min(15, 'Mínimo 15 minutos')
    .max(240, 'Máximo 4 horas')
    .default(30),

  motivo: z.string().max(500).optional(),
  notas: z.string().optional(),
});

export type CitaFormData = z.infer<typeof citaSchema>;
