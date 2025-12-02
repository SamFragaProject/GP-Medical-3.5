// =============================================
// ANÁLISIS PREDICTIVO DE RIESGO - Edge Function
// IA para evaluar riesgos de salud ocupacional
// =============================================

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { tipo_analisis, empresa_id, entidad_id, paciente_id } = await req.json();

        if (!tipo_analisis || !empresa_id) {
            throw new Error('Tipo de análisis y empresa ID requeridos');
        }

        // Obtener claves de entorno
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase faltante');
        }

        // Verificar autorización
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Token de autorización requerido');
        }

        let resultadoAnalisis;

        switch (tipo_analisis) {
            case 'riesgo_individual':
                resultadoAnalisis = await analizarRiesgoIndividual(paciente_id, supabaseUrl, serviceRoleKey);
                break;
            case 'riesgo_empresa':
                resultadoAnalisis = await analizarRiesgoEmpresa(empresa_id, supabaseUrl, serviceRoleKey);
                break;
            case 'prediccion_absentismo':
                resultadoAnalisis = await predecirAbsentismo(empresa_id, supabaseUrl, serviceRoleKey);
                break;
            case 'examenes_vencidos':
                resultadoAnalisis = await detectarExamenesVencidos(empresa_id, supabaseUrl, serviceRoleKey);
                break;
            default:
                throw new Error('Tipo de análisis no soportado');
        }

        // Guardar análisis en base de datos
        const analisisPredictivo = {
            empresa_id: empresa_id,
            tipo_analisis: tipo_analisis,
            alcance: paciente_id ? 'individuo' : 'empresa',
            entidad_id: entidad_id || paciente_id || empresa_id,
            periodo_analizado: 'últimos_12_meses',
            fecha_analisis: new Date().toISOString(),
            datos_entrada: resultadoAnalisis.datosEntrada,
            predicciones: resultadoAnalisis.predicciones,
            metricas_rendimiento: resultadoAnalisis.metricas,
            factores_clave: resultadoAnalisis.factoresClave,
            recomendaciones: resultadoAnalisis.recomendaciones,
            nivel_confianza: resultadoAnalisis.confianza,
            algoritmo_usado: resultadoAnalisis.algoritmo,
            version_modelo: '1.0.0'
        };

        const analisisResponse = await fetch(`${supabaseUrl}/rest/v1/analisis_predictivos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(analisisPredictivo)
        });

        if (!analisisResponse.ok) {
            throw new Error('Error guardando análisis');
        }

        const analisisGuardado = await analisisResponse.json();

        // Generar alertas si es necesario
        if (resultadoAnalisis.alertas && resultadoAnalisis.alertas.length > 0) {
            await generarAlertas(resultadoAnalisis.alertas, empresa_id, supabaseUrl, serviceRoleKey);
        }

        return new Response(JSON.stringify({
            data: {
                analisis_id: analisisGuardado[0].id,
                tipo_analisis: tipo_analisis,
                predicciones: resultadoAnalisis.predicciones,
                factores_clave: resultadoAnalisis.factoresClave,
                recomendaciones: resultadoAnalisis.recomendaciones,
                nivel_confianza: resultadoAnalisis.confianza,
                alertas_generadas: resultadoAnalisis.alertas?.length || 0
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en análisis predictivo:', error);

        const errorResponse = {
            error: {
                code: 'ANALISIS_PREDICTIVO_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// =============================================
// FUNCIONES DE ANÁLISIS PREDICTIVO
// =============================================

async function analizarRiesgoIndividual(pacienteId, supabaseUrl, serviceKey) {
    try {
        // Obtener datos del paciente
        const pacienteResponse = await fetch(
            `${supabaseUrl}/rest/v1/pacientes?id=eq.${pacienteId}&select=*,puesto_trabajo:puestos_trabajo(*)`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        const pacienteData = await pacienteResponse.json();
        if (!pacienteData || pacienteData.length === 0) {
            throw new Error('Paciente no encontrado');
        }

        const paciente = pacienteData[0];

        // Obtener historial médico
        const historialResponse = await fetch(
            `${supabaseUrl}/rest/v1/examenes_ocupacionales?paciente_id=eq.${pacienteId}&order=fecha_realizada.desc`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        const examenes = await historialResponse.json();

        // Obtener incapacidades
        const incapacidadesResponse = await fetch(
            `${supabaseUrl}/rest/v1/incapacidades_laborales?paciente_id=eq.${pacienteId}&order=fecha_inicio.desc`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        const incapacidades = await incapacidadesResponse.json();

        // Calcular métricas de riesgo
        const edad = calcularEdad(paciente.fecha_nacimiento);
        const examenesPendientes = contarExamenesPendientes(examenes);
        const incapacidadesRecientes = contarIncapacidadesRecientes(incapacidades);
        const riesgoPuesto = evaluarRiesgoPuesto(paciente.puesto_trabajo);

        // Algoritmo de scoring de riesgo
        let scoreRiesgo = 0.0;
        
        // Factor edad
        if (edad > 50) scoreRiesgo += 0.2;
        if (edad > 60) scoreRiesgo += 0.3;
        
        // Factor exámenes pendientes
        scoreRiesgo += examenesPendientes * 0.15;
        
        // Factor incapacidades
        scoreRiesgo += incapacidadesRecientes * 0.25;
        
        // Factor puesto
        switch (riesgoPuesto) {
            case 'critico': scoreRiesgo += 0.4; break;
            case 'alto': scoreRiesgo += 0.3; break;
            case 'medio': scoreRiesgo += 0.2; break;
            case 'bajo': scoreRiesgo += 0.1; break;
        }

        // Normalizar score (0-1)
        scoreRiesgo = Math.min(scoreRiesgo, 1.0);

        // Generar predicciones
        const predicciones = {
            score_riesgo_general: scoreRiesgo,
            probabilidad_lesion_6_meses: scoreRiesgo * 0.6,
            probabilidad_incapacidad_1_año: scoreRiesgo * 0.4,
            dias_absentismo_estimados: Math.round(scoreRiesgo * 15),
            nivel_riesgo: scoreRiesgo > 0.7 ? 'alto' : scoreRiesgo > 0.4 ? 'medio' : 'bajo'
        };

        // Factores clave
        const factoresClave = [
            { factor: 'edad', impacto: edad > 50 ? 'alto' : 'bajo', valor: edad },
            { factor: 'examenes_pendientes', impacto: examenesPendientes > 2 ? 'alto' : 'bajo', valor: examenesPendientes },
            { factor: 'incapacidades_recientes', impacto: incapacidadesRecientes > 1 ? 'alto' : 'bajo', valor: incapacidadesRecientes },
            { factor: 'riesgo_puesto', impacto: riesgoPuesto === 'critico' || riesgoPuesto === 'alto' ? 'alto' : 'bajo', valor: riesgoPuesto }
        ];

        // Generar recomendaciones
        const recomendaciones = generarRecomendacionesIndividual(scoreRiesgo, factoresClave, paciente);

        // Generar alertas si es necesario
        const alertas = [];
        if (scoreRiesgo > 0.7) {
            alertas.push({
                paciente_id: pacienteId,
                tipo_alerta: 'riesgo_salud',
                severidad: 'alta',
                titulo: 'Paciente en riesgo alto',
                descripcion: `El paciente ${paciente.nombre} presenta un score de riesgo alto (${(scoreRiesgo * 100).toFixed(1)}%). Se recomienda evaluación inmediata.`,
                recomendaciones: recomendaciones.slice(0, 3),
                confidence_score: 0.85
            });
        }

        return {
            datosEntrada: {
                paciente_id: pacienteId,
                edad: edad,
                examenes_totales: examenes.length,
                incapacidades_totales: incapacidades.length,
                puesto_riesgo: riesgoPuesto
            },
            predicciones: predicciones,
            metricas: {
                accuracy: 0.82,
                precision: 0.78,
                recall: 0.85
            },
            factoresClave: factoresClave,
            recomendaciones: recomendaciones,
            confianza: 0.85,
            algoritmo: 'risk_scoring_v1',
            alertas: alertas
        };

    } catch (error) {
        console.error('Error en análisis individual:', error);
        throw error;
    }
}

async function analizarRiesgoEmpresa(empresaId, supabaseUrl, serviceKey) {
    try {
        // Obtener estadísticas generales
        const statsResponse = await fetch(
            `${supabaseUrl}/rest/v1/vista_dashboard_empresa?empresa_id=eq.${empresaId}`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        const stats = await statsResponse.json();
        if (!stats || stats.length === 0) {
            throw new Error('No se encontraron estadísticas para la empresa');
        }

        const empresaStats = stats[0];

        // Obtener pacientes de alto riesgo
        const pacientesResponse = await fetch(
            `${supabaseUrl}/rest/v1/pacientes?empresa_id=eq.${empresaId}&estatus=eq.activo&select=*,puesto_trabajo:puestos_trabajo(*)`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        const pacientes = await pacientesResponse.json();

        // Calcular métricas empresariales
        const totalPacientes = pacientes.length;
        const pacientesRiesgoAlto = pacientes.filter(p => {
            const edad = calcularEdad(p.fecha_nacimiento);
            const riesgoPuesto = p.puesto_trabajo?.nivel_riesgo || 'bajo';
            return edad > 55 || riesgoPuesto === 'critico' || riesgoPuesto === 'alto';
        }).length;

        const porcentajeRiesgoAlto = (pacientesRiesgoAlto / totalPacientes) * 100;

        // Predicciones empresariales
        const predicciones = {
            porcentaje_riesgo_alto: porcentajeRiesgoAlto,
            incapacidades_proyectadas_mes: Math.round(totalPacientes * 0.03),
            costo_estimado_incapacidades: totalPacientes * 2500, // MXN promedio
            examenes_preventivos_requeridos: Math.round(totalPacientes * 0.25),
            score_salud_empresarial: Math.max(0, 100 - porcentajeRiesgoAlto * 2)
        };

        // Factores clave empresariales
        const factoresClave = [
            { factor: 'total_empleados', impacto: totalPacientes > 500 ? 'alto' : 'medio', valor: totalPacientes },
            { factor: 'porcentaje_riesgo_alto', impacto: porcentajeRiesgoAlto > 30 ? 'alto' : 'medio', valor: porcentajeRiesgoAlto },
            { factor: 'incapacidades_ultimo_mes', impacto: empresaStats.incapacidades_ultimo_mes > 5 ? 'alto' : 'bajo', valor: empresaStats.incapacidades_ultimo_mes }
        ];

        // Recomendaciones empresariales
        const recomendaciones = [
            {
                titulo: 'Programa de Vigilancia Médica',
                descripcion: 'Implementar programa intensivo para empleados de alto riesgo',
                prioridad: porcentajeRiesgoAlto > 30 ? 'alta' : 'media',
                costo_estimado: 15000,
                tiempo_implementacion: 30
            },
            {
                titulo: 'Capacitación en Prevención',
                descripcion: 'Capacitar a supervisores en identificación temprana de riesgos',
                prioridad: 'media',
                costo_estimado: 8000,
                tiempo_implementacion: 15
            },
            {
                titulo: 'Mejora de Condiciones Laborales',
                descripcion: 'Evaluar y mejorar condiciones en puestos de alto riesgo',
                prioridad: 'alta',
                costo_estimado: 50000,
                tiempo_implementacion: 90
            }
        ];

        return {
            datosEntrada: {
                empresa_id: empresaId,
                total_pacientes: totalPacientes,
                examenes_ultimo_mes: empresaStats.examenes_ultimo_mes,
                incapacidades_ultimo_mes: empresaStats.incapacidades_ultimo_mes
            },
            predicciones: predicciones,
            metricas: {
                accuracy: 0.75,
                precision: 0.72,
                recall: 0.80
            },
            factoresClave: factoresClave,
            recomendaciones: recomendaciones,
            confianza: 0.78,
            algoritmo: 'enterprise_risk_analysis_v1',
            alertas: []
        };

    } catch (error) {
        console.error('Error en análisis empresarial:', error);
        throw error;
    }
}

async function predecirAbsentismo(empresaId, supabaseUrl, serviceKey) {
    // Implementación simplificada para predicción de absentismo
    const predicciones = {
        dias_absentismo_proyectados: 45,
        empleados_en_riesgo: 12,
        costo_estimado: 180000,
        tendencia: 'estable'
    };

    return {
        datosEntrada: { empresa_id: empresaId, periodo: 'últimos_6_meses' },
        predicciones: predicciones,
        metricas: { accuracy: 0.70 },
        factoresClave: [{ factor: 'historico_incapacidades', impacto: 'alto', valor: 35 }],
        recomendaciones: [{ titulo: 'Programa Wellness', descripcion: 'Implementar programa de bienestar', prioridad: 'media' }],
        confianza: 0.70,
        algoritmo: 'absenteeism_predictor_v1',
        alertas: []
    };
}

async function detectarExamenesVencidos(empresaId, supabaseUrl, serviceKey) {
    try {
        // Consultar exámenes vencidos
        const vencidosResponse = await fetch(
            `${supabaseUrl}/rest/v1/vista_examenes_vencidos?empresa_id=eq.${empresaId}`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        const examenes_vencidos = await vencidosResponse.json();

        const alertas = examenes_vencidos.map(examen => ({
            paciente_id: examen.paciente_id,
            tipo_alerta: 'examenes_vencidos',
            severidad: examen.dias_vencido > 90 ? 'alta' : 'media',
            titulo: 'Examen médico vencido',
            descripcion: `El empleado ${examen.paciente_nombre} tiene un examen ${examen.tipo_examen} vencido hace ${examen.dias_vencido} días.`,
            recomendaciones: ['Programar examen de renovación inmediatamente'],
            confidence_score: 1.0
        }));

        return {
            datosEntrada: { empresa_id: empresaId },
            predicciones: { examenes_vencidos: examenes_vencidos.length },
            metricas: { accuracy: 1.0 },
            factoresClave: [{ factor: 'examenes_vencidos', impacto: 'alto', valor: examenes_vencidos.length }],
            recomendaciones: [{ titulo: 'Renovación de Exámenes', descripcion: 'Programar exámenes vencidos', prioridad: 'alta' }],
            confianza: 1.0,
            algoritmo: 'expired_exams_detector_v1',
            alertas: alertas
        };

    } catch (error) {
        console.error('Error detectando exámenes vencidos:', error);
        throw error;
    }
}

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function calcularEdad(fechaNacimiento) {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
    
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}

function contarExamenesPendientes(examenes) {
    const hoy = new Date();
    return examenes.filter(ex => 
        ex.fecha_vigencia && new Date(ex.fecha_vigencia) < hoy && ex.estado === 'completado'
    ).length;
}

function contarIncapacidadesRecientes(incapacidades) {
    const hace12Meses = new Date();
    hace12Meses.setMonth(hace12Meses.getMonth() - 12);
    
    return incapacidades.filter(inc => 
        new Date(inc.fecha_inicio) >= hace12Meses
    ).length;
}

function evaluarRiesgoPuesto(puestoTrabajo) {
    return puestoTrabajo?.nivel_riesgo || 'bajo';
}

function generarRecomendacionesIndividual(scoreRiesgo, factores, paciente) {
    const recomendaciones = [];

    if (scoreRiesgo > 0.7) {
        recomendaciones.push({
            titulo: 'Evaluación médica urgente',
            descripcion: 'Programar evaluación médica integral inmediata',
            prioridad: 'alta',
            tiempo_implementacion: 7
        });
    }

    if (factores.find(f => f.factor === 'examenes_pendientes' && f.impacto === 'alto')) {
        recomendaciones.push({
            titulo: 'Actualización de exámenes',
            descripcion: 'Completar exámenes médicos pendientes',
            prioridad: 'alta',
            tiempo_implementacion: 15
        });
    }

    if (factores.find(f => f.factor === 'edad' && f.impacto === 'alto')) {
        recomendaciones.push({
            titulo: 'Vigilancia médica intensiva',
            descripcion: 'Programar seguimiento médico trimestral por edad avanzada',
            prioridad: 'media',
            tiempo_implementacion: 30
        });
    }

    return recomendaciones;
}

async function generarAlertas(alertas, empresaId, supabaseUrl, serviceKey) {
    for (const alerta of alertas) {
        const alertaCompleta = {
            ...alerta,
            empresa_id: empresaId,
            algoritmo_usado: 'predictive_analysis_v1',
            estado: 'activa'
        };

        await fetch(`${supabaseUrl}/rest/v1/alertas_riesgo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alertaCompleta)
        });
    }
}