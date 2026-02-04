import React, { useRef } from 'react';
import { AlertTriangle, Printer, Download, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface IncidentReportData {
  patient: {
    name: string;
    age: number;
    employeeNumber: string;
    department: string;
    position: string;
  };
  incident: {
    date: string;
    time: string;
    location: string;
    type: string; // 'Accidente', 'Enfermedad', 'Incidente'
    severity: 'Leve' | 'Moderado' | 'Grave';
    description: string;
    bodyPart?: string;
    witnesses?: string[];
  };
  treatment: {
    firstAid: string;
    referral?: string;
    daysOff?: number;
    restrictions?: string[];
  };
  doctor: {
    name: string;
    license: string;
  };
  reportNumber: string;
  photos?: string[]; // URLs de fotos
}

interface IncidentReportPDFProps {
  data: IncidentReportData;
}

export function IncidentReportPDF({ data }: IncidentReportPDFProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Incidente - ${data.patient.name}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { margin: 0; }
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .report-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background: white;
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              margin: -40px -40px 30px -40px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 20px;
              font-weight: bold;
              margin-top: 10px;
            }
            .report-number {
              font-size: 14px;
              opacity: 0.9;
            }
            .alert-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
              border-left: 4px solid #f59e0b;
              padding-left: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
            }
            .info-item {
              font-size: 14px;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
              display: block;
              margin-bottom: 4px;
            }
            .severity-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 14px;
            }
            .severity-leve {
              background: #d1fae5;
              color: #065f46;
            }
            .severity-moderado {
              background: #fef3c7;
              color: #92400e;
            }
            .severity-grave {
              background: #fee2e2;
              color: #991b1b;
            }
            .description-box {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              margin: 10px 0;
            }
            .treatment-box {
              background: #dbeafe;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .witnesses-list {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
            }
            .witnesses-list ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .restrictions-box {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .restrictions-box ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .signature {
              margin-top: 40px;
              text-align: right;
            }
            .signature-line {
              border-top: 2px solid #1f2937;
              width: 300px;
              margin-left: auto;
              margin-top: 60px;
              padding-top: 10px;
            }
            .doctor-info {
              font-size: 14px;
              color: #6b7280;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getSeverityClass = () => {
    switch (data.incident.severity) {
      case 'Leve': return 'severity-leve';
      case 'Moderado': return 'severity-moderado';
      case 'Grave': return 'severity-grave';
      default: return 'severity-leve';
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
      </div>

      {/* PDF Preview */}
      <div ref={printRef} className="report-container bg-white border rounded-lg shadow-lg">
        {/* Header */}
        <div className="header">
          <div className="logo">⚠️ GPMedical</div>
          <div className="text-sm">Sistema de Medicina del Trabajo</div>
          <div className="report-title">Reporte de Incidente Laboral</div>
          <div className="report-number">Folio: {data.reportNumber}</div>
        </div>

        <div className="p-8">
          {/* Alert */}
          <div className="alert-box">
            <strong>⚠️ IMPORTANTE:</strong> Este reporte debe ser enviado a la autoridad laboral correspondiente
            dentro de las 72 horas siguientes al incidente, conforme a la NOM-019-STPS-2011.
          </div>

          {/* Worker Information */}
          <div className="section">
            <div className="section-title">Información del Trabajador</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre Completo:</span>
                {data.patient.name}
              </div>
              <div className="info-item">
                <span className="info-label">Edad:</span>
                {data.patient.age} años
              </div>
              <div className="info-item">
                <span className="info-label">No. Empleado:</span>
                {data.patient.employeeNumber}
              </div>
              <div className="info-item">
                <span className="info-label">Departamento:</span>
                {data.patient.department}
              </div>
              <div className="info-item">
                <span className="info-label">Puesto:</span>
                {data.patient.position}
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="section">
            <div className="section-title">Detalles del Incidente</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Fecha:</span>
                {new Date(data.incident.date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="info-item">
                <span className="info-label">Hora:</span>
                {data.incident.time}
              </div>
              <div className="info-item">
                <span className="info-label">Lugar:</span>
                {data.incident.location}
              </div>
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                {data.incident.type}
              </div>
              <div className="info-item">
                <span className="info-label">Severidad:</span>
                <span className={`severity-badge ${getSeverityClass()}`}>
                  {data.incident.severity}
                </span>
              </div>
              {data.incident.bodyPart && (
                <div className="info-item">
                  <span className="info-label">Parte del Cuerpo Afectada:</span>
                  {data.incident.bodyPart}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="section">
            <div className="section-title">Descripción del Incidente</div>
            <div className="description-box">
              {data.incident.description}
            </div>
          </div>

          {/* Witnesses */}
          {data.incident.witnesses && data.incident.witnesses.length > 0 && (
            <div className="section">
              <div className="section-title">Testigos</div>
              <div className="witnesses-list">
                <ul>
                  {data.incident.witnesses.map((witness, index) => (
                    <li key={index}>{witness}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Treatment */}
          <div className="section">
            <div className="section-title">Atención Médica</div>
            <div className="treatment-box">
              <div className="mb-3">
                <strong>Primeros Auxilios:</strong>
                <div className="mt-2">{data.treatment.firstAid}</div>
              </div>
              {data.treatment.referral && (
                <div className="mb-3">
                  <strong>Referencia:</strong>
                  <div className="mt-2">{data.treatment.referral}</div>
                </div>
              )}
              {data.treatment.daysOff && (
                <div>
                  <strong>Días de Incapacidad:</strong> {data.treatment.daysOff} días
                </div>
              )}
            </div>
          </div>

          {/* Restrictions */}
          {data.treatment.restrictions && data.treatment.restrictions.length > 0 && (
            <div className="section">
              <div className="section-title">Restricciones Laborales</div>
              <div className="restrictions-box">
                <ul>
                  {data.treatment.restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="signature">
            <div className="signature-line">
              <div className="font-bold text-gray-900">{data.doctor.name}</div>
              <div className="doctor-info">Cédula Profesional: {data.doctor.license}</div>
              <div className="doctor-info">Médico del Trabajo</div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div>Este reporte es confidencial y debe ser manejado conforme a la normatividad vigente.</div>
            <div className="mt-2">
              Emitido conforme a la NOM-019-STPS-2011 y NOM-024-SSA3-2012
            </div>
            <div className="mt-2">
              GPMedical - Sistema de Medicina del Trabajo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
