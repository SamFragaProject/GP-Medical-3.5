/**
 * Servicio de Generación de PDF
 * 
 * Utiliza el API de impresión del navegador para generar PDFs
 * de alta calidad con diseño profesional.
 */

interface PDFGeneratorOptions {
  filename?: string
  orientation?: 'portrait' | 'landscape'
  size?: 'letter' | 'legal' | 'a4'
}

// Estilos CSS para impresión de documentos oficiales
const getDocumentStyles = () => `
  @page {
    size: letter;
    margin: 0.5in;
  }
  
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #1e293b;
    background: white;
  }
  
  .print-container {
    max-width: 7.5in;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #0d9488;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
  
  .company-info h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0d9488;
    margin: 0;
  }
  
  .company-info p {
    font-size: 8pt;
    color: #64748b;
    margin: 2px 0 0 0;
  }
  
  .document-type {
    text-align: right;
  }
  
  .document-type h2 {
    font-size: 14pt;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    background: #f1f5f9;
    padding: 8px 16px;
    border-radius: 8px;
  }
  
  .document-type .folio {
    font-size: 9pt;
    color: #64748b;
    margin-top: 4px;
  }
  
  .section {
    margin-bottom: 20px;
    page-break-inside: avoid;
  }
  
  .section-title {
    font-size: 10pt;
    font-weight: 700;
    color: #0d9488;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 12px;
  }
  
  .data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .data-grid.cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .data-grid.cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .data-item {
    background: #f8fafc;
    padding: 10px 12px;
    border-radius: 6px;
    border-left: 3px solid #0d9488;
  }
  
  .data-item label {
    display: block;
    font-size: 7pt;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
  }
  
  .data-item .value {
    font-size: 10pt;
    font-weight: 600;
    color: #1e293b;
  }
  
  .highlight-box {
    background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
    border: 2px solid #0d9488;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    text-align: center;
  }
  
  .highlight-box.warning {
    background: linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%);
    border-color: #f59e0b;
  }
  
  .highlight-box.danger {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-color: #ef4444;
  }
  
  .highlight-box h3 {
    font-size: 14pt;
    font-weight: 800;
    color: #0d9488;
    margin: 0 0 4px 0;
  }
  
  .highlight-box.warning h3 { color: #f59e0b; }
  .highlight-box.danger h3 { color: #ef4444; }
  
  .highlight-box p {
    font-size: 9pt;
    color: #64748b;
    margin: 0;
  }
  
  .text-block {
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    font-size: 9pt;
    line-height: 1.5;
    color: #334155;
    border: 1px solid #e2e8f0;
  }
  
  .signatures-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px dashed #e2e8f0;
  }
  
  .signature-box {
    text-align: center;
  }
  
  .signature-line {
    border-bottom: 2px solid #1e293b;
    height: 60px;
    margin-bottom: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 4px;
  }
  
  .signature-line img {
    max-height: 50px;
    max-width: 150px;
  }
  
  .signature-label {
    font-size: 8pt;
    font-weight: 600;
    color: #64748b;
  }
  
  .signature-name {
    font-size: 9pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 4px;
  }
  
  .footer {
    margin-top: 30px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 7pt;
    color: #94a3b8;
  }
  
  .qr-section {
    text-align: center;
    padding: 12px;
  }
  
  .qr-code {
    width: 80px;
    height: 80px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8pt;
    color: #94a3b8;
  }
  
  .legal-text {
    font-size: 7pt;
    color: #94a3b8;
    text-align: center;
    margin-top: 16px;
    line-height: 1.4;
  }
  
  @media print {
    .no-print { display: none !important; }
  }
`

