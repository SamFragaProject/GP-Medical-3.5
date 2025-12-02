import { z } from 'zod';

export const pacienteSchema = z.object({
  numero_empleado: z.string().min(1, 'Número de empleado requerido'),
  nombre: z.string().min(2, 'Nombre muy corto').max(100),
  apellido_paterno: z.string().min(2, 'Apellido muy corto').max(100),
  apellido_materno: z.string().max(100).optional(),

  curp: z.string()
    .length(18, 'CURP debe tener 18 caracteres')
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/, 'CURP inválido')
    .optional()
    .or(z.literal('')),

  rfc: z.string()
    .min(12, 'RFC muy corto')
    .max(13, 'RFC muy largo')
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido')
    .optional()
    .or(z.literal('')),

  nss: z.string()
    .length(11, 'NSS debe tener 11 dígitos')
    .regex(/^\d{11}$/, 'NSS debe ser numérico')
    .optional()
    .or(z.literal('')),

  fecha_nacimiento: z.coerce.date({
    required_error: 'Fecha de nacimiento requerida',
  }),

  sexo: z.enum(['M', 'F'], {
    required_error: 'Seleccione sexo',
  }),

  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().max(20).optional(),

  // Datos laborales
  puesto: z.string().max(200).optional(),
  departamento: z.string().max(200).optional(),
  area: z.string().max(200).optional(),
  turno: z.enum(['matutino', 'vespertino', 'nocturno', 'mixto', 'rotativo']).optional(),
  fecha_ingreso: z.coerce.date().optional(),

  // Datos médicos
  tipo_sangre: z.string().max(5).optional(),
  alergias: z.string().optional(),
  enfermedades_cronicas: z.string().optional(),
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;
