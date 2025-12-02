export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nombre: string
          rfc: string | null
          razon_social: string | null
          direccion: string | null
          ciudad: string | null
          estado: string | null
          codigo_postal: string | null
          telefono: string | null
          email: string | null
          logo_url: string | null
          registro_stps: string | null
          giro_actividad: string | null
          clase_riesgo: number | null
          plan: string
          max_usuarios: number
          max_pacientes: number
          activa: boolean
          fecha_vencimiento: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          rfc?: string | null
          razon_social?: string | null
          direccion?: string | null
          ciudad?: string | null
          estado?: string | null
          codigo_postal?: string | null
          telefono?: string | null
          email?: string | null
          logo_url?: string | null
          registro_stps?: string | null
          giro_actividad?: string | null
          clase_riesgo?: number | null
          plan?: string
          max_usuarios?: number
          max_pacientes?: number
          activa?: boolean
          fecha_vencimiento?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          rfc?: string | null
          razon_social?: string | null
          direccion?: string | null
          ciudad?: string | null
          estado?: string | null
          codigo_postal?: string | null
          telefono?: string | null
          email?: string | null
          logo_url?: string | null
          registro_stps?: string | null
          giro_actividad?: string | null
          clase_riesgo?: number | null
          plan?: string
          max_usuarios?: number
          max_pacientes?: number
          activa?: boolean
          fecha_vencimiento?: string | null
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          empresa_id: string
          nombre: string
          apellido_paterno: string
          apellido_materno: string | null
          email: string
          telefono: string | null
          avatar_url: string | null
          rol: string
          cedula_profesional: string | null
          especialidad: string | null
          universidad: string | null
          firma_digital_url: string | null
          activo: boolean
          ultimo_acceso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          empresa_id: string
          nombre: string
          apellido_paterno: string
          apellido_materno?: string | null
          email: string
          telefono?: string | null
          avatar_url?: string | null
          rol: string
          cedula_profesional?: string | null
          especialidad?: string | null
          universidad?: string | null
          firma_digital_url?: string | null
          activo?: boolean
          ultimo_acceso?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          empresa_id?: string
          nombre?: string
          apellido_paterno?: string
          apellido_materno?: string | null
          email?: string
          telefono?: string | null
          avatar_url?: string | null
          rol?: string
          cedula_profesional?: string | null
          especialidad?: string | null
          universidad?: string | null
          firma_digital_url?: string | null
          activo?: boolean
          ultimo_acceso?: string | null
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          empresa_id: string
          numero_empleado: string | null
          nombre: string
          apellido_paterno: string
          apellido_materno: string | null
          curp: string | null
          rfc: string | null
          nss: string | null
          fecha_nacimiento: string
          sexo: 'M' | 'F' | null
          estado_civil: string | null
          email: string | null
          telefono: string | null
          telefono_emergencia: string | null
          contacto_emergencia: string | null
          direccion: string | null
          ciudad: string | null
          estado: string | null
          codigo_postal: string | null
          puesto: string | null
          departamento: string | null
          area: string | null
          turno: string | null
          fecha_ingreso: string | null
          fecha_baja: string | null
          tipo_contrato: string | null
          jefe_inmediato: string | null
          tipo_sangre: string | null
          alergias: string | null
          enfermedades_cronicas: string | null
          medicamentos_actuales: string | null
          antecedentes_familiares: string | null
          foto_url: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          numero_empleado?: string | null
          nombre: string
          apellido_paterno: string
          apellido_materno?: string | null
          curp?: string | null
          rfc?: string | null
          nss?: string | null
          fecha_nacimiento: string
          sexo?: 'M' | 'F' | null
          estado_civil?: string | null
          email?: string | null
          telefono?: string | null
          telefono_emergencia?: string | null
          contacto_emergencia?: string | null
          direccion?: string | null
          ciudad?: string | null
          estado?: string | null
          codigo_postal?: string | null
          puesto?: string | null
          departamento?: string | null
          area?: string | null
          turno?: string | null
          fecha_ingreso?: string | null
          fecha_baja?: string | null
          tipo_contrato?: string | null
          jefe_inmediato?: string | null
          tipo_sangre?: string | null
          alergias?: string | null
          enfermedades_cronicas?: string | null
          medicamentos_actuales?: string | null
          antecedentes_familiares?: string | null
          foto_url?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          empresa_id?: string
          numero_empleado?: string | null
          nombre?: string
          apellido_paterno?: string
          apellido_materno?: string | null
          curp?: string | null
          rfc?: string | null
          nss?: string | null
          fecha_nacimiento?: string
          sexo?: 'M' | 'F' | null
          estado_civil?: string | null
          email?: string | null
          telefono?: string | null
          telefono_emergencia?: string | null
          contacto_emergencia?: string | null
          direccion?: string | null
          ciudad?: string | null
          estado?: string | null
          codigo_postal?: string | null
          puesto?: string | null
          departamento?: string | null
          area?: string | null
          turno?: string | null
          fecha_ingreso?: string | null
          fecha_baja?: string | null
          tipo_contrato?: string | null
          jefe_inmediato?: string | null
          tipo_sangre?: string | null
          alergias?: string | null
          enfermedades_cronicas?: string | null
          medicamentos_actuales?: string | null
          antecedentes_familiares?: string | null
          foto_url?: string | null
          activo?: boolean
          updated_at?: string
        }
      }
      examenes_medicos: {
        Row: {
          id: string
          empresa_id: string
          paciente_id: string
          medico_id: string | null
          tipo_examen: string
          estado: string
          fecha_programada: string | null
          fecha_realizacion: string | null
          peso_kg: number | null
          talla_cm: number | null
          imc: number | null
          presion_sistolica: number | null
          presion_diastolica: number | null
          frecuencia_cardiaca: number | null
          frecuencia_respiratoria: number | null
          temperatura: number | null
          saturacion_oxigeno: number | null
          exploracion_cabeza: string | null
          exploracion_cuello: string | null
          exploracion_torax: string | null
          exploracion_abdomen: string | null
          exploracion_extremidades: string | null
          exploracion_columna: string | null
          exploracion_piel: string | null
          exploracion_neurologico: string | null
          estudios_laboratorio: Json | null
          estudios_gabinete: Json | null
          agudeza_visual_od: string | null
          agudeza_visual_oi: string | null
          audiometria_od: Json | null
          audiometria_oi: Json | null
          espirometria: Json | null
          aptitud: string | null
          restricciones: string | null
          recomendaciones: string | null
          observaciones: string | null
          proxima_evaluacion: string | null
          firmado: boolean
          fecha_firma: string | null
          firma_medico_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          paciente_id: string
          medico_id?: string | null
          tipo_examen: string
          estado?: string
          fecha_programada?: string | null
          fecha_realizacion?: string | null
          peso_kg?: number | null
          talla_cm?: number | null
          imc?: number | null
          presion_sistolica?: number | null
          presion_diastolica?: number | null
          frecuencia_cardiaca?: number | null
          frecuencia_respiratoria?: number | null
          temperatura?: number | null
          saturacion_oxigeno?: number | null
          exploracion_cabeza?: string | null
          exploracion_cuello?: string | null
          exploracion_torax?: string | null
          exploracion_abdomen?: string | null
          exploracion_extremidades?: string | null
          exploracion_columna?: string | null
          exploracion_piel?: string | null
          exploracion_neurologico?: string | null
          estudios_laboratorio?: Json | null
          estudios_gabinete?: Json | null
          agudeza_visual_od?: string | null
          agudeza_visual_oi?: string | null
          audiometria_od?: Json | null
          audiometria_oi?: Json | null
          espirometria?: Json | null
          aptitud?: string | null
          restricciones?: string | null
          recomendaciones?: string | null
          observaciones?: string | null
          proxima_evaluacion?: string | null
          firmado?: boolean
          fecha_firma?: string | null
          firma_medico_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          empresa_id?: string
          paciente_id?: string
          medico_id?: string | null
          tipo_examen?: string
          estado?: string
          fecha_programada?: string | null
          fecha_realizacion?: string | null
          peso_kg?: number | null
          talla_cm?: number | null
          imc?: number | null
          presion_sistolica?: number | null
          presion_diastolica?: number | null
          frecuencia_cardiaca?: number | null
          frecuencia_respiratoria?: number | null
          temperatura?: number | null
          saturacion_oxigeno?: number | null
          exploracion_cabeza?: string | null
          exploracion_cuello?: string | null
          exploracion_torax?: string | null
          exploracion_abdomen?: string | null
          exploracion_extremidades?: string | null
          exploracion_columna?: string | null
          exploracion_piel?: string | null
          exploracion_neurologico?: string | null
          estudios_laboratorio?: Json | null
          estudios_gabinete?: Json | null
          agudeza_visual_od?: string | null
          agudeza_visual_oi?: string | null
          audiometria_od?: Json | null
          audiometria_oi?: Json | null
          espirometria?: Json | null
          aptitud?: string | null
          restricciones?: string | null
          recomendaciones?: string | null
          observaciones?: string | null
          proxima_evaluacion?: string | null
          firmado?: boolean
          fecha_firma?: string | null
          firma_medico_url?: string | null
          updated_at?: string
        }
      }
      cie10_categorias: {
        Row: {
          id: string
          codigo: string
          descripcion_es: string
          descripcion_en: string | null
          capitulo: string | null
          grupo: string | null
          es_causa_externa: boolean
          es_enfermedad_laboral: boolean
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          codigo: string
          descripcion_es: string
          descripcion_en?: string | null
          capitulo?: string | null
          grupo?: string | null
          es_causa_externa?: boolean
          es_enfermedad_laboral?: boolean
          activo?: boolean
          created_at?: string
        }
        Update: {
          codigo?: string
          descripcion_es?: string
          descripcion_en?: string | null
          capitulo?: string | null
          grupo?: string | null
          es_causa_externa?: boolean
          es_enfermedad_laboral?: boolean
          activo?: boolean
        }
      }
      diagnosticos_examen: {
        Row: {
          id: string
          examen_id: string
          cie10_codigo: string
          tipo: string
          descripcion_adicional: string | null
          fecha_diagnostico: string
          created_at: string
        }
        Insert: {
          id?: string
          examen_id: string
          cie10_codigo: string
          tipo: string
          descripcion_adicional?: string | null
          fecha_diagnostico?: string
          created_at?: string
        }
        Update: {
          examen_id?: string
          cie10_codigo?: string
          tipo?: string
          descripcion_adicional?: string | null
          fecha_diagnostico?: string
        }
      }
      incapacidades: {
        Row: {
          id: string
          empresa_id: string
          paciente_id: string
          medico_id: string | null
          tipo: string
          cie10_codigo: string
          diagnostico_descripcion: string | null
          fecha_inicio: string
          fecha_fin: string
          dias_totales: number
          folio_imss: string | null
          numero_incapacidad: string | null
          documento_url: string | null
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          paciente_id: string
          medico_id?: string | null
          tipo: string
          cie10_codigo: string
          diagnostico_descripcion?: string | null
          fecha_inicio: string
          fecha_fin: string
          folio_imss?: string | null
          numero_incapacidad?: string | null
          documento_url?: string | null
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          empresa_id?: string
          paciente_id?: string
          medico_id?: string | null
          tipo?: string
          cie10_codigo?: string
          diagnostico_descripcion?: string | null
          fecha_inicio?: string
          fecha_fin?: string
          folio_imss?: string | null
          numero_incapacidad?: string | null
          documento_url?: string | null
          observaciones?: string | null
          updated_at?: string
        }
      }
      citas: {
        Row: {
          id: string
          empresa_id: string
          paciente_id: string
          medico_id: string | null
          tipo_cita: string
          fecha: string
          hora_inicio: string
          hora_fin: string | null
          duracion_minutos: number
          estado: string
          motivo: string | null
          notas: string | null
          recordatorio_enviado: boolean
          fecha_recordatorio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          paciente_id: string
          medico_id?: string | null
          tipo_cita: string
          fecha: string
          hora_inicio: string
          hora_fin?: string | null
          duracion_minutos?: number
          estado?: string
          motivo?: string | null
          notas?: string | null
          recordatorio_enviado?: boolean
          fecha_recordatorio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          empresa_id?: string
          paciente_id?: string
          medico_id?: string | null
          tipo_cita?: string
          fecha?: string
          hora_inicio?: string
          hora_fin?: string | null
          duracion_minutos?: number
          estado?: string
          motivo?: string | null
          notas?: string | null
          recordatorio_enviado?: boolean
          fecha_recordatorio?: string | null
          updated_at?: string
        }
      }
      certificados: {
        Row: {
          id: string
          empresa_id: string
          paciente_id: string
          examen_id: string | null
          medico_id: string
          tipo_certificado: string
          folio: string
          fecha_emision: string
          fecha_vigencia: string | null
          contenido: Json
          firmado: boolean
          firma_digital_hash: string | null
          firma_url: string | null
          fecha_firma: string | null
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          paciente_id: string
          examen_id?: string | null
          medico_id: string
          tipo_certificado: string
          folio: string
          fecha_emision?: string
          fecha_vigencia?: string | null
          contenido: Json
          firmado?: boolean
          firma_digital_hash?: string | null
          firma_url?: string | null
          fecha_firma?: string | null
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          empresa_id?: string
          paciente_id?: string
          examen_id?: string | null
          medico_id?: string
          tipo_certificado?: string
          folio?: string
          fecha_emision?: string
          fecha_vigencia?: string | null
          contenido?: Json
          firmado?: boolean
          firma_digital_hash?: string | null
          firma_url?: string | null
          fecha_firma?: string | null
          pdf_url?: string | null
        }
      }
      configuracion_empresa: {
        Row: {
          id: string
          empresa_id: string
          zona_horaria: string
          formato_fecha: string
          duracion_cita_default: number
          horario_inicio: string
          horario_fin: string
          dias_laborales: number[]
          recordatorio_cita_horas: number
          alerta_examen_dias: number
          prefijo_folio: string
          contador_folio: number
          openai_api_key_encrypted: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          zona_horaria?: string
          formato_fecha?: string
          duracion_cita_default?: number
          horario_inicio?: string
          horario_fin?: string
          dias_laborales?: number[]
          recordatorio_cita_horas?: number
          alerta_examen_dias?: number
          prefijo_folio?: string
          contador_folio?: number
          openai_api_key_encrypted?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          empresa_id?: string
          zona_horaria?: string
          formato_fecha?: string
          duracion_cita_default?: number
          horario_inicio?: string
          horario_fin?: string
          dias_laborales?: number[]
          recordatorio_cita_horas?: number
          alerta_examen_dias?: number
          prefijo_folio?: string
          contador_folio?: number
          openai_api_key_encrypted?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          empresa_id: string
          usuario_id: string | null
          tipo: string
          titulo: string
          mensaje: string
          datos: Json | null
          leida: boolean
          fecha_lectura: string | null
          enviada_push: boolean
          fcm_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          usuario_id?: string | null
          tipo: string
          titulo: string
          mensaje: string
          datos?: Json | null
          leida?: boolean
          fecha_lectura?: string | null
          enviada_push?: boolean
          fcm_token?: string | null
          created_at?: string
        }
        Update: {
          empresa_id?: string
          usuario_id?: string | null
          tipo?: string
          titulo?: string
          mensaje?: string
          datos?: Json | null
          leida?: boolean
          fecha_lectura?: string | null
          enviada_push?: boolean
          fcm_token?: string | null
        }
      }
      auditoria_medica: {
        Row: {
          id: string
          empresa_id: string
          usuario_id: string | null
          usuario_email: string | null
          tabla: string
          registro_id: string
          accion: string
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          usuario_id?: string | null
          usuario_email?: string | null
          tabla: string
          registro_id: string
          accion: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          empresa_id?: string
          usuario_id?: string | null
          usuario_email?: string | null
          tabla?: string
          registro_id?: string
          accion?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
    Views: {
      v_pacientes_con_examen: {
        Row: {
          id: string
          empresa_id: string
          nombre: string
          apellido_paterno: string
          numero_empleado: string | null
          puesto: string | null
          ultimo_examen_id: string | null
          ultimo_tipo_examen: string | null
          ultima_fecha_examen: string | null
          ultima_aptitud: string | null
          proxima_evaluacion: string | null
        }
      }
      v_examenes_por_vencer: {
        Row: {
          paciente_id: string
          paciente_nombre: string
          numero_empleado: string | null
          puesto: string | null
          examen_id: string
          tipo_examen: string
          fecha_realizacion: string | null
          proxima_evaluacion: string | null
          dias_para_vencer: number | null
          empresa_id: string
        }
      }
      v_estadisticas_empresa: {
        Row: {
          empresa_id: string
          empresa_nombre: string
          total_pacientes: number
          total_examenes: number
          total_incapacidades: number
          dias_incapacidad_totales: number | null
          citas_hoy: number
        }
      }
    }
    Functions: {
      get_user_empresa_id: {
        Args: Record<string, never>
        Returns: string
      }
      generar_folio_certificado: {
        Args: { p_empresa_id: string }
        Returns: string
      }
    }
  }
}

