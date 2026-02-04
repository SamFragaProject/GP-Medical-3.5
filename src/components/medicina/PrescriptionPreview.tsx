/**
 * PrescriptionPreview - Vista Previa de Receta Premium
 * 
 * Diseño profesional estilo documento oficial con gradientes sutiles,
 * tipografía elegante y estructura clara para impresión
 */
import React from 'react'
import { Pill, Stethoscope, FileSignature, Shield, QrCode, Calendar, User, Building2 } from 'lucide-react'

interface PreviewMedication {
  nombre: string
  concentracion?: string
  dosis: string
  frecuencia: string
  duracion: string
  via_administracion: string
  indicaciones?: string
  index: number
}

interface PrescriptionPreviewProps {
  pacienteNombre: string
  pacienteId?: string
  diagnostico: string
  medicamentos: PreviewMedication[]
  observaciones?: string
  medico?: string
  fecha: Date
  cedulaProfesional?: string
  clinicaNombre?: string
  clinicaDireccion?: string
}

export function PrescriptionPreview({
  pacienteNombre,
  pacienteId,
  diagnostico,
  medicamentos,
  observaciones,
  medico = 'Dr. Luna Rivera',
  fecha,
  cedulaProfesional = '12345678',
  clinicaNombre = 'GPMedical Clínica',
  clinicaDireccion = 'Av. Principal #123, Ciudad'
}: PrescriptionPreviewProps) {

  // Generar ID de receta
  const recetaId = `RX-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${fecha.getTime().toString().slice(-4)}`

  return (
    <div className="w-full">
      {/* Contenedor principal - Tamaño carta para impresión */}
      <div className="mx-auto bg-white shadow-2xl shadow-blue-900/10 rounded-2xl border border-gray-200 print:shadow-none print:border-0 print:rounded-none w-full max-w-[816px] print:w-[816px] overflow-hidden">

        {/* Header con gradiente - Identidad de la clínica */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-6 print:py-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">{clinicaNombre}</h1>
                <p className="text-blue-100 text-sm mt-1">{clinicaDireccion}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
                <FileSignature className="w-5 h-5" />
                <div>
                  <p className="text-xs text-blue-200">Receta No.</p>
                  <p className="font-mono font-bold">{recetaId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la receta */}
        <div className="p-8 print:p-6 space-y-6">

          {/* Información del médico y fecha */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{medico}</p>
                <p className="text-sm text-gray-500">Céd. Prof. {cedulaProfesional}</p>
                <p className="text-xs text-gray-400 mt-1">Medicina General</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{fecha.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs
              </p>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-blue-800 uppercase tracking-wider">Datos del Paciente</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Nombre Completo</p>
                <p className="font-semibold text-gray-900 text-lg">{pacienteNombre || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">ID Paciente</p>
                <p className="font-mono font-semibold text-gray-900">
                  {pacienteId || pacienteNombre.split(' ').slice(0, 2).join('').toUpperCase() + '-' + fecha.getTime().toString().slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-purple-800 uppercase tracking-wider">Diagnóstico</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[80px]">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {diagnostico || <span className="text-gray-400 italic">Sin diagnóstico especificado</span>}
              </p>
            </div>
          </div>

          {/* Medicamentos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Pill className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Indicación Terapéutica</span>
              </div>
              <span className="text-xs text-gray-500">{medicamentos.length} medicamento(s)</span>
            </div>

            {medicamentos.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 italic">Sin medicamentos agregados aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicamentos.map((m, idx) => (
                  <div
                    key={m.index || idx}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 uppercase">{m.nombre}</p>
                          {m.concentracion && (
                            <p className="text-sm text-gray-500">{m.concentracion}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {m.via_administracion || 'VO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dosis</p>
                        <p className="font-semibold text-blue-700">{m.dosis || '—'}</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Frecuencia</p>
                        <p className="font-semibold text-purple-700">{m.frecuencia || '—'}</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Duración</p>
                        <p className="font-semibold text-orange-700">{m.duracion || '—'}</p>
                      </div>
                    </div>

                    {m.indicaciones && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-xs text-yellow-800">
                          <span className="font-semibold">Indicaciones:</span> {m.indicaciones}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observaciones */}
          {observaciones && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FileSignature className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">Observaciones</span>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{observaciones}</p>
              </div>
            </div>
          )}

          {/* Firma y QR */}
          <div className="pt-8 mt-8 border-t-2 border-dashed border-gray-200">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <div className="w-48 border-t-2 border-gray-400 pt-2">
                  <p className="font-bold text-gray-900">{medico}</p>
                  <p className="text-sm text-gray-500">Céd. Prof. {cedulaProfesional}</p>
                  <p className="text-xs text-gray-400 mt-1">Firma Digital Electrónica</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Código de verificación</p>
                  <p className="font-mono font-bold text-gray-600">{recetaId}</p>
                  <p className="mt-2 flex items-center gap-1 text-emerald-600">
                    <Shield className="w-3 h-3" /> Documento válido
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-relaxed text-center">
              Esta receta médica es un documento electrónico generado por {clinicaNombre}.
              Válida únicamente con firma electrónica verificable. Las indicaciones deben ser corroboradas clínicamente.
              Prohibida su venta, alteración o distribución no autorizada. Conservar en lugar fresco y seco.
            </p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Building2 className="w-3 h-3" /> {clinicaNombre}
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" /> {fecha.toLocaleDateString('es-MX')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
