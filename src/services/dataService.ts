// Servicio de datos reales con Supabase
// Reemplaza mockDataService con queries reales a la base de datos

import { supabase } from '@/lib/supabase'
import { mockDataService } from './mockDataService'

// Helper para detectar modo demo desde servicio (sin hooks de React)
const isDemoMode = () => {
    try {
        const userStr = localStorage.getItem('GPMedical_user');
        if (!userStr) return false;
        const user = JSON.parse(userStr);
        return user.id.startsWith('mock-') ||
            user.id.startsWith('demo-') ||
            user.id.startsWith('u1a') ||
            user.id.startsWith('0000');
    } catch {
        return false;
    }
}

const getDemoUser = () => {
    try {
        const userStr = localStorage.getItem('GPMedical_user');
        return userStr ? JSON.parse(userStr) : { role: 'invitado', id: 'unknown' };
    } catch {
        return { role: 'invitado', id: 'unknown' };
    }
}

// ============================================
// TIPOS
// ============================================

export interface Paciente {
    id: string
    empresa_id: string
    sede_id?: string // Site / Planta / Ubicación
    numero_empleado?: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    curp?: string
    nss?: string
    rfc?: string
    fecha_nacimiento?: string
    genero?: string
    estado_civil?: string
    puesto?: string
    area?: string
    departamento?: string
    turno?: 'Matutino' | 'Vespertino' | 'Nocturno' | 'Mixto'
    fecha_ingreso?: string // Para calcular antigüedad
    tipo_contrato?: string
    jornada_horas?: number
    supervisor_nombre?: string
    tipo_sangre?: string
    alergias?: string
    telefono?: string
    email?: string
    foto_url?: string
    firma_url?: string
    estatus: string
    contacto_emergencia_nombre?: string
    contacto_emergencia_parentesco?: string
    contacto_emergencia_telefono?: string
    created_at: string
    empresa_nombre?: string
    sede_nombre?: string
}

export interface Cita {
    id: string
    empresa_id: string
    paciente_id: string
    medico_id?: string
    sede_id?: string
    tipo: string
    fecha: string
    hora_inicio: string
    hora_fin?: string
    estado: string
    notas?: string
    created_at: string
    // Relaciones
    paciente?: Paciente
}

export interface Examen {
    id: string
    empresa_id: string
    paciente_id: string
    cita_id?: string
    tipo: string
    fecha: string
    dictamen?: string
    estado: string
    resultados?: Record<string, any>
}

// ============================================
// SERVICIO DE PACIENTES
// ============================================

