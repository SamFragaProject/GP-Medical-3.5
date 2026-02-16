/**
 * ExportarPDFPaciente — PDF exports inspired by the reference app (Acerlan Matrix Metals)
 * 
 * Generates:
 * 1. Certificado de Aptitud Laboral (formal certificate with logos and signatures)
 * 2. Expediente Clínico Completo (dense 2-column layout with all lab/audio/clinical data)
 * 
 * Uses window.open() + window.print() just like the reference app.
 */

import { PACIENTE_DEMO, LABORATORIO_DEMO, AUDIOMETRIA_DEMO, EXPLORACION_FISICA_DEMO, NOTAS_MEDICAS_DEMO } from '@/data/demoPacienteCompleto'

const LOGO_GP = 'https://i.postimg.cc/TwwCKGYR/gp-medical.png'

function calcEdad(fechaNac: string): number {
    const b = new Date(fechaNac)
    const t = new Date()
    let a = t.getFullYear() - b.getFullYear()
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
    return a
}

function openPrintWindow(title: string, html: string) {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; color: #1e293b; background: white; }
@media print {
    @page { margin: 8mm; size: A4; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
}
.dense-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.dense-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 8px; border-bottom: 1px dotted #cbd5e1; font-size: 10px; }
.dense-row:nth-child(even) { background: #f8fafc; }
.dense-label { color: #64748b; font-weight: 600; }
.dense-value { font-weight: 700; color: #1e293b; text-align: right; }
.dense-value.alto { color: #d97706; font-weight: 800; }
.dense-value.bajo { color: #3b82f6; font-weight: 800; }
.dense-value.critico { color: #dc2626; font-weight: 800; }
.section-title { font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 8px; background: #f1f5f9; border-left: 3px solid #10b981; margin-top: 8px; }
.header-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 3px solid #10b981; }
.patient-bar { display: flex; border: 1px solid #cbd5e1; background: #f8fafc; margin: 12px 0; font-size: 10px; }
.patient-cell { flex: 1; padding: 6px 10px; border-right: 1px solid #e2e8f0; }
.patient-cell:last-child { border-right: none; }
.patient-cell-label { font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
.patient-cell-value { font-weight: 700; color: #1e293b; margin-top: 2px; }
.footer-bar { border-top: 2px solid #e2e8f0; padding: 10px 24px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; margin-top: 16px; }
.cert-border { border: 4px double #e2e8f0; padding: 32px; min-height: 90vh; display: flex; flex-direction: column; justify-content: space-between; }
.cert-title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #0f172a; text-align: center; margin: 20px 0 6px; }
.cert-subtitle { font-size: 12px; color: #64748b; font-weight: 600; text-align: center; margin-bottom: 20px; }
.cert-data-row { display: flex; gap: 4px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
.cert-data-label { width: 180px; font-weight: 700; color: #64748b; flex-shrink: 0; }
.cert-data-value { font-weight: 600; color: #1e293b; }
.aptitude-box { text-align: center; padding: 20px; margin: 24px 0; border-radius: 12px; }
.aptitude-apto { background: #ecfdf5; border: 2px solid #10b981; }
.aptitude-reservas { background: #fffbeb; border: 2px solid #f59e0b; }
.aptitude-no-apto { background: #fef2f2; border: 2px solid #ef4444; }
.signature-area { display: flex; justify-content: space-around; margin-top: 40px; padding-top: 20px; }
.signature-box { text-align: center; width: 200px; }
.signature-line { border-top: 1px solid #1e293b; margin-top: 40px; padding-top: 6px; font-size: 10px; font-weight: 700; }
.print-btn { position: fixed; top: 20px; right: 20px; background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; z-index: 1000; box-shadow: 0 4px 15px rgba(16,185,129,0.4); }
.print-btn:hover { background: #059669; }
</style>
</head>
<body>
<button onclick="window.print()" class="print-btn no-print">🖨️ Imprimir / Guardar PDF</button>
${html}
</body>
</html>`)
    w.document.close()
}

// =================================================================
// 1. CERTIFICADO DE APTITUD LABORAL
// =================================================================
export function printCertificadoAptitud(pacienteData?: any) {
    const p = pacienteData || PACIENTE_DEMO
    const edad = p.fecha_nacimiento ? calcEdad(p.fecha_nacimiento) : '—'
    const nota = NOTAS_MEDICAS_DEMO.filter(n => n.estado === 'vigente').pop()
    const ef = EXPLORACION_FISICA_DEMO[0]
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

    // Determine aptitude
    let aptString = 'APTO'
    let aptClass = 'aptitude-apto'
    let aptColor = '#10b981'
    if (nota?.diagnostico_texto?.toLowerCase().includes('restricción') || nota?.diagnostico_texto?.toLowerCase().includes('reserva')) {
        aptString = 'APTO CON RESTRICCIÓN'
        aptClass = 'aptitude-reservas'
        aptColor = '#f59e0b'
    }
    if (nota?.diagnostico_texto?.toLowerCase().includes('no apto')) {
        aptString = 'NO APTO'
        aptClass = 'aptitude-no-apto'
        aptColor = '#ef4444'
    }

    const html = `
    <div class="cert-border">
        <!-- Header with logos -->
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #10b981; padding-bottom:16px;">
                <img src="${LOGO_GP}" style="height:40px; object-fit:contain;" onerror="this.style.display='none'" />
                <div style="text-align:right;">
                    <div style="font-size:8px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.15em;">GP Medical Health Services</div>
                    <div style="font-size:8px; color:#94a3b8;">Medicina Ocupacional y Preventiva</div>
                </div>
            </div>

            <div class="cert-title">Certificado de Aptitud</div>
            <div class="cert-subtitle">Dictamen Médico-Laboral — ${p.empresa_nombre || 'Empresa'}</div>

            <!-- Patient data -->
            <div style="margin:16px 0;">
                <div class="cert-data-row"><span class="cert-data-label">Nombre Completo</span><span class="cert-data-value">${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Edad</span><span class="cert-data-value">${edad} años</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Género</span><span class="cert-data-value">${p.genero || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">CURP</span><span class="cert-data-value" style="font-family:monospace;">${p.curp || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">NSS (IMSS)</span><span class="cert-data-value" style="font-family:monospace;">${p.nss || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Empresa</span><span class="cert-data-value">${p.empresa_nombre || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Puesto de Trabajo</span><span class="cert-data-value">${p.puesto || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">No. Empleado</span><span class="cert-data-value">${p.numero_empleado || '—'}</span></div>
            </div>

            <!-- Aptitude verdict -->
            <div class="aptitude-box ${aptClass}">
                <div style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.15em; margin-bottom:8px;">Dictamen de Aptitud Laboral</div>
                <div style="font-size:28px; font-weight:900; color:${aptColor}; letter-spacing:0.05em;">${aptString}</div>
                ${nota?.diagnostico_texto ? `<div style="font-size:11px; color:#64748b; margin-top:8px; font-weight:500;">${nota.diagnostico_texto}</div>` : ''}
            </div>

            <!-- Vital signs summary -->
            <div style="margin-top:16px;">
                <div class="section-title">Signos Vitales al Momento del Examen</div>
                <div class="patient-bar" style="margin-top:0;">
                    <div class="patient-cell"><div class="patient-cell-label">TA</div><div class="patient-cell-value">${ef?.ta_sistolica || '—'}/${ef?.ta_diastolica || '—'} mmHg</div></div>
                    <div class="patient-cell"><div class="patient-cell-label">FC</div><div class="patient-cell-value">${ef?.fc || '—'} lpm</div></div>
                    <div class="patient-cell"><div class="patient-cell-label">IMC</div><div class="patient-cell-value">${ef?.imc || '—'} kg/m²</div></div>
                    <div class="patient-cell"><div class="patient-cell-label">SpO2</div><div class="patient-cell-value">${ef?.spo2 || '—'}%</div></div>
                    <div class="patient-cell"><div class="patient-cell-label">Glucosa</div><div class="patient-cell-value">${ef?.glucosa || '—'} mg/dL</div></div>
                </div>
            </div>

            ${nota?.plan_tratamiento ? `
            <div style="margin-top:16px;">
                <div class="section-title">Plan y Recomendaciones</div>
                <div style="padding:10px 8px; font-size:11px; color:#334155; line-height:1.6;">${nota.plan_tratamiento}</div>
            </div>` : ''}
        </div>

        <!-- Signature area -->
        <div>
            <div class="signature-area">
                <div class="signature-box">
                    <div class="signature-line">Médico Examinador</div>
                    <div style="font-size:9px; color:#64748b; margin-top:4px;">${nota?.medico || 'Médico Responsable'}</div>
                    <div style="font-size:8px; color:#94a3b8;">${nota?.cedula || 'Cédula Profesional'}</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line">Trabajador</div>
                    <div style="font-size:9px; color:#64748b; margin-top:4px;">${p.nombre} ${p.apellido_paterno}</div>
                </div>
            </div>

            <div class="footer-bar">
                <div><span style="color:#10b981;">Confidencial</span> — Uso Médico ${p.empresa_nombre || ''}</div>
                <div>GPMedical ERP • ${fechaHoy}</div>
            </div>
        </div>
    </div>`

    openPrintWindow(`Certificado - ${p.nombre} ${p.apellido_paterno}`, html)
}

// =================================================================
// 2. EXPEDIENTE CLÍNICO COMPLETO (dense 2-column layout)
// =================================================================
export function printExpedienteCompleto(pacienteData?: any) {
    const p = pacienteData || PACIENTE_DEMO
    const edad = p.fecha_nacimiento ? calcEdad(p.fecha_nacimiento) : '—'
    const lab = LABORATORIO_DEMO
    const audio = AUDIOMETRIA_DEMO
    const ef = EXPLORACION_FISICA_DEMO[0]
    const notas = NOTAS_MEDICAS_DEMO.filter(n => n.estado === 'vigente')
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

    // Build lab sections
    function buildLabSection(grupo: typeof lab.grupos[0]) {
        return `
        <div>
            <div class="section-title">${grupo.grupo}</div>
            ${grupo.resultados.map(r => `
                <div class="dense-row">
                    <span class="dense-label">${r.parametro}</span>
                    <span class="dense-value ${r.bandera}">${r.resultado} ${r.unidad}${r.bandera !== 'normal' ? ` ⚠` : ''}</span>
                </div>
            `).join('')}
        </div>`
    }

    // Build exploration section
    const efFields = [
        { l: 'Estado General', v: ef?.estado_general },
        { l: 'FC', v: ef?.fc ? `${ef.fc} lpm` : null },
        { l: 'FR', v: ef?.fr ? `${ef.fr} rpm` : null },
        { l: 'TA', v: ef?.ta_sistolica ? `${ef.ta_sistolica}/${ef.ta_diastolica} mmHg` : null },
        { l: 'Temperatura', v: ef?.temperatura ? `${ef.temperatura}°C` : null },
        { l: 'SpO2', v: ef?.spo2 ? `${ef.spo2}%` : null },
        { l: 'Peso', v: ef?.peso_kg ? `${ef.peso_kg} kg` : null },
        { l: 'Talla', v: ef?.talla_cm ? `${ef.talla_cm} cm` : null },
        { l: 'IMC', v: ef?.imc ? `${ef.imc} kg/m²` : null },
        { l: 'Cintura', v: ef?.cintura_cm ? `${ef.cintura_cm} cm` : null },
        { l: 'Glucosa Capilar', v: ef?.glucosa ? `${ef.glucosa} mg/dL` : null },
    ].filter(f => f.v)

    const efSystems = [
        { l: 'Cabeza', v: ef?.cabeza },
        { l: 'Ojos', v: ef?.ojos },
        { l: 'Oídos', v: ef?.oidos },
        { l: 'Cuello', v: ef?.cuello },
        { l: 'Tórax', v: ef?.torax },
        { l: 'Abdomen', v: ef?.abdomen },
        { l: 'Columna', v: ef?.columna },
        { l: 'Ext. Superiores', v: ef?.extremidades_superiores },
        { l: 'Ext. Inferiores', v: ef?.extremidades_inferiores },
        { l: 'Neurológico', v: ef?.neurologico },
    ].filter(f => f.v)

    const html = `
    <div style="max-width:900px; margin:0 auto; padding:16px;">
        <!-- Top header -->
        <div class="header-bar">
            <div>
                <img src="${LOGO_GP}" style="height:32px; object-fit:contain;" onerror="this.style.display='none'" />
            </div>
            <div style="text-align:right;">
                <div style="font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#0f172a;">Expediente Clínico</div>
                <div style="font-size:9px; color:#94a3b8; font-weight:600;">GP Medical Health Services — ${fechaHoy}</div>
            </div>
        </div>

        <!-- Patient demographics bar -->
        <div class="patient-bar">
            <div class="patient-cell" style="flex:2;">
                <div class="patient-cell-label">Trabajador</div>
                <div class="patient-cell-value">${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">Edad</div>
                <div class="patient-cell-value">${edad} años</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">Género</div>
                <div class="patient-cell-value">${p.genero || '—'}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">Tipo de Sangre</div>
                <div class="patient-cell-value">${p.tipo_sangre || '—'}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">Empresa</div>
                <div class="patient-cell-value">${p.empresa_nombre || '—'}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">Puesto</div>
                <div class="patient-cell-value">${p.puesto || '—'}</div>
            </div>
        </div>

        <!-- Identification bar -->
        <div class="patient-bar" style="margin-top:0;">
            <div class="patient-cell">
                <div class="patient-cell-label">CURP</div>
                <div class="patient-cell-value" style="font-family:monospace; font-size:10px;">${p.curp || '—'}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">NSS</div>
                <div class="patient-cell-value" style="font-family:monospace; font-size:10px;">${p.nss || '—'}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">No. Empleado</div>
                <div class="patient-cell-value">${p.numero_empleado || '—'}</div>
            </div>
            <div class="patient-cell">
                <div class="patient-cell-label">Alergias</div>
                <div class="patient-cell-value" style="color:#dc2626; font-size:9px;">${p.alergias || 'NKDA'}</div>
            </div>
        </div>

        <!-- 2-Column Layout for results -->
        <div class="dense-grid" style="gap:16px; margin-top:8px;">
            <!-- LEFT COLUMN: Lab Results -->
            <div>
                ${lab.grupos.map(g => buildLabSection(g)).join('')}
            </div>

            <!-- RIGHT COLUMN: Clinical + Audio -->
            <div>
                <!-- Vital Signs -->
                <div>
                    <div class="section-title">Signos Vitales y Somatometría</div>
                    ${efFields.map(f => `
                        <div class="dense-row">
                            <span class="dense-label">${f.l}</span>
                            <span class="dense-value">${f.v}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- Audiometry summary -->
                <div>
                    <div class="section-title">Audiometría</div>
                    <div class="dense-row">
                        <span class="dense-label">Diagnóstico</span>
                        <span class="dense-value">${audio.diagnostico}</span>
                    </div>
                    <div class="dense-row">
                        <span class="dense-label">PTA Oído Derecho</span>
                        <span class="dense-value ${audio.promedio_tonal_od > 25 ? 'alto' : ''}">${audio.promedio_tonal_od} dB</span>
                    </div>
                    <div class="dense-row">
                        <span class="dense-label">PTA Oído Izquierdo</span>
                        <span class="dense-value ${audio.promedio_tonal_oi > 25 ? 'alto' : ''}">${audio.promedio_tonal_oi} dB</span>
                    </div>
                    <div class="dense-row">
                        <span class="dense-label">Semáforo NOM-011</span>
                        <span class="dense-value" style="color:${(audio.semaforo_general as string) === 'verde' ? '#10b981' : (audio.semaforo_general as string) === 'amarillo' ? '#f59e0b' : '#ef4444'}">
                            ● ${audio.semaforo_general?.toUpperCase()}
                        </span>
                    </div>
                    <div class="dense-row">
                        <span class="dense-label">Reevaluación</span>
                        <span class="dense-value">${audio.requiere_reevaluacion ? `Sí — ${audio.tiempo_reevaluacion_meses} meses` : 'No requerida'}</span>
                    </div>
                </div>

                <!-- Hallazgos relevantes -->
                <div>
                    <div class="section-title">Hallazgos Relevantes</div>
                    <div style="padding:6px 8px; font-size:10px; color:#334155; line-height:1.5;">
                        ${ef?.hallazgos_relevantes || 'Sin hallazgos relevantes.'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Exploración por aparatos y sistemas (full width) -->
        <div style="margin-top:8px;">
            <div class="section-title">Exploración Física por Aparatos y Sistemas</div>
            <div class="dense-grid" style="gap:0;">
                ${efSystems.map(f => `
                    <div class="dense-row">
                        <span class="dense-label">${f.l}</span>
                        <span class="dense-value" style="text-align:left; font-weight:500; color:#475569; font-size:9px;">${f.v}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- NOM-011 Interpretation -->
        <div style="margin-top:8px;">
            <div class="section-title">Interpretación Audiológica (NOM-011-STPS)</div>
            <div style="padding:8px; font-size:10px; color:#334155; line-height:1.5; background:#f8fafc; border:1px solid #e2e8f0;">
                ${audio.interpretacion_nom011}
            </div>
        </div>

        <!-- Latest clinical note -->
        ${notas.length > 0 ? `
        <div style="margin-top:8px;">
            <div class="section-title">Última Nota Médica</div>
            <div style="padding:8px; font-size:10px;">
                <div style="margin-bottom:6px;"><strong>Fecha:</strong> ${new Date(notas[notas.length - 1].fecha).toLocaleDateString('es-MX')}</div>
                <div style="margin-bottom:6px;"><strong>Médico:</strong> ${notas[notas.length - 1].medico} (${notas[notas.length - 1].cedula})</div>
                <div style="margin-bottom:6px;"><strong>Dx CIE-10:</strong> ${notas[notas.length - 1].diagnostico_cie10}</div>
                <div style="margin-bottom:6px;"><strong>Diagnóstico:</strong> ${notas[notas.length - 1].diagnostico_texto}</div>
                <div style="margin-bottom:6px;"><strong>Plan:</strong> ${notas[notas.length - 1].plan_tratamiento}</div>
                <div><strong>Pronóstico:</strong> ${notas[notas.length - 1].pronostico}</div>
            </div>
        </div>` : ''}

        <!-- Footer -->
        <div class="footer-bar">
            <div><span style="color:#10b981;">Confidencial</span> — Uso Médico ${p.empresa_nombre || ''}</div>
            <div>GPMedical ERP v3.5 • Expediente generado el ${fechaHoy}</div>
        </div>
    </div>`

    openPrintWindow(`Expediente - ${p.nombre} ${p.apellido_paterno}`, html)
}
