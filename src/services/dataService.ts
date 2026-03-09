// Servicio de datos — Conexión directa con Supabase
// Con fallback a datos demo cuando Supabase no está disponible
// Todos los datos provienen de la base de datos real cuando hay conexión

import { supabase } from '@/lib/supabase'
import { PACIENTES_DEMO_COMPLETOS } from '@/data/demoPacientes3'

// Flag de modo demo
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// Cache de pacientes creados en modo demo (localStorage)
function getDemoLocalPacientes(): Paciente[] {
    try {
        const stored = localStorage.getItem('GPMedical_demo_pacientes')
        return stored ? JSON.parse(stored) : []
    } catch { return [] }
}
function saveDemoLocalPacientes(pacientes: Paciente[]) {
    localStorage.setItem('GPMedical_demo_pacientes', JSON.stringify(pacientes))
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
    riesgos_ocupacionales?: any
    analisis_puesto_ai?: any
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
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('pacientes')
                .select(`
                    *,
                    empresa:empresas(nombre)
                `)
                .order('apellido_paterno', { ascending: true })

            if (error) throw error

            return (data || []).map((p: any) => ({
                ...p,
                empresa_nombre: p.empresa?.nombre || 'Sin empresa',
                sede_nombre: p.sede_nombre || 'General'
            })) as Paciente[]
        } catch (err) {
            console.warn('⚠️ Error cargando pacientes:', err)
            return []
        }
    },

    // Obtener un paciente por ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('pacientes')
            .select(`
                *,
                empresa:empresas(nombre)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return {
            ...data,
            empresa_nombre: data.empresa?.nombre || 'Sin empresa',
            sede_nombre: data.sede_nombre || 'General'
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
        try {
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .or(`nombre.ilike.%${query}%,apellido_paterno.ilike.%${query}%,curp.ilike.%${query}%`)
                .limit(20)

            if (error) throw error
            return data as Paciente[]
        } catch {
            return []
        }
    },


    // Crear paciente
    // Con fallback a localStorage si Supabase no está disponible
    async create(paciente: Omit<Paciente, 'id' | 'created_at'> & { legal_consent?: any, foto_base64?: string, firma_base64?: string }) {

        const { legal_consent, foto_base64, firma_base64, ...patientData } = paciente

        // 1. Manejar archivos Base64 si existen
        let foto_url = patientData.foto_url
        let firma_url = patientData.firma_url

        try {
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
                        firma_url: firma_url
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
        } catch (err: any) {
            // Log detallado del error real
            console.error('❌ Error creando paciente en Supabase:', {
                message: err.message,
                code: err.code,
                details: err.details,
                hint: err.hint,
                status: err.status,
            })

            // Solo hacer fallback a localStorage para errores de RED (FETCH_ERROR/timeout)
            // Para errores de DB (RLS, constraints, etc) → relanzar el error para que el usuario lo vea
            const isNetworkError = err.message?.includes('SUPABASE_TIMEOUT') ||
                err.message?.includes('Failed to fetch') ||
                err.message?.includes('NetworkError')

            if (isNetworkError) {
                console.warn('⚠️ Red no disponible, guardando en localStorage como respaldo')
                const newPatient: Paciente = {
                    ...patientData,
                    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    foto_url: foto_url || '',
                    firma_url: firma_url || '',
                    created_at: new Date().toISOString(),
                    empresa_nombre: 'MediWork Ocupacional',
                    sede_nombre: 'Matriz CDMX',
                }
                const localPacs = getDemoLocalPacientes()
                localPacs.push(newPatient)
                saveDemoLocalPacientes(localPacs)
                return newPatient
            }

            // Para errores de DB → relanzar con mensaje claro
            const friendlyMessages: Record<string, string> = {
                '42501': 'Sin permisos para crear pacientes. Contacte al administrador.',
                '23505': 'Ya existe un paciente con esos datos (CURP/RFC duplicado).',
                '23502': 'Faltan datos obligatorios para crear el paciente.',
                '23503': 'Referencia inválida (empresa no encontrada).',
            }
            const friendlyMsg = friendlyMessages[err.code] || err.message || 'Error desconocido al guardar'
            throw new Error(friendlyMsg)
        }
    },

    // Actualizar paciente (acepta campos extras como JSONB que no están en el tipo Paciente)
    async update(id: string, updates: Record<string, any>) {
        // Eliminar campos computados/join que no existen como columnas en la DB
        const { empresa_nombre, sede_nombre, empresa, _confianza, _campos_encontrados, _campos_faltantes, _texto_original, ...cleanUpdates } = updates
        console.log('📝 pacientesService.update — id:', id, 'fields:', Object.keys(cleanUpdates))
        const { data, error } = await supabase
            .from('pacientes')
            .update(cleanUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('❌ Error actualizando paciente:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            })
            throw new Error(error.message || 'Error al actualizar paciente')
        }
        console.log('✅ Paciente actualizado exitosamente:', data?.id)
        return data as Paciente
    },

    // Eliminar paciente
    async delete(id: string) {
        // Helper: delete from table, ignore if table doesn't exist
        const safeDelete = async (table: string, column: string, value: string | string[]) => {
            try {
                if (Array.isArray(value)) {
                    await supabase.from(table).delete().in(column, value)
                } else {
                    await supabase.from(table).delete().eq(column, value)
                }
            } catch (e: any) {
                console.warn(`[Delete cascade] Tabla "${table}" no encontrada o error:`, e.message)
            }
        }

        // 1. Eliminar sub-registros de estudios clínicos
        const { data: estudios } = await supabase
            .from('estudios_clinicos').select('id').eq('paciente_id', id)
        if (estudios && estudios.length > 0) {
            const estudioIds = estudios.map(e => e.id)
            await safeDelete('resultados_estudio', 'estudio_id', estudioIds)
            await safeDelete('graficas_estudio', 'estudio_id', estudioIds)
        }

        // 2. Eliminar estudios clínicos y citas
        await safeDelete('estudios_clinicos', 'paciente_id', id)
        await safeDelete('citas', 'paciente_id', id)

        // 3. Eliminar tablas potenciales del paciente
        const tablasHijas = [
            'espirometrias', 'examenes', 'recetas', 'incapacidades',
            'antecedentes_paciente', 'documentos_paciente', 'notas_medicas',
            'legal_consents', 'dictamenes', 'ordenes_estudio'
        ]
        for (const tabla of tablasHijas) {
            await safeDelete(tabla, tabla === 'legal_consents' ? 'patient_id' : 'paciente_id', id)
        }

        // 4. Eliminar finalmente el paciente
        const { error } = await supabase
            .from('pacientes')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

// ============================================
// SERVICIO DE CITAS
// ============================================

export const citasService = {
    // Obtener citas del día
    async getByDate(fecha: string) {

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
    headcount_contratado?: number
    contrato_vigencia_fin?: string
    estatus_contrato?: 'activo' | 'por_vencer' | 'vencido' | 'demo'
    servicios_activos?: string[]
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

// SERVICIOS B2B (Contactos, Documentos, SLA)
export const b2bService = {
    async getContactos(empresaId: string) {
        const { data, error } = await supabase
            .from('empresa_contactos')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('es_principal', { ascending: false })
        if (error) throw error
        return data
    },
    async upsertContacto(contacto: any) {
        const { data, error } = await supabase
            .from('empresa_contactos')
            .upsert(contacto)
            .select()
            .single()
        if (error) throw error
        return data
    },
    async getDocumentos(empresaId: string) {
        const { data, error } = await supabase
            .from('empresa_documentos')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },
    async upsertDocumento(documento: any) {
        const { data, error } = await supabase
            .from('empresa_documentos')
            .upsert(documento)
            .select()
            .single()
        if (error) throw error
        return data
    },
    async getServicios(empresaId: string) {
        const { data, error } = await supabase
            .from('empresa_servicios')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre_servicio', { ascending: true })
        if (error) throw error
        return data
    },
    async upsertServicio(servicio: any) {
        const { data, error } = await supabase
            .from('empresa_servicios')
            .upsert(servicio)
            .select()
            .single()
        if (error) throw error
        return data
    },

    // ── Métricas 360 en tiempo real ──
    async getMetricas360(empresaId: string) {
        // Headcount real (pacientes activos de la empresa)
        const { count: headcountReal } = await supabase
            .from('pacientes')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)

        // Headcount contratado desde empresa
        const { data: empData } = await supabase
            .from('empresas')
            .select('headcount_contratado, contrato_vigencia_fin, estatus_contrato, servicios_activos')
            .eq('id', empresaId)
            .single()

        const headcountContratado = empData?.headcount_contratado || 0
        const porcentajeCupo = headcountContratado > 0
            ? Math.round(((headcountReal || 0) / headcountContratado) * 100) : 0

        // Dictámenes para indicadores de aptitud
        const { data: dictamenes } = await supabase
            .from('dictamenes')
            .select('resultado')
            .eq('empresa_id', empresaId)

        const totalDictamenes = dictamenes?.length || 0
        const aptos = dictamenes?.filter(d => d.resultado === 'apto').length || 0
        const aptosConRestriccion = dictamenes?.filter(d => d.resultado === 'apto_con_restriccion').length || 0
        const noAptos = dictamenes?.filter(d => d.resultado === 'no_apto').length || 0
        const pendientes = Math.max(0, (headcountReal || 0) - totalDictamenes)

        const pctAptos = totalDictamenes > 0 ? Math.round((aptos / totalDictamenes) * 100) : 0
        const pctRestriccion = totalDictamenes > 0 ? Math.round((aptosConRestriccion / totalDictamenes) * 100) : 0
        const pctNoAptos = totalDictamenes > 0 ? Math.round((noAptos / totalDictamenes) * 100) : 0

        // Sedes count
        const { count: sedesCount } = await supabase
            .from('sedes')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('activa', true)

        // Vigencia del contrato
        const vigenciaFin = empData?.contrato_vigencia_fin || null
        const diasParaVencer = vigenciaFin
            ? Math.ceil((new Date(vigenciaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null

        return {
            headcountReal: headcountReal || 0,
            headcountContratado,
            porcentajeCupo,
            aptos,
            aptosConRestriccion,
            noAptos,
            pendientes,
            pctAptos,
            pctRestriccion,
            pctNoAptos,
            sedesActivas: sedesCount || 0,
            vigenciaFin,
            diasParaVencer,
            estatusContrato: empData?.estatus_contrato || 'activo',
            serviciosActivos: empData?.servicios_activos || []
        }
    },

    // ── Hallazgos por tipo de riesgo ──
    async getHallazgosPorRiesgo(empresaId: string) {
        // Buscar exámenes de la empresa con sus resultados
        const { data: examenes } = await supabase
            .from('examenes_medicos')
            .select('tipo, resultados, dictamen')
            .eq('empresa_id', empresaId)

        // Buscar alertas de vigilancia 
        const { data: alertas } = await supabase
            .from('alertas_vigilancia')
            .select('tipo_riesgo, severidad, descripcion')
            .eq('empresa_id', empresaId)

        // Categorizar hallazgos por riesgo
        const categorias: Record<string, { total: number, criticos: number, leves: number }> = {
            'Ruido (Hipoacusia)': { total: 0, criticos: 0, leves: 0 },
            'Cargas (Ergonómico)': { total: 0, criticos: 0, leves: 0 },
            'Químicos': { total: 0, criticos: 0, leves: 0 },
            'Psicosocial': { total: 0, criticos: 0, leves: 0 },
            'Visual': { total: 0, criticos: 0, leves: 0 },
            'Cardiovascular': { total: 0, criticos: 0, leves: 0 },
            'Otros': { total: 0, criticos: 0, leves: 0 }
        }

        // Mapear tipos de examen/alerta a categorías de riesgo
        const mapeoRiesgo: Record<string, string> = {
            'audiometria': 'Ruido (Hipoacusia)',
            'espirometria': 'Químicos',
            'ergonomico': 'Cargas (Ergonómico)',
            'psicosocial': 'Psicosocial',
            'visual': 'Visual',
            'optometria': 'Visual',
            'cardiovascular': 'Cardiovascular',
            'ekg': 'Cardiovascular',
            'ruido': 'Ruido (Hipoacusia)',
            'quimicos': 'Químicos',
            'cargas': 'Cargas (Ergonómico)',
        }

        // Procesar exámenes con hallazgos
        examenes?.forEach(ex => {
            if (ex.dictamen && ex.dictamen !== 'apto') {
                const tipo = ex.tipo?.toLowerCase() || ''
                let categoria = 'Otros'
                for (const [key, val] of Object.entries(mapeoRiesgo)) {
                    if (tipo.includes(key)) { categoria = val; break }
                }
                categorias[categoria].total++
                if (ex.dictamen === 'no_apto') categorias[categoria].criticos++
                else categorias[categoria].leves++
            }
        })

        // Procesar alertas de vigilancia
        alertas?.forEach(a => {
            const tipo = a.tipo_riesgo?.toLowerCase() || ''
            let categoria = 'Otros'
            for (const [key, val] of Object.entries(mapeoRiesgo)) {
                if (tipo.includes(key)) { categoria = val; break }
            }
            categorias[categoria].total++
            if (a.severidad === 'critica') categorias[categoria].criticos++
            else categorias[categoria].leves++
        })

        return Object.entries(categorias)
            .map(([nombre, datos]) => ({ nombre, ...datos }))
            .filter(h => h.total > 0)
            .sort((a, b) => b.total - a.total)
    },

    // ── Reportes disponibles por empresa ──
    async getReportesDisponibles(empresaId: string) {
        // Obtener datos para generar reportes
        const { count: totalPacientes } = await supabase
            .from('pacientes')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)

        const { count: totalExamenes } = await supabase
            .from('examenes_medicos')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)

        const { count: totalCerts } = await supabase
            .from('certificaciones_medicas')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)

        const ahora = new Date()
        const mesActual = ahora.toLocaleString('es-MX', { month: 'long', year: 'numeric' })
        const year = ahora.getFullYear()

        return [
            {
                id: 'reporte-aptitud',
                titulo: 'Reporte de Aptitud Laboral',
                descripcion: `Indicadores de aptitud de ${totalPacientes || 0} trabajadores`,
                tipo: 'STPS',
                periodo: mesActual,
                registros: totalPacientes || 0,
                disponible: (totalPacientes || 0) > 0,
                normas: ['NOM-030']
            },
            {
                id: 'reporte-hallazgos',
                titulo: 'Reporte de Hallazgos por Riesgo',
                descripcion: 'Resumen de hallazgos categorizados por tipo de riesgo ocupacional',
                tipo: 'STPS',
                periodo: mesActual,
                registros: totalExamenes || 0,
                disponible: (totalExamenes || 0) > 0,
                normas: ['NOM-011', 'NOM-036']
            },
            {
                id: 'reporte-audiometrias',
                titulo: 'Reporte Audiométrico (NOM-011)',
                descripcion: 'Resultados audiométricos y vigilancia de hipoacusia',
                tipo: 'NOM-011',
                periodo: mesActual,
                registros: 0,
                disponible: (totalExamenes || 0) > 0,
                normas: ['NOM-011-STPS-2001']
            },
            {
                id: 'reporte-ergonomico',
                titulo: 'Reporte Ergonómico (NOM-036)',
                descripcion: 'Evaluación de factores de riesgo ergonómico y manejo de cargas',
                tipo: 'NOM-036',
                periodo: mesActual,
                registros: 0,
                disponible: (totalExamenes || 0) > 0,
                normas: ['NOM-036-1-STPS-2018']
            },
            {
                id: 'reporte-psicosocial',
                titulo: 'Reporte Psicosocial (NOM-035)',
                descripcion: 'Evaluación de factores de riesgo psicosocial en el trabajo',
                tipo: 'NOM-035',
                periodo: mesActual,
                registros: 0,
                disponible: true,
                normas: ['NOM-035-STPS-2018']
            },
            {
                id: 'reporte-certificaciones',
                titulo: 'Reporte de Certificaciones',
                descripcion: `${totalCerts || 0} certificaciones emitidas y vigentes`,
                tipo: 'Interno',
                periodo: `${year}`,
                registros: totalCerts || 0,
                disponible: (totalCerts || 0) > 0,
                normas: []
            },
            {
                id: 'reporte-anual',
                titulo: 'Reporte Anual de Salud Ocupacional',
                descripcion: `Consolidado anual ${year} — indicadores, hallazgos y cumplimiento`,
                tipo: 'Gerencial',
                periodo: `${year}`,
                registros: totalPacientes || 0,
                disponible: (totalPacientes || 0) > 0,
                normas: ['NOM-030', 'NOM-011', 'NOM-035', 'NOM-036']
            }
        ]
    },

    // ── Cumplimiento normativo histórico ──
    async getCumplimientoHistorico(empresaId: string) {
        // Simular datos históricos basados en registros reales
        const { data: certs } = await supabase
            .from('certificaciones_medicas')
            .select('fecha_emision, resultado')
            .eq('empresa_id', empresaId)
            .order('fecha_emision', { ascending: true })

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const ahora = new Date()
        const datos = []

        for (let i = 5; i >= 0; i--) {
            const mesIdx = (ahora.getMonth() - i + 12) % 12
            const certsDelMes = certs?.filter(c => {
                const f = new Date(c.fecha_emision)
                return f.getMonth() === mesIdx
            }) || []

            const total = certsDelMes.length
            const aptosDelMes = certsDelMes.filter(c => c.resultado === 'apto' || c.resultado === 'vigente').length
            const valor = total > 0 ? Math.round((aptosDelMes / total) * 100) : (i === 0 ? 0 : null)

            datos.push({
                name: meses[mesIdx],
                value: valor ?? 0
            })
        }

        return datos
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
    b2b: b2bService,
    consultas: consultasService,
    inventario: inventarioService,
    certificaciones: certificacionesService,
    notificaciones: notificacionesService,
    stats: statsService
}

export default dataService