export const pacientesService = {
    // Obtener todos los pacientes (filtrado automático por RLS)
    // Obtener todos los pacientes (filtrado automático por RLS)
    async getAll() {
        if (isDemoMode()) {
            console.log('⚡ [DEMO] Cargando pacientes desde Mock Service')
            const user = getDemoUser();
            const data = await mockDataService.getPacientes({ role: user.rol || 'medico', id: user.id, empresa_id: user.empresa_id });
            // Mapear al formato esperado por la vista
            return data.map((p: any) => ({
                ...p,
                created_at: p.created_at || new Date().toISOString(),
                puesto: p.puesto || (p.puesto_trabajo?.nombre) || '',
                empresa_nombre: 'Empresa Demo',
                sede_nombre: 'Sede Principal'
            })) as Paciente[]
        }

        const { data, error } = await supabase
            .from('pacientes')
            .select(`
                *,
                empresa:empresas(nombre),
                sede:sedes(nombre)
            `)
            .order('apellido_paterno', { ascending: true })

        if (error) throw error
        return (data || []).map((p: any) => ({
            ...p,
            empresa_nombre: p.empresa?.nombre || 'Desconocida',
            sede_nombre: p.sede?.nombre || 'General'
        })) as Paciente[]
    },

    // Obtener un paciente por ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('pacientes')
            .select(`
                *,
                empresa:empresas(nombre),
                sede:sedes(nombre)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return {
            ...data,
            empresa_nombre: data.empresa?.nombre || 'Desconocida',
            sede_nombre: data.sede?.nombre || 'General'
        } as Paciente
    },

    // Obtener un paciente por Email (para conectar auth user con paciente data)
    async getByEmail(email: string) {
        // Primero intentamos match exacto
        let { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .ilike('email', email) // Case insensitive
            .maybeSingle()

        // Si no encuentra por email, intentamos buscar si el ID del usuario coincide (caso link directo)
        if (!data) {
            return null
        }

        return data as Paciente
    },

    async search(query: string) {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .or(`nombre.ilike.%${query}%,apellido_paterno.ilike.%${query}%,curp.ilike.%${query}%`)
            .limit(20)

        if (error) throw error
        return data as Paciente[]
    },

    // Crear paciente
    async create(paciente: Omit<Paciente, 'id' | 'created_at'> & { legal_consent?: any, foto_base64?: string, firma_base64?: string }) {
        if (isDemoMode()) {
            console.log('⚡ [DEMO] Creando paciente localmente')
            const { legal_consent, foto_base64, firma_base64, ...rest } = paciente
            const result = await mockDataService.createPaciente(rest as any)
            return {
                ...result,
                created_at: new Date().toISOString(),
                puesto: (result as any).puesto || (result as any).puesto_trabajo?.nombre || ''
            } as Paciente
        }

        const { legal_consent, foto_base64, firma_base64, ...patientData } = paciente

        // 1. Manejar archivos Base64 si existen
        let foto_url = patientData.foto_url
        let firma_url = patientData.firma_url

        if (foto_base64) {
            try {
                const fileName = `${Date.now()}_foto.jpg`
                const base64Data = foto_base64.split(',')[1]
                const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob())

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('pacientes-fotos')
                    .upload(`${patientData.empresa_id}/${fileName}`, blob)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('pacientes-fotos')
                        .getPublicUrl(`${patientData.empresa_id}/${fileName}`)
                    foto_url = publicUrl
                }
            } catch (err) {
                console.error("Error uploading photo:", err)
            }
        }

        if (firma_base64) {
            try {
                const fileName = `${Date.now()}_firma.png`
                const base64Data = firma_base64.split(',')[1]
                const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob())

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('firmas')
                    .upload(`${patientData.empresa_id}/${fileName}`, blob)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('firmas')
                        .getPublicUrl(`${patientData.empresa_id}/${fileName}`)
                    firma_url = publicUrl
                }
            } catch (err) {
                console.error("Error uploading signature:", err)
            }
        }

        const { data, error } = await supabase
            .from('pacientes')
            .insert({
                ...patientData,
                foto_url,
                firma_url
            })
            .select()
            .single()

        if (error) throw error
        const newPatient = data as Paciente

        if (legal_consent && newPatient.id) {
            const consents = []
            if (legal_consent.privacy_accepted) {
                consents.push({
                    patient_id: newPatient.id,
                    consent_type: 'privacy_policy',
                    version: legal_consent.privacy_version,
                    accepted: true,
                    firma_url: firma_url // Vincular firma al consentimiento
                })
            }
            if (legal_consent.informed_accepted) {
                consents.push({
                    patient_id: newPatient.id,
                    consent_type: 'informed_consent',
                    version: legal_consent.informed_version,
                    accepted: true,
                    firma_url: firma_url
                })
            }
            if (consents.length > 0) {
                await supabase.from('legal_consents').insert(consents)
            }
        }

        return newPatient
    },

    // Actualizar paciente
    async update(id: string, updates: Partial<Paciente>) {
        if (isDemoMode()) {
            console.log('⚡ [DEMO] Actualizando paciente localmente')
            const result = await mockDataService.updatePaciente(id, updates as any)
            return {
                ...result,
                created_at: (result as any).created_at || new Date().toISOString(),
                puesto: (result as any).puesto || (result as any).puesto_trabajo?.nombre || ''
            } as Paciente
        }

        const { data, error } = await supabase
            .from('pacientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Paciente
    },

    // Eliminar paciente
    async delete(id: string) {
        try {
            const { error } = await supabase
                .from('pacientes')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.warn('⚠️ Error deleting paciente (usando mock):', error)
        }
    }
}

// ============================================
// SERVICIO DE CITAS
// ============================================

export const citasService = {
    // Obtener citas del día
    async getByDate(fecha: string) {
        if (isDemoMode()) {
            console.log('⚡ [DEMO] Mock Citas por fecha')
            const user = getDemoUser()
            const citas = await mockDataService.getCitas({ role: user.rol || 'medico', id: user.id || 'unknown', empresa_id: user.empresa_id })
            // Filtrar y mapear
            return citas.filter((c: any) => c.fechaHora.startsWith(fecha)).map((c: any) => ({
                id: c.id,
                fecha: c.fechaHora.split('T')[0],
                hora_inicio: c.fechaHora.split('T')[1].substring(0, 5),
                tipo: c.tipo,
                estado: c.estado,
                paciente: {
                    id: c.paciente_id,
                    nombre: 'Paciente Demo',
                    apellido_paterno: 'Mock',
                }
            })) as Cita[]
        }

        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                paciente:pacientes(id, nombre, apellido_paterno, apellido_materno)
            `)
            .gte('fecha_hora', `${fecha}T00:00:00`)
            .lte('fecha_hora', `${fecha}T23:59:59`)
            .order('fecha_hora', { ascending: true })

        if (error) throw error
        return data as Cita[]
    },

    // Obtener citas por rango de fechas
    async getByDateRange(fechaInicio: string, fechaFin: string) {
        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                paciente:pacientes(id, nombre, apellido_paterno)
            `)
            .gte('fecha_hora', `${fechaInicio}T00:00:00`)
            .lte('fecha_hora', `${fechaFin}T23:59:59`)
            .order('fecha_hora', { ascending: true })

        if (error) throw error
        return data as Cita[]
    },

    // Obtener citas de un paciente específico
    async getByPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                medico:profiles(nombre, apellido_paterno, especialidad)
            `)
            .eq('paciente_id', pacienteId)
            .order('fecha_hora', { ascending: true }) // Próximas primero

        if (error) throw error
        return data.map((c: any) => ({
            ...c,
            medico_nombre: c.medico ? `${c.medico.nombre} ${c.medico.apellido_paterno || ''}` : undefined,
            especialidad: c.medico?.especialidad
        }))
    },

    // Crear cita
    async create(cita: Omit<Cita, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('citas')
            .insert({
                empresa_id: cita.empresa_id,
                paciente_id: cita.paciente_id,
                medico_id: cita.medico_id,
                fecha_hora: `${cita.fecha}T${cita.hora_inicio}`,
                tipo_cita: cita.tipo,
                estado: cita.estado || 'programada',
                notas: cita.notas
            })
            .select()
            .single()

        if (error) throw error
        return data as Cita
    },

    // Actualizar estado de cita
    async updateStatus(id: string, estado: string) {
        try {
            const { data, error } = await supabase
                .from('citas')
                .update({ estado })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Cita
        } catch (error) {
            console.error('❌ Error updating cita status:', error)
            throw error
        }
    },

    // Cancelar cita
    async cancel(id: string) {
        return this.updateStatus(id, 'cancelada')
    }
}

