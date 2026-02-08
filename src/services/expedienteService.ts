// =====================================================
// SERVICIO: Expediente Clínico - GPMedical ERP Pro
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
  ExpedienteClinico,
  CreateExpedienteDTO,
  UpdateExpedienteDTO,
  APNP,
  AHF,
  HistoriaOcupacional,
  ExploracionFisica,
  ConsentimientoInformado,
  Consulta,
  CreateConsultaDTO,
  Receta,
  CreateRecetaDTO,
  EstudioParaclinico,
  CatalogoCIE,
} from '@/types/expediente';
import { generateFolio } from '@/lib/utils';

// =====================================================
// EXPEDIENTES CLÍNICOS
// =====================================================

export const expedienteService = {
  // Obtener expediente por paciente
  async getByPaciente(pacienteId: string): Promise<ExpedienteClinico | null> {
    const { data, error } = await supabase
      .from('expedientes_clinicos')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, email, telefono),
        empresa:empresas(id, nombre, rfc)
      `)
      .eq('paciente_id', pacienteId)
      .eq('estado', 'activo')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw error;
    }

    return data as ExpedienteClinico;
  },

  // Obtener expediente por ID
  async getById(id: string): Promise<ExpedienteClinico | null> {
    const { data, error } = await supabase
      .from('expedientes_clinicos')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, email, telefono),
        empresa:empresas(id, nombre, rfc)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as ExpedienteClinico;
  },

  // Crear expediente
  async create(dto: CreateExpedienteDTO): Promise<ExpedienteClinico> {
    const { data, error } = await supabase
      .from('expedientes_clinicos')
      .insert([dto])
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno),
        empresa:empresas(id, nombre)
      `)
      .single();

    if (error) throw error;
    return data as ExpedienteClinico;
  },

  // Actualizar expediente
  async update(id: string, dto: UpdateExpedienteDTO): Promise<ExpedienteClinico> {
    const { data, error } = await supabase
      .from('expedientes_clinicos')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExpedienteClinico;
  },

  // Listar expedientes por empresa
  async listByEmpresa(empresaId: string, filters?: {
    estado?: string;
    search?: string;
  }): Promise<ExpedienteClinico[]> {
    let query = supabase
      .from('expedientes_clinicos')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo)
      `)
      .eq('empresa_id', empresaId);

    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters?.search) {
      query = query.or(`paciente.nombre.ilike.%${filters.search}%,paciente.apellido_paterno.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as ExpedienteClinico[];
  },
};

// =====================================================
// APNP - ANTECEDENTES PERSONALES NO PATOLÓGICOS
// =====================================================