export const pdfGeneratorService = {
  /**
   * Genera PDF del formato ST-7 (Aviso de Atención Médica)
   */
  generateST7(data: {
    folio: string
    paciente: any
    empresa: any
    riesgo: any
    medico: any
    firmas?: { trabajador?: string; patron?: string; medico?: string }
  }): string {
    const { folio, paciente, empresa, riesgo, medico, firmas } = data

    const tipoRiesgoLabel: Record<string, string> = {
      'accidente_trabajo': 'Accidente de Trabajo',
      'accidente_trayecto': 'Accidente en Trayecto',
      'enfermedad_trabajo': 'Enfermedad de Trabajo'
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ST-7 - ${folio}</title>
        <style>${getDocumentStyles()}</style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="logo">GP</div>
              <div class="company-info">
                <h1>GPMedical</h1>
                <p>Sistema de Salud Ocupacional</p>
              </div>
            </div>
            <div class="document-type">
              <h2>FORMATO ST-7</h2>
              <p class="folio">Folio: ${folio}</p>
            </div>
          </div>
          
          <!-- Título -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 12pt; color: #1e293b; margin: 0;">
              AVISO DE ATENCIÓN MÉDICA Y CALIFICACIÓN DE PROBABLE RIESGO DE TRABAJO
            </h2>
            <p style="font-size: 8pt; color: #64748b; margin-top: 4px;">
              Artículos 51-54 de la Ley del Seguro Social
            </p>
          </div>
          
          <!-- Tipo de Riesgo -->
          <div class="highlight-box ${riesgo.tipo_riesgo === 'accidente_trabajo' ? '' : riesgo.tipo_riesgo === 'enfermedad_trabajo' ? 'warning' : ''}">
            <h3>${tipoRiesgoLabel[riesgo.tipo_riesgo] || riesgo.tipo_riesgo}</h3>
            <p>Fecha del evento: ${riesgo.fecha_ocurrencia || 'No especificada'}</p>
          </div>
          
          <!-- Datos del Trabajador -->
          <div class="section">
            <div class="section-title">Datos del Trabajador</div>
            <div class="data-grid">
              <div class="data-item">
                <label>Nombre Completo</label>
                <div class="value">${paciente?.nombre || ''} ${paciente?.apellido_paterno || ''} ${paciente?.apellido_materno || ''}</div>
              </div>
              <div class="data-item">
                <label>NSS</label>
                <div class="value">${paciente?.nss || 'No registrado'}</div>
              </div>
              <div class="data-item">
                <label>CURP</label>
                <div class="value">${paciente?.curp || 'No registrado'}</div>
              </div>
              <div class="data-item">
                <label>Puesto</label>
                <div class="value">${paciente?.puesto || 'No especificado'}</div>
              </div>
            </div>
          </div>
          
          <!-- Datos del Patrón -->
          <div class="section">
            <div class="section-title">Datos del Patrón</div>
            <div class="data-grid">
              <div class="data-item">
                <label>Razón Social</label>
                <div class="value">${empresa?.nombre || 'Empresa no especificada'}</div>
              </div>
              <div class="data-item">
                <label>Registro Patronal IMSS</label>
                <div class="value">${empresa?.registro_imss || 'No registrado'}</div>
              </div>
            </div>
          </div>
          
          <!-- Descripción del Accidente -->
          <div class="section">
            <div class="section-title">Descripción del Accidente / Enfermedad</div>
            <div class="text-block">
              ${riesgo.descripcion_accidente || 'Sin descripción'}
            </div>
          </div>
          
          <!-- Diagnóstico Médico -->
          <div class="section">
            <div class="section-title">Diagnóstico Médico</div>
            <div class="data-grid cols-3">
              <div class="data-item">
                <label>Región Anatómica</label>
                <div class="value">${riesgo.region_anatomica || 'N/A'}</div>
              </div>
              <div class="data-item">
                <label>Tipo de Lesión</label>
                <div class="value">${riesgo.tipo_lesion || 'N/A'}</div>
              </div>
              <div class="data-item">
                <label>CIE-10</label>
                <div class="value">${riesgo.diagnostico_cie10 || 'N/A'}</div>
              </div>
            </div>
            <div class="text-block" style="margin-top: 12px;">
              <strong>Diagnóstico Inicial:</strong><br>
              ${riesgo.diagnostico_inicial || 'Pendiente de diagnóstico'}
            </div>
          </div>
          
          <!-- Firmas -->
          <div class="signatures-section">
            <div class="signature-box">
              <div class="signature-line">
                ${firmas?.trabajador ? `<img src="${firmas.trabajador}" alt="Firma trabajador" />` : ''}
              </div>
              <div class="signature-label">Firma del Trabajador</div>
              <div class="signature-name">${paciente?.nombre || ''} ${paciente?.apellido_paterno || ''}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                ${firmas?.patron ? `<img src="${firmas.patron}" alt="Firma patrón" />` : ''}
              </div>
              <div class="signature-label">Firma del Patrón o Representante</div>
              <div class="signature-name">&nbsp;</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                ${firmas?.medico ? `<img src="${firmas.medico}" alt="Firma médico" />` : ''}
              </div>
              <div class="signature-label">Firma del Médico Tratante</div>
              <div class="signature-name">Dr. ${medico?.nombre || ''} ${medico?.apellido_paterno || ''}</div>
              <div style="font-size: 7pt; color: #64748b;">Céd. Prof. ${medico?.cedula_profesional || 'Pendiente'}</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>
              <strong>Generado:</strong> ${new Date().toLocaleString('es-MX')}
            </div>
            <div>
              <strong>Sistema:</strong> GPMedical 3.5 - Medicina del Trabajo
            </div>
          </div>
          
          <div class="legal-text">
            Este documento es válido como Aviso de Atención Médica según los artículos 51-54 de la Ley del Seguro Social.
            El trabajador deberá presentar este formato ante la Unidad de Medicina Familiar del IMSS para su calificación definitiva.
          </div>
        </div>
      </body>
      </html>
    `

    return html
  },

  /**
   * Genera PDF del formato ST-9 (Dictamen de Incapacidad)
   */
  generateST9(data: {
    folio: string
    paciente: any
    incapacidad: any
    riesgo?: any
    medico: any
    firmas?: { medico?: string }
  }): string {
    const { folio, paciente, incapacidad, riesgo, medico, firmas } = data

    const tipoIncapacidadLabel: Record<string, { label: string; class: string }> = {
      'temporal': { label: 'INCAPACIDAD TEMPORAL', class: '' },
      'parcial_permanente': { label: 'INCAPACIDAD PARCIAL PERMANENTE', class: 'warning' },
      'total_permanente': { label: 'INCAPACIDAD TOTAL PERMANENTE', class: 'danger' }
    }

    const tipoInfo = tipoIncapacidadLabel[incapacidad.tipo_incapacidad] || { label: 'INCAPACIDAD', class: '' }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ST-9 - ${folio}</title>
        <style>${getDocumentStyles()}</style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="logo" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">GP</div>
              <div class="company-info">
                <h1 style="color: #6366f1;">GPMedical</h1>
                <p>Sistema de Salud Ocupacional</p>
              </div>
            </div>
            <div class="document-type">
              <h2 style="background: #eef2ff;">FORMATO ST-9</h2>
              <p class="folio">Folio: ${folio}</p>
            </div>
          </div>
          
          <!-- Título -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 12pt; color: #1e293b; margin: 0;">
              DICTAMEN DE INCAPACIDAD POR RIESGO DE TRABAJO
            </h2>
            <p style="font-size: 8pt; color: #64748b; margin-top: 4px;">
              Artículos 58-62 de la Ley del Seguro Social
            </p>
          </div>
          
          <!-- Tipo de Incapacidad -->
          <div class="highlight-box ${tipoInfo.class}" style="border-color: #6366f1; ${!tipoInfo.class ? 'background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);' : ''}">
            <h3 style="color: ${tipoInfo.class === 'warning' ? '#f59e0b' : tipoInfo.class === 'danger' ? '#ef4444' : '#6366f1'};">
              ${tipoInfo.label}
            </h3>
            ${incapacidad.tipo_incapacidad === 'parcial_permanente' ?
        `<p style="font-size: 20pt; font-weight: 800; color: #f59e0b;">${incapacidad.porcentaje_valuacion || 0}%</p>` :
        ''}
          </div>
          
          <!-- Datos del Trabajador -->
          <div class="section">
            <div class="section-title" style="color: #6366f1; border-color: #c7d2fe;">Datos del Trabajador</div>
            <div class="data-grid">
              <div class="data-item" style="border-color: #6366f1;">
                <label>Nombre Completo</label>
                <div class="value">${paciente?.nombre || ''} ${paciente?.apellido_paterno || ''} ${paciente?.apellido_materno || ''}</div>
              </div>
              <div class="data-item" style="border-color: #6366f1;">
                <label>NSS</label>
                <div class="value">${paciente?.nss || 'No registrado'}</div>
              </div>
            </div>
          </div>
          
          <!-- Período de Incapacidad -->
          <div class="section">
            <div class="section-title" style="color: #6366f1; border-color: #c7d2fe;">Período de Incapacidad</div>
            <div class="data-grid cols-4">
              <div class="data-item" style="border-color: #6366f1;">
                <label>Fecha Inicio</label>
                <div class="value">${incapacidad.fecha_inicio || 'N/A'}</div>
              </div>
              <div class="data-item" style="border-color: #6366f1;">
                <label>Fecha Fin</label>
                <div class="value">${incapacidad.fecha_fin || 'N/A'}</div>
              </div>
              <div class="data-item" style="border-color: #6366f1;">
                <label>Días Otorgados</label>
                <div class="value" style="font-size: 14pt; color: #6366f1;">${incapacidad.dias_incapacidad || 0}</div>
              </div>
              <div class="data-item" style="border-color: #6366f1;">
                <label>Días Acumulados</label>
                <div class="value" style="font-size: 14pt; color: #6366f1;">${incapacidad.dias_acumulados || incapacidad.dias_incapacidad || 0}</div>
              </div>
            </div>
          </div>
          
          <!-- Diagnóstico -->
          <div class="section">
            <div class="section-title" style="color: #6366f1; border-color: #c7d2fe;">Dictamen Médico</div>
            <div class="text-block">
              <strong>Diagnóstico Definitivo:</strong><br>
              ${incapacidad.diagnostico_definitivo || 'Pendiente de diagnóstico'}
            </div>
            <div class="data-grid" style="margin-top: 12px;">
              <div class="data-item" style="border-color: #6366f1;">
                <label>Pronóstico</label>
                <div class="value" style="text-transform: capitalize;">${incapacidad.pronostico || 'No especificado'}</div>
              </div>
              <div class="data-item" style="border-color: #6366f1;">
                <label>Requiere Seguimiento</label>
                <div class="value">${incapacidad.requiere_seguimiento ? 'Sí' : 'No'}</div>
              </div>
            </div>
            ${incapacidad.secuelas ? `
              <div class="text-block" style="margin-top: 12px;">
                <strong>Secuelas:</strong><br>
                ${incapacidad.secuelas}
              </div>
            ` : ''}
            ${incapacidad.recomendaciones_reintegracion ? `
              <div class="text-block" style="margin-top: 12px;">
                <strong>Recomendaciones para Reintegración:</strong><br>
                ${incapacidad.recomendaciones_reintegracion}
              </div>
            ` : ''}
          </div>
          
          <!-- Firmas -->
          <div class="signatures-section" style="grid-template-columns: 1fr 1fr;">
            <div class="signature-box">
              <div class="signature-line">
                ${firmas?.medico ? `<img src="${firmas.medico}" alt="Firma médico" />` : ''}
              </div>
              <div class="signature-label">Firma del Médico Dictaminador</div>
              <div class="signature-name">Dr. ${medico?.nombre || ''} ${medico?.apellido_paterno || ''}</div>
              <div style="font-size: 7pt; color: #64748b;">Céd. Prof. ${medico?.cedula_profesional || 'Pendiente'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Sello de la Unidad Médica</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>
              <strong>Generado:</strong> ${new Date().toLocaleString('es-MX')}
            </div>
            <div>
              <strong>Sistema:</strong> GPMedical 3.5 - Medicina del Trabajo
            </div>
          </div>
          
          <div class="legal-text">
            Este documento es válido como Dictamen de Incapacidad según los artículos 58-62 de la Ley del Seguro Social.
            El trabajador debe presentar este formato ante el IMSS para el pago de subsidios correspondientes.
          </div>
        </div>
      </body>
      </html>
    `

    return html
  },

  /**
   * Abre una ventana de impresión con el HTML generado
   */
  printDocument(html: string, filename?: string): void {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.error('No se pudo abrir la ventana de impresión')
      return
    }

    printWindow.document.write(html)
    printWindow.document.close()

    // Esperar a que cargue y luego imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  },

  /**
   * Descarga el documento como PDF usando la API de impresión
   */
  downloadPDF(html: string, filename: string): void {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Agregar CSS para forzar descarga como PDF
    const pdfHtml = html.replace('</head>', `
      <style>
        @media print {
          @page { margin: 0.5in; }
        }
      </style>
    </head>`)

    printWindow.document.write(pdfHtml)
    printWindow.document.close()
    printWindow.document.title = filename

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  },

  /**
   * Genera PDF del Reporte de Resultados NOM-035
   */
  generateNom035Report(data: {
    empresa: any
    campana: any
    stats: any
    fecha: string
  }): string {
    const { empresa, campana, stats, fecha } = data

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte NOM-035 - ${empresa.nombre}</title>
        <style>${getDocumentStyles()}</style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="logo-section">
              <div class="logo" style="background: #4f46e5;">35</div>
              <div class="company-info">
                <h1 style="color: #4f46e5;">NOM-035-STPS-2018</h1>
                <p>Factores de Riesgo Psicosocial en el Trabajo</p>
              </div>
            </div>
            <div class="document-type">
              <h2>REPORTE DE RESULTADOS</h2>
              <p class="folio">Campaña: ${campana.nombre}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Datos de la Empresa</div>
            <div class="data-grid">
              <div class="data-item">
                <label>Razón Social</label>
                <div class="value">${empresa.nombre}</div>
              </div>
              <div class="data-item">
                <label>Fecha de Reporte</label>
                <div class="value">${fecha}</div>
              </div>
            </div>
          </div>

          <div class="highlight-box">
            <h3>Nivel de Riesgo General</h3>
            <p style="font-size: 24pt; font-weight: 900; color: #4f46e5;">${stats.riesgo_mas_frecuente || 'Bajo'}</p>
            <p>Basado en ${stats.total || 0} encuestas aplicadas</p>
          </div>

          <div class="section">
            <div class="section-title">Distribución de Niveles de Riesgo</div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 12px; text-align: left; font-size: 8pt; color: #64748b;">NIVEL DE RIESGO</th>
                  <th style="padding: 12px; text-align: center; font-size: 8pt; color: #64748b;">FRECUENCIA</th>
                  <th style="padding: 12px; text-align: center; font-size: 8pt; color: #64748b;">PERCENTIL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Muy Alto</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${stats.riesgo_muy_alto || 0}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${Math.round((stats.riesgo_muy_alto / stats.total) * 100) || 0}%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Alto</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${stats.riesgo_alto || 0}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${Math.round((stats.riesgo_alto / stats.total) * 100) || 0}%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Medio</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${stats.riesgo_medio || 0}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${Math.round((stats.riesgo_medio / stats.total) * 100) || 0}%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Bajo</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${stats.riesgo_bajo || 0}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${Math.round((stats.riesgo_bajo / stats.total) * 100) || 0}%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Nulo</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${stats.riesgo_nulo || 0}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${Math.round((stats.riesgo_nulo / stats.total) * 100) || 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div>Generado por GPMedical 3.5 - Inteligencia Predictiva</div>
            <div>Cumplimiento NOM-035-STPS-2018</div>
          </div>
        </div>
      </body>
      </html>
    `
    return html
  },

  /**
   * Genera PDF del Programa de Ergonomía NOM-036
   */
  generateNom036Report(data: {
    empresa: any
    reporte: any
    matriz: any[]
    fecha: string
  }): string {
    const { empresa, reporte, matriz, fecha } = data

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte NOM-036 - ${empresa.nombre}</title>
        <style>${getDocumentStyles()}</style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="logo-section">
              <div class="logo" style="background: #0891b2;">36</div>
              <div class="company-info">
                <h1 style="color: #0891b2;">NOM-036-STPS-2018</h1>
                <p>Factores de Riesgo Ergonómico - Manejo de Cargas</p>
              </div>
            </div>
            <div class="document-type">
              <h2>PROGRAMA DE ERGONOMÍA</h2>
              <p class="folio">Año: ${reporte.anio}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Resumen del Programa</div>
            <div class="data-grid cols-3">
              <div class="data-item">
                <label>Evaluaciones Realizadas</label>
                <div class="value">${reporte.total_evaluaciones}</div>
              </div>
              <div class="data-item">
                <label>Participantes Capacitados</label>
                <div class="value">${reporte.trabajadores_capacitados}</div>
              </div>
              <div class="data-item">
                <label>Avance del Programa</label>
                <div class="value">${reporte.porcentaje_avance}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Matriz de Riesgos por Área</div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 8pt;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 8px; text-align: left;">ÁREA / PUESTO</th>
                  <th style="padding: 8px; text-align: center;">RIESGO MÁX</th>
                  <th style="padding: 8px; text-align: left;">FACTORES IDENTIFICADOS</th>
                </tr>
              </thead>
              <tbody>
                ${matriz.map(m => `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
                      <strong>${m.area}</strong><br>${m.puesto}
                    </td>
                    <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                      <span style="color: ${m.riesgo_maximo === 'muy_alto' ? '#e11d48' : m.riesgo_maximo === 'alto' ? '#f59e0b' : '#10b981'}; font-weight: bold;">
                        ${m.riesgo_maximo.toUpperCase()}
                      </span>
                    </td>
                    <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
                      ${m.factores_identificados.join(', ')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div>Generado por GPMedical 3.5 - Salud Ocupacional</div>
            <div>Cumplimiento NOM-036-1-STPS-2018</div>
          </div>
        </div>
      </body>
      </html>
    `
    return html
  },

  /**
   * Genera PDF del Dictamen Médico-Laboral
   */
  generateDictamen(data: {
    dictamen: any
    empresa: any
    medico: any
    firmas?: { medico?: string; trabajador?: string }
  }): string {
    const { dictamen, empresa, medico, firmas } = data

    const resultadoLabels: Record<string, { label: string; class: string }> = {
      'apto': { label: 'APTO', class: '' },
      'apto_restricciones': { label: 'APTO CON RESTRICCIONES', class: 'warning' },
      'no_apto_temporal': { label: 'NO APTO TEMPORAL', class: 'warning' },
      'no_apto': { label: 'NO APTO', class: 'danger' },
      'evaluacion_complementaria': { label: 'EVALUACIÓN COMPLEMENTARIA', class: 'warning' }
    }

    const resInfo = resultadoLabels[dictamen.resultado] || { label: 'DICTAMEN MÉDICO', class: '' }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dictamen - ${dictamen.folio || dictamen.id}</title>
        <style>${getDocumentStyles()}</style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="logo">GP</div>
              <div class="company-info">
                <h1>GPMedical</h1>
                <p>Sistema de Salud Ocupacional & Medicina del Trabajo</p>
              </div>
            </div>
            <div class="document-type">
              <h2>DICTAMEN MÉDICO-LABORAL</h2>
              <p class="folio">Folio: ${dictamen.folio || 'N/A'}</p>
            </div>
          </div>
          
          <!-- Título -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 14pt; color: #1e293b; margin: 0; text-transform: uppercase;">
              Certificado de Aptitud Laboral
            </h2>
            <p style="font-size: 9pt; color: #64748b; margin-top: 4px;">
              En cumplimiento con la Ley Federal del Trabajo y Normas Oficiales Mexicanas
            </p>
          </div>
          
          <!-- Resultado Highlight -->
          <div class="highlight-box ${resInfo.class}">
            <h3>${resInfo.label}</h3>
            <p>Tipo de Evaluación: ${dictamen.tipo_evaluacion?.toUpperCase() || 'N/A'}</p>
          </div>
          
          <!-- Datos Personales -->
          <div class="section">
            <div class="section-title">Información del Trabajador</div>
            <div class="data-grid cols-3">
              <div class="data-item">
                <label>Nombre</label>
                <div class="value">${dictamen.paciente?.nombre || ''} ${dictamen.paciente?.apellido_paterno || ''}</div>
              </div>
              <div class="data-item">
                <label>Puesto</label>
                <div class="value">${dictamen.paciente?.puesto_trabajo || dictamen.puesto_trabajo || 'No especificado'}</div>
              </div>
              <div class="data-item">
                <label>ID / Expediente</label>
                <div class="value">${dictamen.paciente_id?.slice(0, 8) || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <!-- Empresa -->
          <div class="section">
            <div class="section-title">Datos de la Empresa</div>
            <div class="data-grid">
              <div class="data-item">
                <label>Razón Social</label>
                <div class="value">${empresa?.nombre || 'Empresa no especificada'}</div>
              </div>
              <div class="data-item">
                <label>Área de Trabajo</label>
                <div class="value">${dictamen.paciente?.area_trabajo || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <!-- Resultado y Restricciones -->
          <div class="section">
            <div class="section-title">Conclusiones Médicas</div>
            <div class="text-block" style="margin-bottom: 12px;">
              <strong>Resultado de la Evaluación:</strong><br>
              ${dictamen.resultado_detalle || 'Se concluye aptitud tras la revisión de los estudios correspondientes.'}
            </div>
            
            ${dictamen.restricciones && dictamen.restricciones.length > 0 ? `
              <div class="text-block" style="border-color: #f59e0b; background: #fffbeb;">
                <strong>Restricciones Médicas:</strong><br>
                <ul style="margin: 4px 0 0 16px; padding: 0;">
                  ${dictamen.restricciones.map((r: any) => `<li>${r.descripcion || r}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
          
          <!-- Recomendaciones -->
          <div class="section">
            <div class="section-title">Recomendaciones y Seguimiento</div>
            <div class="text-block">
              ${dictamen.recomendaciones_medicas?.join('. ') || 'Sin recomendaciones adicionales.'}
            </div>
          </div>
          
          <!-- Vigencia -->
          <div class="section">
            <div class="data-grid">
              <div class="data-item">
                <label>Fecha de Emisión</label>
                <div class="value">${new Date(dictamen.created_at || Date.now()).toLocaleDateString('es-MX')}</div>
              </div>
              <div class="data-item">
                <label>Vigencia hasta</label>
                <div class="value">${dictamen.vigencia_fin ? new Date(dictamen.vigencia_fin).toLocaleDateString('es-MX') : 'Indefinida'}</div>
              </div>
            </div>
          </div>
          
          <!-- Firmas -->
          <div class="signatures-section">
            <div class="signature-box">
              <div class="signature-line">
                ${firmas?.trabajador ? `<img src="${firmas.trabajador}" />` : ''}
              </div>
              <div class="signature-label">Firma del Trabajador</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Sello de la Empresa</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                ${firmas?.medico ? `<img src="${firmas.medico}" />` : ''}
              </div>
              <div class="signature-label">Médico Responsable</div>
              <div class="signature-name">Dr. ${medico?.nombre || ''} ${medico?.apellido_paterno || ''}</div>
              <div style="font-size: 7pt; color: #64748b;">Cédula: ${medico?.cedula_profesional || 'N/A'}</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>Documento emitido electrónicamente por Intelligence Bureau - GPMedical 3.5</div>
            <div>Página 1 de 1</div>
          </div>
          
          <div class="legal-text">
            Este dictamen es una constancia de la evaluación médica realizada y no sustituye reposos médicos ni avisos de riesgo de trabajo.
          </div>
        </div>
      </body>
      </html>
    `
    return html
  }
}

