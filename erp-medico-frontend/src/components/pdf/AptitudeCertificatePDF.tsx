import React, { useRef } from 'react';
import { FileCheck, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AptitudeCertificateData {
    patient: {
        name: string;
        age: number;
        gender: string;
        employeeNumber: string;
        department: string;
        position: string;
    };
    doctor: {
        name: string;
        license: string;
        specialty: string;
    };
    date: string;
    evaluation: {
        type: string; // 'Ingreso', 'Periódica', 'Reingreso', 'Cambio de puesto'
        result: 'Apto' | 'Apto con restricciones' | 'No apto';
        restrictions?: string[];
        validUntil?: string;
    };
    examinations: string[];
    observations?: string;
}

interface AptitudeCertificatePDFProps {
    data: AptitudeCertificateData;
}

export function AptitudeCertificatePDF({ data }: AptitudeCertificatePDFProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
      <html>
        <head>
          <title>Certificado de Aptitud - ${data.patient.name}</title>
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
            .certificate-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background: white;
              border: 3px solid #10b981;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 10px;
            }
            .certificate-title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin: 20px 0;
              text-transform: uppercase;
            }
            .certificate-number {
              font-size: 14px;
              color: #6b7280;
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
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .info-row {
              display: grid;
              grid-template-columns: 200px 1fr;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
            }
            .result-box {
              text-align: center;
              padding: 30px;
              margin: 30px 0;
              border-radius: 12px;
              font-size: 28px;
              font-weight: bold;
            }
            .result-apto {
              background: #d1fae5;
              color: #065f46;
              border: 3px solid #10b981;
            }
            .result-restricciones {
              background: #fef3c7;
              color: #92400e;
              border: 3px solid #f59e0b;
            }
            .result-no-apto {
              background: #fee2e2;
              color: #991b1b;
              border: 3px solid #ef4444;
            }
            .restrictions-list {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .restrictions-list ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .examinations-list {
              background: #dbeafe;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .examinations-list ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .validity {
              background: #e0e7ff;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-weight: 600;
              color: #3730a3;
            }
            .signature {
              margin-top: 60px;
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid #1f2937;
              width: 300px;
              margin: 60px auto 10px;
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

    const getResultClass = () => {
        switch (data.evaluation.result) {
            case 'Apto': return 'result-apto';
            case 'Apto con restricciones': return 'result-restricciones';
            case 'No apto': return 'result-no-apto';
            default: return 'result-apto';
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
            <div ref={printRef} className="certificate-container bg-white border-4 border-emerald-500 rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="header">
                    <div className="logo">MediFlow</div>
                    <div className="text-sm text-gray-600">Sistema de Medicina del Trabajo</div>
                    <div className="certificate-title">Certificado de Aptitud Laboral</div>
                    <div className="certificate-number">
                        Folio: CERT-{new Date(data.date).getFullYear()}-{data.patient.employeeNumber}
                    </div>
                </div>

                {/* Patient Information */}
                <div className="section">
                    <div className="section-title">Datos del Trabajador</div>
                    <div className="patient-info">
                        <div className="info-row">
                            <div className="info-label">Nombre Completo:</div>
                            <div>{data.patient.name}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Edad:</div>
                            <div>{data.patient.age} años</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Género:</div>
                            <div>{data.patient.gender}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">No. Empleado:</div>
                            <div>{data.patient.employeeNumber}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Departamento:</div>
                            <div>{data.patient.department}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Puesto:</div>
                            <div>{data.patient.position}</div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Type */}
                <div className="section">
                    <div className="section-title">Tipo de Evaluación</div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <strong>{data.evaluation.type}</strong> - Fecha: {new Date(data.date).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                {/* Examinations */}
                <div className="section">
                    <div className="section-title">Exámenes Realizados</div>
                    <div className="examinations-list">
                        <ul>
                            {data.examinations.map((exam, index) => (
                                <li key={index}>{exam}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Result */}
                <div className={`result-box ${getResultClass()}`}>
                    {data.evaluation.result.toUpperCase()}
                </div>

                {/* Restrictions */}
                {data.evaluation.restrictions && data.evaluation.restrictions.length > 0 && (
                    <div className="section">
                        <div className="section-title">Restricciones Laborales</div>
                        <div className="restrictions-list">
                            <ul>
                                {data.evaluation.restrictions.map((restriction, index) => (
                                    <li key={index}>{restriction}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Validity */}
                {data.evaluation.validUntil && (
                    <div className="validity">
                        Válido hasta: {new Date(data.evaluation.validUntil).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                )}

                {/* Observations */}
                {data.observations && (
                    <div className="section">
                        <div className="section-title">Observaciones</div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            {data.observations}
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
                    <div>Este certificado es válido únicamente con firma y sello del médico tratante.</div>
                    <div className="mt-2">
                        Emitido conforme a la NOM-030-STPS-2009 y NOM-024-SSA3-2012
                    </div>
                    <div className="mt-2">
                        MediFlow - Sistema de Medicina del Trabajo
                    </div>
                </div>
            </div>
        </div>
    );
}