// Tipos de conveniencia
export type Empresa = Database['public']['Tables']['empresas']['Row']
export type EmpresaInsert = Database['public']['Tables']['empresas']['Insert']
export type EmpresaUpdate = Database['public']['Tables']['empresas']['Update']

export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert']
export type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']

export type Paciente = Database['public']['Tables']['pacientes']['Row']
export type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
export type PacienteUpdate = Database['public']['Tables']['pacientes']['Update']

export type ExamenMedico = Database['public']['Tables']['examenes_medicos']['Row']
export type ExamenMedicoInsert = Database['public']['Tables']['examenes_medicos']['Insert']
export type ExamenMedicoUpdate = Database['public']['Tables']['examenes_medicos']['Update']

export type CIE10 = Database['public']['Tables']['cie10_categorias']['Row']
export type CIE10Insert = Database['public']['Tables']['cie10_categorias']['Insert']
export type CIE10Update = Database['public']['Tables']['cie10_categorias']['Update']

export type DiagnosticoExamen = Database['public']['Tables']['diagnosticos_examen']['Row']
export type Incapacidad = Database['public']['Tables']['incapacidades']['Row']
export type Cita = Database['public']['Tables']['citas']['Row']
export type Certificado = Database['public']['Tables']['certificados']['Row']
export type ConfiguracionEmpresa = Database['public']['Tables']['configuracion_empresa']['Row']
export type Notificacion = Database['public']['Tables']['notificaciones']['Row']
export type AuditoriaMedica = Database['public']['Tables']['auditoria_medica']['Row']