export const apnpService = {
  async getByExpediente(expedienteId: string): Promise<APNP | null> {
    const { data, error } = await supabase
      .from('apnp')
      .select('*')
      .eq('expediente_id', expedienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as APNP;
  },

  async createOrUpdate(expedienteId: string, dto: Partial<APNP>): Promise<APNP> {
    // Verificar si existe
    const existing = await this.getByExpediente(expedienteId);

    if (existing) {
      // Actualizar
      const { data, error } = await supabase
        .from('apnp')
        .update(dto)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as APNP;
    } else {
      // Crear
      const { data, error } = await supabase
        .from('apnp')
        .insert([{ ...dto, expediente_id: expedienteId }])
        .select()
        .single();

      if (error) throw error;
      return data as APNP;
    }
  },
};

// =====================================================
// AHF - ANTECEDENTES HEREDOFAMILIARES
// =====================================================

export const ahfService = {
  async getByExpediente(expedienteId: string): Promise<AHF | null> {
    const { data, error } = await supabase
      .from('ahf')
      .select('*')
      .eq('expediente_id', expedienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as AHF;
  },

  async createOrUpdate(expedienteId: string, dto: Partial<AHF>): Promise<AHF> {
    const existing = await this.getByExpediente(expedienteId);

    if (existing) {
      const { data, error } = await supabase
        .from('ahf')
        .update(dto)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as AHF;
    } else {
      const { data, error } = await supabase
        .from('ahf')
        .insert([{ ...dto, expediente_id: expedienteId }])
        .select()
        .single();

      if (error) throw error;
      return data as AHF;
    }
  },
};

// =====================================================
// HISTORIA OCUPACIONAL
// =====================================================

export const historiaOcupacionalService = {
  async listByExpediente(expedienteId: string): Promise<HistoriaOcupacional[]> {
    const { data, error } = await supabase
      .from('historia_ocupacional')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as HistoriaOcupacional[];
  },

  async create(dto: Omit<HistoriaOcupacional, 'id' | 'created_at' | 'updated_at'>): Promise<HistoriaOcupacional> {
    const { data, error } = await supabase
      .from('historia_ocupacional')
      .insert([dto])
      .select()
      .single();

    if (error) throw error;
    return data as HistoriaOcupacional;
  },

  async update(id: string, dto: Partial<HistoriaOcupacional>): Promise<HistoriaOcupacional> {
    const { data, error } = await supabase
      .from('historia_ocupacional')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HistoriaOcupacional;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('historia_ocupacional')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// EXPLORACIÓN FÍSICA
// =====================================================

export const exploracionFisicaService = {
  async listByExpediente(expedienteId: string): Promise<ExploracionFisica[]> {
    const { data, error } = await supabase
      .from('exploracion_fisica')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('fecha_exploracion', { ascending: false });

    if (error) throw error;
    return data as ExploracionFisica[];
  },

  async getLatestByExpediente(expedienteId: string): Promise<ExploracionFisica | null> {
    const { data, error } = await supabase
      .from('exploracion_fisica')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('fecha_exploracion', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as ExploracionFisica;
  },

  async create(dto: Omit<ExploracionFisica, 'id' | 'created_at' | 'updated_at'>): Promise<ExploracionFisica> {
    // Calcular IMC automáticamente
    if (dto.peso_kg && dto.talla_cm) {
      dto.imc = parseFloat((dto.peso_kg / ((dto.talla_cm / 100) ** 2)).toFixed(2));
    }

    // Calcular ICC automáticamente
    if (dto.cintura_cm && dto.cadera_cm) {
      dto.icc = parseFloat((dto.cintura_cm / dto.cadera_cm).toFixed(2));
    }

    const { data, error } = await supabase
      .from('exploracion_fisica')
      .insert([dto])
      .select()
      .single();

    if (error) throw error;
    return data as ExploracionFisica;
  },
};

// =====================================================
// CONSENTIMIENTOS INFORMADOS
// =====================================================

export const consentimientoService = {
  async listByExpediente(expedienteId: string): Promise<ConsentimientoInformado[]> {
    const { data, error } = await supabase
      .from('consentimientos_informados')
      .select(`
        *,
        medico:medico_id(nombre, cedula_profesional)
      `)
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ConsentimientoInformado[];
  },

  async getById(id: string): Promise<ConsentimientoInformado | null> {
    const { data, error } = await supabase
      .from('consentimientos_informados')
      .select(`
        *,
        medico:medico_id(nombre, cedula_profesional)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as ConsentimientoInformado;
  },

  async create(dto: Omit<ConsentimientoInformado, 'id' | 'created_at' | 'updated_at'>): Promise<ConsentimientoInformado> {
    const { data, error } = await supabase
      .from('consentimientos_informados')
      .insert([dto])
      .select()
      .single();

    if (error) throw error;
    return data as ConsentimientoInformado;
  },

  async firmar(id: string, firmaData: {
    firma_digital_data: string;
    firmante_nombre: string;
    ip_firma: string;
    user_agent: string;
  }): Promise<ConsentimientoInformado> {
    const { data, error } = await supabase
      .from('consentimientos_informados')
      .update({
        ...firmaData,
        firmado: true,
        fecha_firma: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ConsentimientoInformado;
  },

  // Plantillas de consentimientos
  getPlantilla(tipo: string): { titulo: string; contenido: string } {
    const plantillas: Record<string, { titulo: string; contenido: string }> = {
      prestacion_servicios: {
        titulo: 'CONSENTIMIENTO INFORMADO PARA PRESTACIÓN DE SERVICIOS MÉDICOS',
        contenido: `Yo, {NOMBRE_PACIENTE}, identificado(a) con {DOCUMENTO}, autorizo a {NOMBRE_CLINICA} para que me realice los exámenes médicos ocupacionales solicitados por {NOMBRE_EMPRESA}.

Declaro que:
1. Se me ha explicado la naturaleza y propósito de los exámenes.
2. Entiendo los riesgos y beneficios de los procedimientos.
3. Autorizo la toma y uso de imágenes si son necesarias.
4. Acepto que los resultados serán compartidos con mi empleador en el contexto de la NOM-004-STPS.

Fecha: {FECHA}`,
      },
      manejo_datos: {
        titulo: 'CONSENTIMIENTO PARA MANEJO DE DATOS PERSONALES',
        contenido: `De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, autorizo el tratamiento de mis datos personales para fines de historial clínico y cumplimiento normativo.

Mis datos serán tratados con estricta confidencialidad...`,
      },
    };

    return plantillas[tipo] || { titulo: '', contenido: '' };
  },
};

// =====================================================
// CONSULTAS MÉDICAS
// =====================================================

export const consultaService = {
  async listByExpediente(expedienteId: string): Promise<Consulta[]> {
    const { data, error } = await supabase
      .from('consultas')
      .select(`
        *,
        medico:medico_id(nombre, especialidad)
      `)
      .eq('expediente_id', expedienteId)
      .order('fecha_consulta', { ascending: false });

    if (error) throw error;
    return data as Consulta[];
  },

  async getById(id: string): Promise<Consulta | null> {
    const { data, error } = await supabase
      .from('consultas')
      .select(`
        *,
        medico:medico_id(nombre, especialidad)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Consulta;
  },

  async create(dto: CreateConsultaDTO): Promise<Consulta> {
    const { data, error } = await supabase
      .from('consultas')
      .insert([dto])
      .select(`
        *,
        medico:medico_id(nombre, especialidad)
      `)
      .single();

    if (error) throw error;
    return data as Consulta;
  },

  async update(id: string, dto: Partial<Consulta>): Promise<Consulta> {
    const { data, error } = await supabase
      .from('consultas')
      .update(dto)
      .eq('id', id)
      .select(`
        *,
        medico:medico_id(nombre, especialidad)
      `)
      .single();

    if (error) throw error;
    return data as Consulta;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// CATÁLOGO CIE-10
// =====================================================

export const catalogoCIEService = {
  async search(query: string, limit: number = 20): Promise<CatalogoCIE[]> {
    const { data, error } = await supabase
      .from('catalogo_cie')
      .select('*')
      .or(`codigo.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .eq('activo', true)
      .order('frecuencia_uso', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CatalogoCIE[];
  },

  async getFavoritos(): Promise<CatalogoCIE[]> {
    const { data, error } = await supabase
      .from('catalogo_cie')
      .select('*')
      .eq('es_favorito', true)
      .eq('activo', true)
      .order('frecuencia_uso', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as CatalogoCIE[];
  },

  async incrementarFrecuencia(codigo: string): Promise<void> {
    await supabase.rpc('incrementar_frecuencia_cie', { codigo_cie: codigo });
  },

  async getByCodigo(codigo: string): Promise<CatalogoCIE | null> {
    const { data, error } = await supabase
      .from('catalogo_cie')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as CatalogoCIE;
  },
};

// =====================================================
// RECETAS
// =====================================================

export const recetaService = {
  async listByExpediente(expedienteId: string): Promise<Receta[]> {
    const { data, error } = await supabase
      .from('recetas')
      .select(`
        *,
        medicamentos:recetas_detalle(*)
      `)
      .eq('expediente_id', expedienteId)
      .order('fecha_receta', { ascending: false });

    if (error) throw error;
    return data as Receta[];
  },

  async getById(id: string): Promise<Receta | null> {
    const { data, error } = await supabase
      .from('recetas')
      .select(`
        *,
        medicamentos:recetas_detalle(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Receta;
  },

  async create(dto: CreateRecetaDTO): Promise<Receta> {
    // Insertar receta
    const { data: receta, error: errorReceta } = await supabase
      .from('recetas')
      .insert([{
        consulta_id: dto.consulta_id,
        paciente_id: dto.paciente_id,
        diagnostico: dto.diagnostico,
        indicaciones_generales: dto.indicaciones_generales,
      }])
      .select()
      .single();

    if (errorReceta) throw errorReceta;

    // Insertar medicamentos
    if (dto.medicamentos && dto.medicamentos.length > 0) {
      const medicamentosConRecetaId = dto.medicamentos.map(m => ({
        ...m,
        receta_id: receta.id,
      }));

      const { error: errorMedicamentos } = await supabase
        .from('recetas_detalle')
        .insert(medicamentosConRecetaId);

      if (errorMedicamentos) throw errorMedicamentos;
    }

    // Retornar receta completa
    return this.getById(receta.id) as Promise<Receta>;
  },

  async surtirMedicamento(detalleId: string, cantidadSurtida: number, surtidoPor: string): Promise<void> {
    const { error } = await supabase
      .from('recetas_detalle')
      .update({
        cantidad_surtida: cantidadSurtida,
        surtido: true,
      })
      .eq('id', detalleId);

    if (error) throw error;

    // Verificar si todos los medicamentos están surtidos
    const { data: detalle } = await supabase
      .from('recetas_detalle')
      .select('receta_id')
      .eq('id', detalleId)
      .single();

    if (detalle) {
      const { data: medicamentos } = await supabase
        .from('recetas_detalle')
        .select('*')
        .eq('receta_id', detalle.receta_id);

      const todosSurtidos = medicamentos?.every(m => m.surtido);
      const algunoSurtido = medicamentos?.some(m => m.surtido);

      let nuevoEstado = 'activa';
      if (todosSurtidos) nuevoEstado = 'surtida_total';
      else if (algunoSurtido) nuevoEstado = 'surtida_parcial';

      await supabase
        .from('recetas')
        .update({
          estado: nuevoEstado,
          surtida_por: surtidoPor,
          fecha_surtido: new Date().toISOString(),
        })
        .eq('id', detalle.receta_id);
    }
  },
};
