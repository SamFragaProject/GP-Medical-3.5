/**
 * ExportarPDFPaciente — PDF exports for GPMedical ERP
 * 
 * Generates:
 * 1. Certificado de Aptitud Laboral (interactive preview, editable verdict)
 * 2. Expediente Clínico Completo (dense layout with all data including ECG)
 * 3. Sección Individual (any study with letterhead + signature/seal)
 * 
 * Uses window.open() + window.print() for PDF generation.
 */

const LOGO_GP = 'https://i.postimg.cc/TwwCKGYR/gp-medical.png'

function calcEdad(fechaNac: string): number {
    if (!fechaNac) return 0
    const b = new Date(fechaNac)
    const t = new Date()
    let a = t.getFullYear() - b.getFullYear()
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
    return a
}

// ─── Shared PDF styles ───
const SHARED_STYLES = `
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
.header-bar { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 24px; border-bottom: 3px solid #10b981; }
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
.aptitude-pendiente { background: #f8fafc; border: 2px solid #94a3b8; }
.signature-area { display: flex; justify-content: space-around; margin-top: 40px; padding-top: 20px; }
.signature-box { text-align: center; width: 200px; }
.signature-line { border-top: 1px solid #1e293b; margin-top: 40px; padding-top: 6px; font-size: 10px; font-weight: 700; }
.print-btn { position: fixed; top: 20px; right: 20px; background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; z-index: 1000; box-shadow: 0 4px 15px rgba(16,185,129,0.4); }
.print-btn:hover { background: #059669; }
.seal { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border: 2px solid #10b981; border-radius: 6px; font-size: 8px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 0.15em; transform: rotate(-3deg); margin-top: 8px; }
.seal::before { content: '✦'; font-size: 10px; }
`

// ─── Shared letterhead HTML ───
function letterheadHTML() {
    return `<div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #10b981; padding-bottom:16px;">
        <img src="${LOGO_GP}" style="height:60px; object-fit:contain;" onerror="this.style.display='none'" />
        <div style="text-align:right;">
            <div style="font-size:12px; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.1em;">GP Medical Health Services S.A. de C.V.</div>
            <div style="font-size:9px; color:#64748b; margin-top:4px;">Boulevard Universitario 120, Col. Centro, Querétaro, Qro. 76000</div>
            <div style="font-size:9px; color:#64748b;">RFC: GPM201015XYZ • Tel: (442) 123 4567 • www.gpmedical.mx</div>
            <div style="font-size:9px; font-weight:800; color:#10b981; margin-top:4px;">Salud Ocupacional y Preventiva</div>
        </div>
    </div>`
}

function signatureHTML(medico: string, cedula: string, pacienteNombre: string) {
    return `<div class="signature-area">
        <div class="signature-box">
            <div class="signature-line">Médico Examinador</div>
            <div style="font-size:9px; color:#64748b; margin-top:4px;">${medico || 'Médico Responsable'}</div>
            <div style="font-size:8px; color:#94a3b8;">${cedula || 'Cédula Profesional'}</div>
            <div class="seal">Documento Firmado</div>
        </div>
        <div class="signature-box">
            <div class="signature-line">Trabajador</div>
            <div style="font-size:9px; color:#64748b; margin-top:4px;">${pacienteNombre}</div>
        </div>
    </div>`
}

