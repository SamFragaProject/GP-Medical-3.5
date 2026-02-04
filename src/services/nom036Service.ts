import { supabase } from '@/lib/supabase'

export interface EvaluacionNom036 {
    id: string
    empresa_id: string
    puesto_trabajo: string
    descripcion_tarea?: string
    fecha_evaluacion: string
    evaluador_id?: string
    peso_carga_kg: number
    frecuencia_levantamientos?: number
    duracion_tarea_horas?: number
    factores_riesgo: {
        postura_tronco?: 'erguido' | 'flexionado' | 'torsion'
        distancia_vertical?: 'suelo' | 'nudillos' | 'hombros'
        distancia_horizontal?: 'cerca' | 'lejos'
        tipo_agarre?: 'bueno' | 'regular' | 'malo'
        genero_operador?: 'masculino' | 'femenino'
    }
    nivel_riesgo_calculado?: 'bajo' | 'medio' | 'alto' | 'muy_alto'
    color_riesgo?: string
    medidas_preventivas_sugeridas?: string
    estado: 'borrador' | 'finalizado'
}

// Límite de masa acumulada por turno (kg) - Referencia NOM-036
const LIMITES_CARGA = {
    masculino: 25, // kg máximo recomendado general
    femenino: 20   // kg máximo recomendado general
}

export const nom036Service = {
    // --- MOTOR DE CÁLCULO ---
    calculateRisk(data: Partial<EvaluacionNom036>) {
        let score = 0
        const peso = data.peso_carga_kg || 0
        const genero = data.factores_riesgo?.genero_operador || 'masculino'
        const limiteBase = LIMITES_CARGA[genero]

        // 1. Factor Peso (Base)
        const porcentajeCarga = peso / limiteBase

        if (porcentajeCarga <= 0.6) score += 1 // Verde
        else if (porcentajeCarga <= 0.85) score += 2 // Amarillo
        else if (porcentajeCarga <= 1.0) score += 4 // Naranja
        else score += 8 // Rojo (Sobrecarga)

        // 2. Factores Agravantes
        const f = data.factores_riesgo || {}

        if (f.postura_tronco === 'flexionado') score += 2
        if (f.postura_tronco === 'torsion') score += 3

        if (f.distancia_vertical === 'suelo' || f.distancia_vertical === 'hombros') score += 2

        if (f.distancia_horizontal === 'lejos') score += 2

        if (f.tipo_agarre === 'malo') score += 2
        if (f.tipo_agarre === 'regular') score += 1

        // 3. Determinar Nivel Final
        let nivel: EvaluacionNom036['nivel_riesgo_calculado'] = 'bajo'
        let color = 'bg-emerald-500'
        let recomendacion = 'Riesgo aceptable. Mantener vigilancia básica.'

        if (score >= 10) {
            nivel = 'muy_alto'
            color = 'bg-red-600'
            recomendacion = '¡CRÍTICO! Se requiere rediseño inmediato de la tarea o uso de ayudas mecánicas. Detener actividad si es posible.'
        } else if (score >= 7) {
            nivel = 'alto'
            color = 'bg-orange-500'
            recomendacion = 'Riesgo Alto. Se requieren medidas administrativas (rotación) o cambios en el puesto a corto plazo.'
        } else if (score >= 4) {
            nivel = 'medio'
            color = 'bg-yellow-500'
            recomendacion = 'Riesgo Medio. Evaluar posibles mejoras y vigilar fatiga.'
        }

        return { nivel, color, recomendacion, score }
    },

    // --- BASE DE DATOS ---
    async create(evaluacion: Partial<EvaluacionNom036>) {
        // Calcular riesgo antes de guardar
        const analisis = this.calculateRisk(evaluacion)

        const dataToSave = {
            ...evaluacion,
            nivel_riesgo_calculado: analisis.nivel,
            color_riesgo: analisis.color,
            medidas_preventivas_sugeridas: analisis.recomendacion,
            fecha_evaluacion: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('nom036_evaluaciones')
            .insert(dataToSave)
            .select()
            .single()

        if (error) throw error
        return data as EvaluacionNom036
    },

    async getByEmpresa(empresaId: string) {
        const { data, error } = await supabase
            .from('nom036_evaluaciones')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('fecha_evaluacion', { ascending: false })

        if (error) throw error
        return data as EvaluacionNom036[]
    }
}
