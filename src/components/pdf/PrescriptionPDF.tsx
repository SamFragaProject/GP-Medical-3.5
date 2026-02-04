import React, { useRef } from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionData {
  patient: {
    name: string;
    age: number;
    gender: string;
    employeeNumber: string;
    department: string;
  };
  doctor: {
    name: string;
    license: string;
    specialty: string;
  };
  date: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
}

interface PrescriptionPDFProps {
  data: PrescriptionData;
}

export function PrescriptionPDF({ data }: PrescriptionPDFProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receta Médica - ${data.patient.name}</title>
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
            .prescription-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background: white;
            }
            .header {
              border-bottom: 3px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #6b7280;
              font-size: 14px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
              border-left: 4px solid #10b981;
              padding-left: 10px;
            }
            .patient-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
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
            }
            .medication {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 15px;
              border-left: 4px solid #3b82f6;
            }
            .medication-name {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .medication-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .medication-instructions {
              font-size: 14px;
              color: #4b5563;
              font-style: italic;
              margin-top: 8px;
            }
            .diagnosis {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .notes {
              background: #dbeafe;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              font-size: 14px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
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

  const handleDownload = () => {
    handlePrint(); // Por ahora usa print, luego podemos agregar PDF real
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
      </div>

      {/* PDF Preview */}
      <div ref={printRef} className="prescription-container bg-white border rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="header">
          <div className="logo">GPMedical</div>
          <div className="subtitle">Sistema de Medicina del Trabajo</div>
          <div className="text-sm text-gray-600 mt-2">
            Fecha: {new Date(data.date).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Patient Information */}
        <div className="section">
          <div className="section-title">Información del Paciente</div>
          <div className="patient-info">
            <div className="info-item">
              <span className="info-label">Nombre:</span> {data.patient.name}
            </div>
            <div className="info-item">
              <span className="info-label">Edad:</span> {data.patient.age} años
            </div>
            <div className="info-item">
              <span className="info-label">Género:</span> {data.patient.gender}
            </div>
            <div className="info-item">
              <span className="info-label">No. Empleado:</span> {data.patient.employeeNumber}
            </div>
            <div className="info-item">
              <span className="info-label">Departamento:</span> {data.patient.department}
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="section">
          <div className="section-title">Diagnóstico</div>
          <div className="diagnosis">
            {data.diagnosis}
          </div>
        </div>

        {/* Medications */}
        <div className="section">
          <div className="section-title">Prescripción</div>
          {data.medications.map((med, index) => (
            <div key={index} className="medication">
              <div className="medication-name">
                {index + 1}. {med.name}
              </div>
              <div className="medication-details">
                <div><strong>Dosis:</strong> {med.dosage}</div>
                <div><strong>Frecuencia:</strong> {med.frequency}</div>
                <div><strong>Duración:</strong> {med.duration}</div>
              </div>
              {med.instructions && (
                <div className="medication-instructions">
                  Indicaciones: {med.instructions}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="section">
            <div className="section-title">Observaciones</div>
            <div className="notes">
              {data.notes}
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="signature">
          <div className="signature-line">
            <div className="font-bold text-gray-900">{data.doctor.name}</div>
            <div className="doctor-info">Cédula Profesional: {data.doctor.license}</div>
            <div className="doctor-info">{data.doctor.specialty}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="text-xs text-gray-500">
            Este documento es válido únicamente con firma y sello del médico tratante.
          </div>
          <div className="text-xs text-gray-500 mt-2">
            GPMedical - Sistema de Medicina del Trabajo | NOM-024-SSA3-2012
          </div>
        </div>
      </div>
    </div>
  );
}