function footerHTML(empresa: string) {
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    return `<div class="footer-bar">
        <div><span style="color:#10b981;">Confidencial</span> — Uso Médico ${empresa || ''}</div>
        <div>GPMedical ERP v3.5 • ${fechaHoy}</div>
    </div>`
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
${SHARED_STYLES}
/* Interactive cert controls */
.cert-controls { position: fixed; top: 20px; left: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); max-width: 320px; z-index: 1001; font-size: 12px; }
.cert-controls h4 { font-weight: 900; margin-bottom: 8px; font-size: 13px; color: #0f172a; }
.cert-controls label { display: block; font-weight: 600; color: #64748b; margin-top: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
.cert-controls select, .cert-controls textarea { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 11px; margin-top: 4px; }
.cert-controls textarea { resize: vertical; min-height: 60px; }
.cert-controls button { width: 100%; background: #10b981; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 12px; font-size: 12px; }
.cert-controls button:hover { background: #059669; }
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
// 1. CERTIFICADO DE APTITUD LABORAL (Interactive Preview)
// =================================================================
export function printCertificadoAptitud(paciente: any, notaVigente?: any, exploracionFisica?: any) {
    if (!paciente) return
    const edad = paciente.fecha_nacimiento ? calcEdad(paciente.fecha_nacimiento) : '—'
    const nota = notaVigente || {}
    const ef = exploracionFisica || {}
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

    // Determine aptitude
    let aptString = 'POR DICTAMINAR'
    let aptClass = 'aptitude-pendiente'
    let aptColor = '#64748b'
    const conclusion = (nota.diagnostico_texto || '').toLowerCase()

    if (conclusion) {
        if (conclusion.includes('no apto')) { aptString = 'NO APTO'; aptClass = 'aptitude-no-apto'; aptColor = '#ef4444' }
        else if (conclusion.includes('restricción') || conclusion.includes('reserva')) { aptString = 'APTO CON RESTRICCIÓN'; aptClass = 'aptitude-reservas'; aptColor = '#f59e0b' }
        else if (conclusion.includes('apto')) { aptString = 'APTO'; aptClass = 'aptitude-apto'; aptColor = '#10b981' }
    }

    const alertText = ef.hallazgos_relevantes || nota.plan_tratamiento
        ? `<strong>Atención Médica:</strong><br/>${ef.hallazgos_relevantes ? `- ${ef.hallazgos_relevantes}<br/>` : ''}${nota.plan_tratamiento ? `- ${nota.plan_tratamiento}` : ''}`
        : 'Sin restricciones médicas detectadas. El paciente puede desempeñar sus funciones regulares sin condicionantes específicas.'

    const html = `
    <!-- Interactive medical panel for editing verdict before printing -->
    <div class="cert-controls no-print">
        <h4>⚕️ Panel Médico</h4>
        <p style="font-size:10px; color:#94a3b8; margin-bottom:8px;">Revise y modifique el dictamen antes de imprimir.</p>
        <label>Dictamen de Aptitud</label>
        <select id="apt-select" onchange="updateVerdict()">
            <option value="APTO" ${aptString === 'APTO' ? 'selected' : ''}>✅ APTO</option>
            <option value="APTO CON RESTRICCIÓN" ${aptString === 'APTO CON RESTRICCIÓN' ? 'selected' : ''}>⚠️ APTO CON RESTRICCIÓN</option>
            <option value="NO APTO" ${aptString === 'NO APTO' ? 'selected' : ''}>❌ NO APTO</option>
            <option value="POR DICTAMINAR" ${aptString === 'POR DICTAMINAR' ? 'selected' : ''}>⏳ POR DICTAMINAR</option>
        </select>
        <label>Argumentación / Observaciones</label>
        <textarea id="apt-text" placeholder="Ingrese las observaciones médicas...">${nota.diagnostico_texto || ''}</textarea>
        <label>Restricciones Laborales</label>
        <textarea id="apt-alerts" placeholder="Restricciones o alertas...">${ef.hallazgos_relevantes || nota.plan_tratamiento || ''}</textarea>
        <button onclick="applyChanges()">✓ Aplicar y Revisar</button>
        <button onclick="window.print()" style="background:#1e293b; margin-top:6px;">🖨️ Exportar Certificado</button>
    </div>

    <script>
        function updateVerdict() {}
        function applyChanges() {
            var sel = document.getElementById('apt-select').value;
            var obs = document.getElementById('apt-text').value;
            var alerts = document.getElementById('apt-alerts').value;
            var colorMap = { 'APTO': '#10b981', 'APTO CON RESTRICCIÓN': '#f59e0b', 'NO APTO': '#ef4444', 'POR DICTAMINAR': '#64748b' };
            var classMap = { 'APTO': 'aptitude-apto', 'APTO CON RESTRICCIÓN': 'aptitude-reservas', 'NO APTO': 'aptitude-no-apto', 'POR DICTAMINAR': 'aptitude-pendiente' };
            var verdictEl = document.getElementById('verdict-text');
            var verdictBox = document.getElementById('verdict-box');
            var obsEl = document.getElementById('verdict-obs');
            var alertEl = document.getElementById('alert-content');
            if (verdictEl) { verdictEl.textContent = sel; verdictEl.style.color = colorMap[sel]; }
            if (verdictBox) { verdictBox.className = 'aptitude-box ' + classMap[sel]; }
            if (obsEl) { obsEl.textContent = obs || ''; obsEl.style.display = obs ? 'block' : 'none'; }
            if (alertEl) { alertEl.innerHTML = alerts ? '<strong>Atención Médica:</strong><br/>- ' + alerts.replace(/\\n/g, '<br/>- ') : 'Sin restricciones médicas detectadas.'; }
        }
    </script>

    <div class="cert-border" style="margin-left: 340px;">
        <!-- Header -->
        <div>
            ${letterheadHTML()}

            <div class="cert-title">Certificado de Aptitud</div>
            <div class="cert-subtitle">Dictamen Médico-Laboral — ${paciente.empresa_nombre || 'Empresa'}</div>

            <!-- Patient data -->
            <div style="margin:16px 0;">
                <div class="cert-data-row"><span class="cert-data-label">Nombre Completo</span><span class="cert-data-value">${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Edad</span><span class="cert-data-value">${edad} años</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Género</span><span class="cert-data-value">${paciente.genero || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Empresa</span><span class="cert-data-value">${paciente.empresa_nombre || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Puesto de Trabajo</span><span class="cert-data-value">${paciente.puesto || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">No. Empleado</span><span class="cert-data-value">${paciente.numero_empleado || '—'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Tipo Examen</span><span class="cert-data-value">${paciente.tipo_examen || 'Periódico'}</span></div>
                <div class="cert-data-row"><span class="cert-data-label">Fecha Examen</span><span class="cert-data-value">${fechaHoy}</span></div>
            </div>

            <!-- Aptitude verdict -->
            <div id="verdict-box" class="aptitude-box ${aptClass}">
                <div style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.15em; margin-bottom:8px;">Dictamen de Aptitud Laboral</div>
                <div id="verdict-text" style="font-size:28px; font-weight:900; color:${aptColor}; letter-spacing:0.05em;">${aptString}</div>
                <div id="verdict-obs" style="font-size:11px; color:#64748b; margin-top:8px; font-weight:500; ${nota.diagnostico_texto ? '' : 'display:none;'}">${nota.diagnostico_texto || ''}</div>
            </div>

            <!-- Alerts -->
            <div style="margin-top:16px;">
                <div class="section-title">Alertas de Aptitud Laboral / Restricciones</div>
                <div id="alert-content" style="padding:10px 12px; font-size:11px; color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:6px; margin-top:8px; line-height:1.6;">
                    ${alertText}
                </div>
            </div>

            ${nota.plan_tratamiento ? `
            <div style="margin-top:16px;">
                <div class="section-title">Plan y Recomendaciones</div>
                <div style="padding:10px 8px; font-size:11px; color:#334155; line-height:1.6;">${nota.plan_tratamiento}</div>
            </div>` : ''}
        </div>

        <!-- Signature + Footer -->
        <div>
            ${signatureHTML(nota.medico, nota.cedula, `${paciente.nombre} ${paciente.apellido_paterno}`)}
            ${footerHTML(paciente.empresa_nombre)}
        </div>
    </div>`

    openPrintWindow(`Certificado - ${paciente.nombre} ${paciente.apellido_paterno}`, html)
}

// =================================================================
// 2. EXPEDIENTE CLÍNICO COMPLETO (dense 2-column + ECG + systems)
// =================================================================
export function printExpedienteCompleto(paciente: any, data?: any) {
    if (!paciente) return
    const edad = paciente.fecha_nacimiento ? calcEdad(paciente.fecha_nacimiento) : '—'
    const lab = data?.laboratorio || { grupos: [] }
    const audio = data?.audiometria || { diagnostico: 'No realizado', promedio_tonal_od: 0, promedio_tonal_oi: 0, semaforo_general: '—' }
    const ef = data?.exploracionFisica || {}
    const notas = data?.notasMedicas || []
    const ecg = data?.ecg || null
    const espiro = data?.espirometria || null
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

    function buildLabSection(grupo: any) {
        return `
        <div>
            <div class="section-title">${grupo.grupo}</div>
            ${grupo.resultados ? grupo.resultados.map((r: any) => `
                <div class="dense-row">
                    <span class="dense-label">${r.parametro}</span>
                    <span class="dense-value ${r.bandera}">${r.resultado} ${r.unidad}${r.bandera && r.bandera !== 'normal' ? ` ⚠` : ''}</span>
                </div>
            `).join('') : ''}
        </div>`
    }

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
        { l: 'Cabeza', v: ef?.cabeza }, { l: 'Ojos', v: ef?.ojos },
        { l: 'Oídos', v: ef?.oidos }, { l: 'Cuello', v: ef?.cuello },
        { l: 'Tórax', v: ef?.torax }, { l: 'Abdomen', v: ef?.abdomen },
        { l: 'Ext. Superiores', v: ef?.extremidades_superiores },
        { l: 'Ext. Inferiores', v: ef?.extremidades_inferiores },
        { l: 'Neurológico', v: ef?.neurologico },
    ].filter(f => f.v)

    const ecgBlock = ecg ? `
        <div>
            <div class="section-title">Electrocardiograma (ECG)</div>
            <div class="dense-row"><span class="dense-label">Ritmo</span><span class="dense-value">${ecg.ritmo}</span></div>
            <div class="dense-row"><span class="dense-label">FC</span><span class="dense-value">${ecg.frecuencia_cardiaca} lpm</span></div>
            <div class="dense-row"><span class="dense-label">Eje QRS</span><span class="dense-value">${ecg.eje_qrs}°</span></div>
            <div class="dense-row"><span class="dense-label">Onda P</span><span class="dense-value">${ecg.onda_p || '—'}</span></div>
            <div class="dense-row"><span class="dense-label">PR</span><span class="dense-value">${ecg.intervalo_pr} ms</span></div>
            <div class="dense-row"><span class="dense-label">QRS</span><span class="dense-value">${ecg.complejo_qrs} ms</span></div>
            <div class="dense-row"><span class="dense-label">QTc</span><span class="dense-value ${ecg.intervalo_qtc > 450 ? 'alto' : ''}">${ecg.intervalo_qtc} ms</span></div>
            <div class="dense-row"><span class="dense-label">ST</span><span class="dense-value">${ecg.segmento_st || '—'}</span></div>
            <div class="dense-row"><span class="dense-label">Onda T</span><span class="dense-value">${ecg.onda_t || '—'}</span></div>
            <div class="dense-row"><span class="dense-label">Clasificación</span><span class="dense-value" style="color:${ecg.clasificacion === 'normal' ? '#10b981' : '#ef4444'}">${(ecg.clasificacion || '').replace('_', ' ').toUpperCase()}</span></div>
            ${ecg.hallazgos ? `<div style="padding:6px 8px; font-size:10px; color:#334155; line-height:1.5; background:#f8fafc; border-top:1px dotted #cbd5e1;"><strong>Hallazgos:</strong> ${ecg.hallazgos}</div>` : ''}
            ${ecg.interpretacion_medica ? `<div style="padding:6px 8px; font-size:10px; color:#334155; line-height:1.5; background:#f1f5f9;"><strong>Interpretación:</strong> ${ecg.interpretacion_medica}</div>` : ''}
        </div>` : ''

    const espiroBlock = espiro ? `
        <div>
            <div class="section-title">Espirometría</div>
            <div class="dense-row"><span class="dense-label">FVC</span><span class="dense-value">${espiro.fvc || '—'} L</span></div>
            <div class="dense-row"><span class="dense-label">FEV1</span><span class="dense-value">${espiro.fev1 || '—'} L</span></div>
            <div class="dense-row"><span class="dense-label">FEV1/FVC</span><span class="dense-value ${(espiro.fev1_fvc || 100) < 70 ? 'critico' : ''}">${espiro.fev1_fvc || '—'}%</span></div>
            <div class="dense-row"><span class="dense-label">PEF</span><span class="dense-value">${espiro.pef || '—'} L/s</span></div>
            <div class="dense-row"><span class="dense-label">Diagnóstico</span><span class="dense-value">${espiro.diagnostico || 'Normal'}</span></div>
        </div>` : ''

    const html = `
    <div style="max-width:900px; margin:0 auto; padding:16px;">
        <!-- Top header with letterhead -->
        <div class="header-bar">
            <div>
                <img src="${LOGO_GP}" style="height:40px; object-fit:contain;" onerror="this.style.display='none'" />
            </div>
            <div style="text-align:right;">
                <div style="font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#0f172a;">Expediente Clínico</div>
                <div style="font-size:9px; color:#94a3b8; font-weight:600;">GP Medical Health Services S.A. de C.V. — ${fechaHoy}</div>
                <div style="font-size:8px; color:#cbd5e1;">Blvd. Universitario 120 • Qro. 76000 • RFC: GPM201015XYZ</div>
            </div>
        </div>

        <!-- Patient demographics bar -->
        <div class="patient-bar">
            <div class="patient-cell" style="flex:2;">
                <div class="patient-cell-label">Trabajador</div>
                <div class="patient-cell-value">${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}</div>
            </div>
            <div class="patient-cell"><div class="patient-cell-label">Edad</div><div class="patient-cell-value">${edad} años</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Género</div><div class="patient-cell-value">${paciente.genero || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Tipo Sangre</div><div class="patient-cell-value">${paciente.tipo_sangre || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Empresa</div><div class="patient-cell-value">${paciente.empresa_nombre || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Puesto</div><div class="patient-cell-value">${paciente.puesto || '—'}</div></div>
        </div>

        <!-- ID bar -->
        <div class="patient-bar" style="margin-top:0;">
            <div class="patient-cell"><div class="patient-cell-label">CURP</div><div class="patient-cell-value" style="font-family:monospace; font-size:10px;">${paciente.curp || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">NSS</div><div class="patient-cell-value" style="font-family:monospace; font-size:10px;">${paciente.nss || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">No. Empleado</div><div class="patient-cell-value">${paciente.numero_empleado || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Alergias</div><div class="patient-cell-value" style="color:#dc2626; font-size:9px;">${paciente.alergias || 'NKDA'}</div></div>
        </div>

        <!-- 2-Column Layout -->
        <div class="dense-grid" style="gap:16px; margin-top:8px;">
            <!-- LEFT: Lab + ECG + Espiro -->
            <div>
                ${lab.grupos && lab.grupos.length > 0 ? lab.grupos.map((g: any) => buildLabSection(g)).join('') : '<div style="font-size:10px; color:#64748b; padding:10px;">Sin laboratorios registrados.</div>'}
                ${ecgBlock}
                ${espiroBlock}
            </div>

            <!-- RIGHT: Vital Signs + Audio + Systems -->
            <div>
                <div>
                    <div class="section-title">Signos Vitales y Somatometría</div>
                    ${efFields.length > 0 ? efFields.map(f => `
                        <div class="dense-row"><span class="dense-label">${f.l}</span><span class="dense-value">${f.v}</span></div>
                    `).join('') : '<div style="font-size:10px; color:#64748b; padding:8px;">Sin datos registrados.</div>'}
                </div>

                <!-- Exploración por Sistemas -->
                ${efSystems.length > 0 ? `
                <div>
                    <div class="section-title">Exploración por Sistemas</div>
                    ${efSystems.map(f => `
                        <div class="dense-row"><span class="dense-label">${f.l}</span><span class="dense-value" style="max-width:200px; text-align:right; font-size:9px;">${f.v}</span></div>
                    `).join('')}
                </div>` : ''}

                <!-- Audio -->
                <div>
                    <div class="section-title">Audiometría</div>
                    <div class="dense-row"><span class="dense-label">Diagnóstico</span><span class="dense-value">${audio.diagnostico}</span></div>
                    <div class="dense-row"><span class="dense-label">PTA Oído Derecho</span><span class="dense-value ${audio.promedio_tonal_od > 25 ? 'alto' : ''}">${audio.promedio_tonal_od} dB</span></div>
                    <div class="dense-row"><span class="dense-label">PTA Oído Izquierdo</span><span class="dense-value ${audio.promedio_tonal_oi > 25 ? 'alto' : ''}">${audio.promedio_tonal_oi} dB</span></div>
                    <div class="dense-row"><span class="dense-label">Semáforo NOM-011</span>
                        <span class="dense-value" style="color:${(audio.semaforo_general as string) === 'verde' ? '#10b981' : (audio.semaforo_general as string) === 'amarillo' ? '#f59e0b' : '#ef4444'}">
                            ● ${audio.semaforo_general?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div>
                    <div class="section-title">Hallazgos Relevantes</div>
                    <div style="padding:6px 8px; font-size:10px; color:#334155; line-height:1.5;">${ef?.hallazgos_relevantes || 'Sin hallazgos relevantes.'}</div>
                </div>
            </div>
        </div>

        <!-- Latest clinical note -->
        ${notas.length > 0 ? `
        <div style="margin-top:8px;">
            <div class="section-title">Última Nota Médica</div>
            <div style="padding:8px; font-size:10px;">
                <div style="margin-bottom:6px;"><strong>Fecha:</strong> ${new Date(notas[0].fecha || notas[0].created_at).toLocaleDateString('es-MX')}</div>
                <div style="margin-bottom:6px;"><strong>Médico:</strong> ${notas[0].medico} (${notas[0].cedula})</div>
                <div style="margin-bottom:6px;"><strong>Dx CIE-10:</strong> ${notas[0].diagnostico_cie10 || '—'}</div>
                <div style="margin-bottom:6px;"><strong>Diagnóstico:</strong> ${notas[0].diagnostico_texto}</div>
                <div style="margin-bottom:6px;"><strong>Plan:</strong> ${notas[0].plan_tratamiento}</div>
            </div>
        </div>` : ''}

        <!-- Signature & Footer -->
        ${signatureHTML(notas[0]?.medico || '', notas[0]?.cedula || '', `${paciente.nombre} ${paciente.apellido_paterno}`)}
        ${footerHTML(paciente.empresa_nombre)}
    </div>`

    openPrintWindow(`Expediente - ${paciente.nombre} ${paciente.apellido_paterno}`, html)
}

// =================================================================
// 3. EXPORT INDIVIDUAL SECTION PDF (Lab, ECG, Audio, etc.)
// =================================================================
export function printSeccionPDF(opts: {
    paciente: any
    titulo: string
    contenidoHTML: string
    medico?: string
    cedula?: string
    interpretacion?: string
}) {
    if (!opts.paciente) return
    const p = opts.paciente
    const edad = p.fecha_nacimiento ? calcEdad(p.fecha_nacimiento) : '—'
    const fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

    const html = `
    <div style="max-width:800px; margin:0 auto; padding:24px;">
        ${letterheadHTML()}

        <div style="text-align:center; margin:20px 0 10px;">
            <div style="font-size:18px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#0f172a;">${opts.titulo}</div>
            <div style="font-size:10px; color:#64748b; font-weight:600;">Reporte Médico Individual — ${fechaHoy}</div>
        </div>

        <!-- Patient mini bar -->
        <div class="patient-bar">
            <div class="patient-cell" style="flex:2;"><div class="patient-cell-label">Paciente</div><div class="patient-cell-value">${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Edad</div><div class="patient-cell-value">${edad} años</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Empresa</div><div class="patient-cell-value">${p.empresa_nombre || '—'}</div></div>
            <div class="patient-cell"><div class="patient-cell-label">Puesto</div><div class="patient-cell-value">${p.puesto || '—'}</div></div>
        </div>

        <!-- Section content -->
        <div style="margin-top:16px;">
            ${opts.contenidoHTML}
        </div>

        ${opts.interpretacion ? `
        <div style="margin-top:16px;">
            <div class="section-title">Interpretación Médica</div>
            <div style="padding:12px; font-size:11px; color:#334155; line-height:1.7; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-top:8px;">
                ${opts.interpretacion}
            </div>
        </div>` : ''}

        ${signatureHTML(opts.medico || '', opts.cedula || '', `${p.nombre} ${p.apellido_paterno}`)}
        ${footerHTML(p.empresa_nombre)}
    </div>`

    openPrintWindow(`${opts.titulo} - ${p.nombre} ${p.apellido_paterno}`, html)
}