// ============================================
// SERVICIO DE EXÁMENES
// ============================================

export const examenesService = {
    // Obtener exámenes de un paciente
    async getByPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('ordenes_estudio')
            .select('*')
            .eq('paciente_id', pacienteId)
            .order('fecha_orden', { ascending: false })

        if (error) throw error
        return data as Examen[]
    },

    // Crear examen
    async create(examen: Omit<Examen, 'id'>) {
        const { data, error } = await supabase
            .from('ordenes_estudio')
            .insert({
                ...examen,
                fecha_orden: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data as Examen
    },

    // Actualizar dictamen
    async updateDictamen(id: string, dictamen: string, restricciones?: string) {
        const { error } = await supabase
            .from('ordenes_estudio')
            .update({ resultados: { dictamen, restricciones }, estado: 'completada' })
            .eq('id', id)

        if (error) throw error
    }
}

// ============================================
// SERVICIO DE EMPRESAS (SAAS)
// ============================================

export interface Empresa {
    id: string
    nombre: string
    rfc?: string
    razon_social?: string
    direccion?: string
    telefono?: string
    email?: string
    plan: 'basico' | 'profesional' | 'enterprise'
    activo: boolean
    created_at: string
}

export const empresasService = {
    // Obtener todas las empresas (Solo Super Admin)
    async getAll() {
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Empresa[]
    },

    // Crear empresa
    async create(empresa: Omit<Empresa, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('empresas')
            .insert(empresa)
            .select()
            .single()

        if (error) throw error
        return data as Empresa
    },

    // Actualizar empresa
    async update(id: string, updates: Partial<Empresa>) {
        const { data, error } = await supabase
            .from('empresas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Empresa
    },

    // Cambiar estado (activo/inactivo)
    async toggleStatus(id: string, nuevoEstado: boolean) {
        const { error } = await supabase
            .from('empresas')
            .update({
                activo: nuevoEstado,
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', id)

        if (error) throw error
        return true
    }
}

// ============================================
// SERVICIO DE SEDES (SUCURSALES)
// ============================================

export interface Sede {
    id: string
    empresa_id: string
    nombre: string
    codigo?: string
    email?: string
    telefono?: string
    direccion?: string
    ciudad?: string
    estado?: string
    codigo_postal?: string
    coordinador_medico?: string
    es_sede_principal: boolean
    activa: boolean
    created_at: string
}

export const sedesService = {
    async getAll(empresaId?: string) {
        let query = supabase.from('sedes').select('*')
        if (empresaId) query = query.eq('empresa_id', empresaId)

        const { data, error } = await query.order('nombre', { ascending: true })
        if (error) throw error
        return data as Sede[]
    },

    async create(sede: Omit<Sede, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('sedes')
            .insert(sede)
            .select()
            .single()

        if (error) throw error
        return data as Sede
    },

    async update(id: string, updates: Partial<Sede>) {
        const { data, error } = await supabase
            .from('sedes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Sede
    },

    async toggleStatus(id: string, activa: boolean) {
        const { error } = await supabase
            .from('sedes')
            .update({ activa })
            .eq('id', id)

        if (error) throw error
        return true
    }
}

// ============================================
// SERVICIO DE USUARIOS (ADMIN)
// ============================================

export const usuariosService = {
    // Obtener todos los usuarios
    async getAll(empresaId?: string) {
        let query = supabase
            .from('profiles')
            .select(`
                *,
                empresa:empresas(nombre)
            `)

        if (empresaId) {
            query = query.eq('empresa_id', empresaId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((u: any) => ({
            id: u.id,
            nombre: u.nombre,
            apellido_paterno: u.apellido_paterno,
            apellido_materno: u.apellido_materno,
            email: u.email,
            rol: u.rol_principal || 'usuario',
            empresa: u.empresa?.nombre || 'Sin Empresa',
            estado: u.activo ? 'activo' : 'inactivo',
            foto_url: u.avatar_url,
            telefono: u.telefono || '',
            created_at: u.created_at
        }))
    },

    // Crear usuario en auth.users y public.profiles
    async create(usuario: any) {
        console.log('🚀 Invoking create-user Edge Function for:', usuario.email);

        const { data, error } = await supabase.functions.invoke('create-user', {
            body: usuario
        })

        if (error) throw error
        if (data && data.error) throw new Error(data.error);

        return data
    },

    // Actualizar perfil de usuario
    async update(id: string, updates: any) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                nombre: updates.nombre,
                apellido_paterno: updates.apellido_paterno,
                apellido_materno: updates.apellido_materno,
                telefono: updates.telefono,
                empresa_id: updates.empresa_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (profileError) throw profileError
        return true
    },

    // Cambiar estado (activo/inactivo)
    async toggleStatus(id: string, nuevoEstado: boolean) {
        const { error } = await supabase
            .from('profiles')
            .update({
                activo: nuevoEstado,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error
        return true
    }
}

// ============================================
// SERVICIO DE ESTADÍSTICAS
// ============================================

export const statsService = {
    // Estadísticas generales del dashboard
    async getDashboardStats() {
        const today = new Date().toISOString().split('T')[0]

        const { count: totalPacientes } = await supabase
            .from('pacientes')
            .select('*', { count: 'exact', head: true })

        const { count: citasHoy } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .gte('fecha_hora', `${today}T00:00:00`)
            .lte('fecha_hora', `${today}T23:59:59`)

        const { count: examenesPendientes } = await supabase
            .from('ordenes_estudio')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'pendiente')

        return {
            totalPacientes: totalPacientes || 0,
            citasHoy: citasHoy || 0,
            examenesPendientes: examenesPendientes || 0
        }
    },

    // Estadísticas detalladas de agenda
    async getAgendaStats() {
        const today = new Date().toISOString().split('T')[0]

        const [
            { count: totalHoy },
            { count: completadas },
            { count: pendientes },
            { count: canceladas }
        ] = await Promise.all([
            supabase.from('citas').select('*', { count: 'exact', head: true }).eq('fecha', today),
            supabase.from('citas').select('*', { count: 'exact', head: true }).eq('estado', 'completada'),
            supabase.from('citas').select('*', { count: 'exact', head: true }).eq('estado', 'programada'),
            supabase.from('citas').select('*', { count: 'exact', head: true }).eq('estado', 'cancelada')
        ])

        return {
            citasHoy: totalHoy || 0,
            citasCompletadas: completadas || 0,
            citasPendientes: pendientes || 0,
            citasCanceladas: canceladas || 0,
            tasaCumplimiento: totalHoy && totalHoy > 0 ? Math.round(((completadas || 0) / totalHoy) * 100) : 100
        }
    }
}

// ============================================
// SERVICIO DE CONSULTAS Y CLÍNICA
// ============================================

export const consultasService = {
    // Obtener eventos clínicos de un paciente
    async getEventos(pacienteId: string) {
        const { data, error } = await supabase
            .from('eventos_clinicos')
            .select('*')
            .eq('paciente_id', pacienteId)
            .order('fecha_evento', { ascending: false })

        if (error) throw error
        return data
    },

    // Crear prescripción (Receta)
    async createPrescripcion(prescripcion: any) {
        // 1. Insertar la receta base en `recetas`
        const { data: rec, error: recError } = await supabase
            .from('recetas')
            .insert({
                paciente_id: prescripcion.paciente_id,
                medico_id: prescripcion.medico_id,
                empresa_id: prescripcion.empresa_id, // Añadido en migración
                diagnostico: prescripcion.diagnostico,
                indicaciones_generales: prescripcion.observaciones, // Mapeo correcto
                estado: 'activa'
            })
            .select()
            .single()

        if (recError) throw recError

        // 2. Insertar los medicamentos vinculados en `recetas_detalle`
        const meds = prescripcion.medicamentos.map((m: any) => ({
            receta_id: rec.id,
            medicamento_nombre: m.nombre, // Mapeo correcto
            dosis: m.dosis,
            frecuencia: m.frecuencia,
            duracion: m.duracion,
            via_administracion: m.via_administracion,
            cantidad_solicitada: 1 // Default
        }))

        const { error: medsError } = await supabase.from('recetas_detalle').insert(meds)
        if (medsError) throw medsError

        // 3. Registrar como evento clínico automático
        await supabase.from('eventos_clinicos').insert({
            paciente_id: prescripcion.paciente_id,
            empresa_id: prescripcion.empresa_id,
            tipo_evento: 'prescripcion',
            descripcion: `Receta generada: ${prescripcion.diagnostico ? prescripcion.diagnostico.substring(0, 50) : 'Sin diagnóstico'}...`,
            metadata: { prescripcion_id: rec.id }
        })

        return rec
    },

    // Crear Encuentro Clínico (Eje 2 - Modular)
    async createEncounter(encounter: any) {
        // 1. Insertar el encuentro base en la tabla 'encuentros'
        const { data: enc, error: encError } = await supabase
            .from('encuentros')
            .insert({
                paciente_id: encounter.paciente_id,
                cita_id: encounter.cita_id,
                doctor_id: encounter.doctor_id,
                tipo_encuentro: encounter.tipo_encuentro || 'consulta',
                motivo_consulta: encounter.subjetivo,
                padecimiento_actual: encounter.subjetivo,
                exploracion_fisica: encounter.objetivo.exploracion_general,
                diagnostico_principal: encounter.analisis.diagnostico_principal,
                diagnosticos_secundarios: encounter.analisis.diagnosticos_secundarios.map((d: any) => d.codigo),
                analisis_medico: encounter.analisis.notas_analisis,
                plan_manejo: encounter.plan.recomendaciones,
                signos_vitales: encounter.objetivo.signos,
                medicamentos_prescritos: encounter.plan.medicamentos,
                examenes_solicitados: encounter.plan.examenes,
                especialidad_tipo: encounter.especialidad,
                dictamen: encounter.ocupacional.dictamen,
                restricciones: encounter.plan.restricciones_laborales,
                recomendaciones_empresa: encounter.ocupacional.recomendaciones_empresa,
                soap: {
                    s: encounter.subjetivo,
                    o: encounter.objetivo,
                    a: encounter.analisis,
                    p: encounter.plan,
                    occ: encounter.ocupacional
                },
                metadata_especialidad: encounter.metadata_especialidad
            })
            .select()
            .single()

        if (encError) throw encError

        // 2. Registrar en la línea de tiempo (eventos_clinicos)
        await supabase.from('eventos_clinicos').insert({
            paciente_id: encounter.paciente_id,
            tipo_evento: 'consulta',
            descripcion: `Nota Médica (${encounter.especialidad}): ${encounter.analisis.diagnostico_principal}`,
            metadata: { encuentro_id: enc.id }
        })

        // 3. Si hay medicamentos, crear prescripción vinculada
        if (encounter.plan.medicamentos?.length > 0) {
            const prescription = await this.createPrescripcion({
                paciente_id: encounter.paciente_id,
                medico_id: encounter.doctor_id,
                diagnostico: encounter.analisis.diagnostico_principal,
                observaciones: encounter.plan.recomendaciones,
                medicamentos: encounter.plan.medicamentos
            })

            // 4. Dispensar medicamentos del inventario automáticamente
            if (prescription && encounter.doctor_empresa_id) {
                try {
                    await inventarioService.dispenseFromPrescription(
                        prescription.id,
                        encounter.plan.medicamentos.map((m: any) => ({
                            nombre: m.nombre,
                            cantidad: m.cantidad_prescrita || 1
                        })),
                        encounter.doctor_empresa_id,
                        encounter.doctor_id
                    )
                } catch (invError) {
                    console.warn('⚠️ No se pudo descontar del inventario:', invError)
                }
            }
        }

        return enc
    }
}

// ============================================
// SERVICIO DE INVENTARIO (Eje 3)
// ============================================

export interface Producto {
    id: string
    empresa_id: string
    codigo: string
    nombre: string
    nombre_generico?: string
    descripcion?: string
    categoria: string
    subcategoria?: string
    forma_farmaceutica?: string
    unidad_medida: string
    stock_actual: number
    stock_minimo: number
    stock_maximo?: number
    precio_compra: number
    precio_venta: number
    lote?: string
    fecha_caducidad?: string
    ubicacion_almacen?: string
    requiere_receta?: boolean
    controlado?: boolean
    estado: string // activo, inactivo
    activo?: boolean
}

export interface MovimientoInventario {
    producto_id: string
    tipo_movimiento: 'entrada' | 'salida' | 'ajuste'
    cantidad: number
    motivo: string
    referencia_id?: string
    referencia_tipo?: string
}

export const inventarioService = {
    // Obtener todos los productos
    async getAll() {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('nombre', { ascending: true })

        if (error) throw error
        return data as Producto[]
    },

    // Crear o actualizar un producto
    async upsertProducto(producto: Partial<Producto>) {
        const { data, error } = await supabase
            .from('productos')
            .upsert(producto)
            .select()
            .single()

        if (error) throw error
        return data as Producto
    },

    // Registrar un movimiento de inventario
    async registrarMovimiento(movimiento: MovimientoInventario & { empresa_id: string, usuario_id: string }) {
        // 1. Obtener producto actual para calcular stocks
        const { data: prod, error: prodError } = await supabase
            .from('productos')
            .select('stock_actual')
            .eq('id', movimiento.producto_id)
            .single()

        if (prodError) throw prodError

        const cantidad_antes = prod.stock_actual
        const cantidad_despues = cantidad_antes + movimiento.cantidad

        // 2. Insertar movimiento
        const { error: movError } = await supabase
            .from('movimientos_inventario')
            .insert({
                ...movimiento,
                cantidad_antes,
                cantidad_despues
            })

        if (movError) throw movError

        // 3. Actualizar stock en tabla productos
        const { error: updError } = await supabase
            .from('productos')
            .update({ stock_actual: cantidad_despues })
            .eq('id', movimiento.producto_id)

        if (updError) throw updError

        return true
    },

    // Dispensar medicamentos de una prescripción (descuento automático)
    async dispenseFromPrescription(prescripcionId: string, medicamentos: { nombre: string, cantidad: number }[], empresaId: string, usuarioId: string) {
        const results = []

        for (const med of medicamentos) {
            try {
                // Buscar producto por nombre
                const { data: producto, error: searchError } = await supabase
                    .from('productos')
                    .select('id, stock_actual, nombre')
                    .ilike('nombre', `%${med.nombre}%`)
                    .eq('activo', true)
                    .limit(1)
                    .single()

                if (searchError || !producto) {
                    results.push({ nombre: med.nombre, status: 'not_found' })
                    continue
                }

                // Registrar movimiento de salida
                await this.registrarMovimiento({
                    empresa_id: empresaId,
                    usuario_id: usuarioId,
                    producto_id: producto.id,
                    tipo_movimiento: 'salida',
                    cantidad: -med.cantidad,
                    motivo: `Dispensación receta ${prescripcionId.substring(0, 8)}`,
                    referencia_id: prescripcionId,
                    referencia_tipo: 'prescripcion'
                })

                results.push({ nombre: med.nombre, status: 'dispensed', producto_id: producto.id })
            } catch (error) {
                results.push({ nombre: med.nombre, status: 'error', error })
            }
        }

        return results
    }
}

// ============================================
// SERVICIO DE CERTIFICACIONES (Eje 4)
// ============================================

export interface CertificacionM {
    id: string
    empresa_id: string
    paciente_id: string
    examen_id?: string
    medico_id: string
    tipo_certificacion: string
    numero_certificado: string
    fecha_emision: string
    fecha_vigencia?: string
    resultado: string
    observaciones_medicas?: string
    restricciones?: string
    recomendaciones?: string
    url_documento?: string
    estado: string // vigente, vencido, revocado
}

export const certificacionesService = {
    // Obtener todas las certificaciones
    async getAll() {
        const { data, error } = await supabase
            .from('certificaciones_medicas')
            .select(`
                *,
                paciente:pacientes(nombre, apellido_paterno, apellido_materno),
                medico:profiles(nombre, apellido_paterno, apellido_materno)
            `)
            .order('fecha_emision', { ascending: false })

        if (error) throw error
        return data
    },

    // Crear una certificación
    async create(cert: Partial<CertificacionM>) {
        // Generar folio si no existe
        if (!cert.numero_certificado) {
            const year = new Date().getFullYear()
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
            cert.numero_certificado = `CERT-${year}-${random}`
        }

        const { data, error } = await supabase
            .from('certificaciones_medicas')
            .insert(cert)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Obtener tipos de certificados
    async getTipos() {
        return [
            { id: 'aptitud', nombre: 'Certificado de Aptitud Laboral', vigencia: 365 },
            { id: 'ingreso', nombre: 'Certificado de Ingreso', vigencia: 365 },
            { id: 'periodico', nombre: 'Certificado Periódico', vigencia: 365 },
            { id: 'egreso', nombre: 'Certificado de Egreso', vigencia: 0 }
        ]
    }
}

// ============================================
// SERVICIO DE NOTIFICACIONES (Eje 7)
// ============================================

export interface Notificacion {
    id: string
    user_id: string
    titulo: string
    mensaje: string
    tipo: 'alerta' | 'info' | 'vencimiento' | 'sistema'
    leida: boolean
    created_at: string
}

export const notificacionesService = {
    async getAll() {
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Notificacion[]
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('id', id)

        if (error) throw error
        return true
    },

    async sendExpiryAlert(pacienteId: string, certNumero: string) {
        // En una implementación real, esto dispararía una Edge Function para Email/SMS
        console.log(`Simulando envío de alerta de vencimiento para ${certNumero} al paciente ${pacienteId}`)
        return true
    }
}

export const dataService = {
    pacientes: pacientesService,
    citas: citasService,
    examenes: examenesService,
    usuarios: usuariosService,
    sedes: sedesService,
    empresas: empresasService,
    consultas: consultasService,
    inventario: inventarioService,
    certificaciones: certificacionesService,
    notificaciones: notificacionesService,
    stats: statsService
}

export default dataService
