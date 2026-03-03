/**
 * ExpedienteMarkdownService — Convierte datos extraídos a formato Markdown estructurado
 * 
 * Pipeline:
 *   1. Recibe DatosExtraidos (del documentExtractorService)
 *   2. Genera un Markdown legible, organizado por secciones médicas
 *   3. Incluye badges de confianza, alertas de campos faltantes
 *   4. Puede descargarse como .md o mostrarse en UI
 * 
 * Este formato sirve como "expediente portable" que puedes compartir,
 * versionar, y usar como fuente de verdad antes de persistir en DB.
 */

import type { DatosExtraidos } from '@/services/documentExtractorService'

// ============================================
// TIPOS
// ============================================

export interface MarkdownExpediente {
    markdown: string              // El .md completo
    resumen: string               // Resumen de una línea para UI
    secciones: SeccionMD[]        // Secciones individuales para renderizar
    archivosProcesados: string[]  // Archivos de origen
    fechaGeneracion: string
}

interface SeccionMD {
    titulo: string
    icono: string
    contenido: string
    camposEncontrados: number
    camposTotales: number
}

// ============================================
// GENERADOR PRINCIPAL
// ============================================

export function generarMarkdownExpediente(
    datos: DatosExtraidos,
    archivosProcesados: string[] = []
): MarkdownExpediente {
    const now = new Date()
    const fechaStr = now.toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

    const secciones: SeccionMD[] = []
    const mdParts: string[] = []

    // ═══════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════
    const nombreCompleto = [datos.nombre, datos.apellido_paterno, datos.apellido_materno]
        .filter(Boolean).join(' ') || 'Paciente Sin Nombre'

    mdParts.push(`# 📋 Expediente Médico — ${nombreCompleto}`)
    mdParts.push('')
    mdParts.push(`> **Generado automáticamente** por GPMedical IA el ${fechaStr}`)
    mdParts.push(`> Confianza de extracción: **${datos._confianza || 0}%**`)
    if (archivosProcesados.length > 0) {
        mdParts.push(`> Archivos procesados: ${archivosProcesados.join(', ')}`)
    }
    mdParts.push('')
    mdParts.push('---')
    mdParts.push('')

    // ═══════════════════════════════════════
    // 1. DATOS PERSONALES
    // ═══════════════════════════════════════
    const personales: [string, any][] = [
        ['Nombre(s)', datos.nombre],
        ['Apellido Paterno', datos.apellido_paterno],
        ['Apellido Materno', datos.apellido_materno],
        ['Fecha de Nacimiento', datos.fecha_nacimiento],
        ['Género', datos.genero],
        ['CURP', datos.curp],
        ['RFC', datos.rfc],
        ['NSS (IMSS)', datos.nss],
        ['Estado Civil', datos.estado_civil],
        ['Tipo de Sangre', datos.tipo_sangre],
        ['Email', datos.email],
        ['Teléfono', datos.telefono],
    ]
    const secPersonales = generarSeccionTabla('Datos Personales', '👤', personales)
    secciones.push(secPersonales)
    mdParts.push(secPersonales.contenido)

    // ═══════════════════════════════════════
    // 2. DATOS LABORALES
    // ═══════════════════════════════════════
    const laborales: [string, any][] = [
        ['No. Empleado', datos.numero_empleado],
        ['Empresa', datos.empresa_nombre],
        ['Puesto', datos.puesto],
        ['Área', datos.area],
        ['Departamento', datos.departamento],
        ['Turno', datos.turno],
        ['Fecha de Ingreso', datos.fecha_ingreso],
    ]
    const secLaborales = generarSeccionTabla('Datos Laborales', '🏢', laborales)
    secciones.push(secLaborales)
    mdParts.push(secLaborales.contenido)

    // ═══════════════════════════════════════
    // 3. CONTACTO DE EMERGENCIA
    // ═══════════════════════════════════════
    const contacto: [string, any][] = [
        ['Nombre', datos.contacto_emergencia_nombre],
        ['Parentesco', datos.contacto_emergencia_parentesco],
        ['Teléfono', datos.contacto_emergencia_telefono],
    ]
    const secContacto = generarSeccionTabla('Contacto de Emergencia', '🆘', contacto)
    secciones.push(secContacto)
    mdParts.push(secContacto.contenido)

    // ═══════════════════════════════════════
    // 4. ANTECEDENTES MÉDICOS
    // ═══════════════════════════════════════
    const antecedentes: string[] = []
    antecedentes.push('## 🏥 Antecedentes Médicos\n')
    let antCampos = 0
    const antTotal = 4

    if (datos.alergias) { antecedentes.push(`### Alergias\n${datos.alergias}\n`); antCampos++ }
    if (datos.antecedentes_personales) { antecedentes.push(`### Antecedentes Personales\n${datos.antecedentes_personales}\n`); antCampos++ }
    if (datos.antecedentes_familiares) { antecedentes.push(`### Antecedentes Familiares\n${datos.antecedentes_familiares}\n`); antCampos++ }
    if (datos.padecimiento_actual) { antecedentes.push(`### Padecimiento Actual\n${datos.padecimiento_actual}\n`); antCampos++ }

    if (antCampos === 0) {
        antecedentes.push('_No se encontraron datos de antecedentes en los archivos._\n')
    }

    const antContenido = antecedentes.join('\n')
    secciones.push({ titulo: 'Antecedentes Médicos', icono: '🏥', contenido: antContenido, camposEncontrados: antCampos, camposTotales: antTotal })
    mdParts.push(antContenido)

    // ═══════════════════════════════════════
    // 5. SIGNOS VITALES
    // ═══════════════════════════════════════
    if (datos.signos_vitales) {
        const sv = datos.signos_vitales
        const vitales: [string, any][] = [
            ['Peso', sv.peso_kg ? `${sv.peso_kg} kg` : undefined],
            ['Talla', sv.talla_cm ? `${sv.talla_cm} cm` : undefined],
            ['IMC', sv.imc],
            ['Presión Arterial', sv.presion_sistolica ? `${sv.presion_sistolica}/${sv.presion_diastolica} mmHg` : undefined],
            ['Frecuencia Cardíaca', sv.frecuencia_cardiaca ? `${sv.frecuencia_cardiaca} lpm` : undefined],
            ['Frecuencia Respiratoria', sv.frecuencia_respiratoria ? `${sv.frecuencia_respiratoria} rpm` : undefined],
            ['Temperatura', sv.temperatura ? `${sv.temperatura} °C` : undefined],
            ['Saturación O₂', sv.saturacion_o2 ? `${sv.saturacion_o2}%` : undefined],
        ]
        const secVitales = generarSeccionTabla('Signos Vitales', '❤️', vitales)
        secciones.push(secVitales)
        mdParts.push(secVitales.contenido)
    }

    // ═══════════════════════════════════════
    // 6. EXPLORACIÓN FÍSICA
    // ═══════════════════════════════════════
    if (datos.exploracion_fisica) {
        const ef = datos.exploracion_fisica
        const exploracion: [string, any][] = [
            ['Cabeza', ef.cabeza], ['Ojos', ef.ojos], ['Oídos', ef.oidos],
            ['Nariz', ef.nariz], ['Boca', ef.boca], ['Cuello', ef.cuello],
            ['Tórax', ef.torax], ['Abdomen', ef.abdomen],
            ['Extremidades', ef.extremidades], ['Piel', ef.piel],
            ['Neurológico', ef.neurologico], ['Columna', ef.columna],
        ]
        const secExploracion = generarSeccionTabla('Exploración Física', '🩺', exploracion)
        secciones.push(secExploracion)
        mdParts.push(secExploracion.contenido)
    }

    // ═══════════════════════════════════════
    // 7. AUDIOMETRÍA
    // ═══════════════════════════════════════
    if (datos.audiometria) {
        const aud = datos.audiometria
        const audParts: string[] = ['## 👂 Audiometría\n']

        if (aud.oido_derecho) {
            audParts.push('### Oído Derecho')
            audParts.push('| Frecuencia (Hz) | Umbral (dB) |')
            audParts.push('|:---:|:---:|')
            for (const [freq, db] of Object.entries(aud.oido_derecho)) {
                audParts.push(`| ${freq} | ${db} |`)
            }
            if (aud.pta_derecho) audParts.push(`\n**PTA Derecho:** ${aud.pta_derecho} dB`)
            audParts.push('')
        }

        if (aud.oido_izquierdo) {
            audParts.push('### Oído Izquierdo')
            audParts.push('| Frecuencia (Hz) | Umbral (dB) |')
            audParts.push('|:---:|:---:|')
            for (const [freq, db] of Object.entries(aud.oido_izquierdo)) {
                audParts.push(`| ${freq} | ${db} |`)
            }
            if (aud.pta_izquierdo) audParts.push(`\n**PTA Izquierdo:** ${aud.pta_izquierdo} dB`)
            audParts.push('')
        }

        if (aud.diagnostico) audParts.push(`### Diagnóstico Audiológico\n${aud.diagnostico}\n`)

        const audContenido = audParts.join('\n')
        secciones.push({ titulo: 'Audiometría', icono: '👂', contenido: audContenido, camposEncontrados: Object.values(aud).filter(Boolean).length, camposTotales: 5 })
        mdParts.push(audContenido)
    }

    // ═══════════════════════════════════════
    // 8. ESPIROMETRÍA
    // ═══════════════════════════════════════
    if (datos.espirometria) {
        const esp = datos.espirometria
        const espiro: [string, any][] = [
            ['FVC', esp.fvc ? `${esp.fvc} L` : undefined],
            ['FEV1', esp.fev1 ? `${esp.fev1} L` : undefined],
            ['FEV1/FVC', esp.fev1_fvc ? `${esp.fev1_fvc}%` : undefined],
            ['Patrón', esp.patron],
            ['Diagnóstico', esp.diagnostico],
        ]
        const secEspiro = generarSeccionTabla('Espirometría', '🫁', espiro)
        secciones.push(secEspiro)
        mdParts.push(secEspiro.contenido)
    }

    // ═══════════════════════════════════════
    // 9. LABORATORIOS
    // ═══════════════════════════════════════
    if (datos.laboratorio) {
        const lab = datos.laboratorio
        const laboratorio: [string, any][] = [
            ['Hemoglobina', lab.hemoglobina ? `${lab.hemoglobina} g/dL` : undefined],
            ['Hematocrito', lab.hematocrito ? `${lab.hematocrito}%` : undefined],
            ['Leucocitos', lab.leucocitos ? `${lab.leucocitos} /µL` : undefined],
            ['Plaquetas', lab.plaquetas ? `${lab.plaquetas} /µL` : undefined],
            ['Glucosa', lab.glucosa ? `${lab.glucosa} mg/dL` : undefined],
            ['Colesterol Total', lab.colesterol_total ? `${lab.colesterol_total} mg/dL` : undefined],
            ['Triglicéridos', lab.trigliceridos ? `${lab.trigliceridos} mg/dL` : undefined],
            ['Creatinina', lab.creatinina ? `${lab.creatinina} mg/dL` : undefined],
            ['Ácido Úrico', lab.acido_urico ? `${lab.acido_urico} mg/dL` : undefined],
            ['Examen de Orina', lab.examen_orina],
        ]

        // Agregar "otros" si existen
        if (lab.otros) {
            for (const [nombre, valor] of Object.entries(lab.otros)) {
                laboratorio.push([nombre, valor])
            }
        }

        const secLab = generarSeccionTabla('Laboratorios', '🧪', laboratorio)
        secciones.push(secLab)
        mdParts.push(secLab.contenido)
    }

    // ═══════════════════════════════════════
    // 10. RADIOGRAFÍA
    // ═══════════════════════════════════════
    if (datos.radiografia) {
        const rx = datos.radiografia
        const radiografia: [string, any][] = [
            ['Tipo', rx.tipo],
            ['Hallazgos', rx.hallazgos],
            ['Impresión Diagnóstica', rx.impresion_diagnostica],
            ['Clasificación OIT', rx.clasificacion_oit],
        ]
        const secRx = generarSeccionTabla('Radiografías', '☢️', radiografia)
        secciones.push(secRx)
        mdParts.push(secRx.contenido)
    }

    // ═══════════════════════════════════════
    // 11. DICTAMEN
    // ═══════════════════════════════════════
    if (datos.dictamen_aptitud || datos.restricciones?.length || datos.recomendaciones?.length) {
        const dictParts: string[] = ['## 🛡️ Dictamen de Aptitud\n']

        if (datos.dictamen_aptitud) {
            const emoji = datos.dictamen_aptitud === 'apto' ? '🟢' :
                datos.dictamen_aptitud === 'apto_con_restricciones' ? '🟡' : '🔴'
            dictParts.push(`**Resultado:** ${emoji} **${datos.dictamen_aptitud.replace(/_/g, ' ').toUpperCase()}**\n`)
        }

        if (datos.restricciones?.length) {
            dictParts.push('### Restricciones')
            datos.restricciones.forEach((r: string) => dictParts.push(`- ⚠️ ${r}`))
            dictParts.push('')
        }

        if (datos.recomendaciones?.length) {
            dictParts.push('### Recomendaciones')
            datos.recomendaciones.forEach((r: string) => dictParts.push(`- 💡 ${r}`))
            dictParts.push('')
        }

        const dictContenido = dictParts.join('\n')
        secciones.push({ titulo: 'Dictamen', icono: '🛡️', contenido: dictContenido, camposEncontrados: 1, camposTotales: 1 })
        mdParts.push(dictContenido)
    }

    // ═══════════════════════════════════════
    // 12. RESULTADOS DETALLADOS (RAW IA)
    // ═══════════════════════════════════════
    if (datos.results && Array.isArray(datos.results) && datos.results.length > 0) {
        // Group by category
        const groups: Record<string, any[]> = {}
        datos.results.forEach((r: any) => {
            const cat = r.category || 'General'
            if (!groups[cat]) groups[cat] = []
            groups[cat].push(r)
        })

        const rawParts: string[] = ['## 🧠 Resultados Detallados Extraídos por IA\n']

        for (const [cat, items] of Object.entries(groups)) {
            rawParts.push(`### ${cat}`)
            rawParts.push('| Variable | Valor | Unidad | Notas |')
            rawParts.push('|:---|:---|:---|:---|')
            items.forEach((item: any) => {
                const val = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value ?? '')
                rawParts.push(`| ${item.name} | ${val} | ${item.unit || '-'} | ${item.description || '-'} |`)
            })
            rawParts.push('')
        }

        const rawContenido = rawParts.join('\n')
        secciones.push({ titulo: 'Resultados Detallados', icono: '🧠', contenido: rawContenido, camposEncontrados: datos.results.length, camposTotales: datos.results.length })
        mdParts.push(rawContenido)
    }

    // ═══════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════
    mdParts.push('---')
    mdParts.push('')
    mdParts.push(`_Expediente generado por **GPMedical v3.5** — Motor de Extracción Inteligente (GPT-4o)_`)
    mdParts.push(`_Campos detectados: ${datos._campos_encontrados?.length || 0} | Campos faltantes: ${datos._campos_faltantes?.length || 0}_`)
    mdParts.push(`_Fecha: ${fechaStr}_`)

    const markdown = mdParts.join('\n')

    return {
        markdown,
        resumen: `${nombreCompleto} — ${datos.puesto || 'Sin puesto'} — Confianza: ${datos._confianza || 0}%`,
        secciones,
        archivosProcesados,
        fechaGeneracion: now.toISOString()
    }
}

// ============================================
// HELPERS
// ============================================

function generarSeccionTabla(
    titulo: string,
    icono: string,
    campos: [string, any][]
): SeccionMD {
    const lines: string[] = []
    lines.push(`## ${icono} ${titulo}\n`)
    lines.push('| Campo | Valor |')
    lines.push('|:---|:---|')

    let encontrados = 0
    for (const [label, value] of campos) {
        if (value !== undefined && value !== null && value !== '') {
            lines.push(`| **${label}** | ${value} |`)
            encontrados++
        } else {
            lines.push(`| ${label} | _— sin datos —_ |`)
        }
    }

    lines.push('')

    return {
        titulo,
        icono,
        contenido: lines.join('\n'),
        camposEncontrados: encontrados,
        camposTotales: campos.length
    }
}

/**
 * Genera un archivo .md descargable desde el navegador
 */
export function descargarMarkdown(md: MarkdownExpediente): void {
    const blob = new Blob([md.markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expediente_${md.fechaGeneracion.split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
