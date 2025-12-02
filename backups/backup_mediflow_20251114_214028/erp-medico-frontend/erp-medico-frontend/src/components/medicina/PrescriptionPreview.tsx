import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface PreviewMedication {
  nombre: string
  concentracion: string
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
}

// Vista previa estilo "tamaño carta" (Letter: 8.5in x 11in) usando tailwind (approx en px)
export function PrescriptionPreview({
  pacienteNombre,
  diagnostico,
  medicamentos,
  observaciones,
  medico = 'Dr. (Nombre)',
  fecha
}: PrescriptionPreviewProps) {
  return (
    <div className="w-full">
      {/* Contenedor responsivo: no se sale del ancho disponible; en impresión usa tamaño carta exacto */}
      <div className="mx-auto bg-white shadow-2xl rounded-lg border border-gray-200 print:shadow-none print:border-0 w-full max-w-[816px] print:w-[816px] overflow-hidden">
        <div className="text-gray-800 text-sm leading-relaxed font-serif p-6 sm:p-8 md:p-10 print:p-10">
          <header className="pb-4 mb-4 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-wide">RECETA MÉDICA</h1>
                <p className="text-xs mt-1">Emitida: {fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold">{medico}</p>
                <p>Céd. Prof. 0000000</p>
                <p>Clínica Demo</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p><span className="font-semibold">Paciente:</span> {pacienteNombre}</p>
              </div>
              <div>
                <p><span className="font-semibold">ID:</span> {pacienteNombre.split(' ').slice(0,2).join('').toUpperCase()}-{fecha.getTime().toString().slice(-4)}</p>
              </div>
            </div>
          </header>

          <section className="mb-6">
            <h2 className="text-sm font-bold mb-2 tracking-wide">DIAGNÓSTICO</h2>
            <div className="whitespace-pre-wrap border border-gray-300 rounded-md p-3 bg-gray-50 text-[13px] min-h-[60px]">
              {diagnostico || '—'}
            </div>
          </section>

            <section className="mb-6">
              <h2 className="text-sm font-bold mb-2 tracking-wide">INDICACIÓN TERAPÉUTICA</h2>
              {medicamentos.length === 0 && (
                <p className="text-gray-500 italic text-xs">Sin medicamentos agregados aún.</p>
              )}
              <ol className="list-decimal list-inside space-y-4">
                {medicamentos.map(m => (
                  <li key={m.index} className="pl-1">
                    <p className="font-semibold text-[13px]"><span className="uppercase">{m.nombre}</span> {m.concentracion}</p>
                    <p className="text-[12px]">Dosis: {m.dosis || '—'} | Frecuencia: {m.frecuencia || '—'} | Duración: {m.duracion || '—'} | Vía: {m.via_administracion}</p>
                    {m.indicaciones && <p className="text-[12px] mt-1 italic">Indicaciones: {m.indicaciones}</p>}
                  </li>
                ))}
              </ol>
            </section>

          {observaciones && (
            <section className="mb-8">
              <h2 className="text-sm font-bold mb-2 tracking-wide">OBSERVACIONES</h2>
              <div className="whitespace-pre-wrap border border-gray-300 rounded-md p-3 bg-gray-50 text-[12px]">
                {observaciones}
              </div>
            </section>
          )}

          <footer className="pt-8 mt-8 border-t border-gray-300">
            <div className="flex justify-between text-xs">
              <div>
                <p className="font-semibold">{medico}</p>
                <p>Céd. Prof. 0000000</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Firma Digital</p>
                <p className="text-[10px]">Generada automáticamente</p>
              </div>
            </div>
            <p className="mt-6 text-[10px] text-gray-500 leading-snug">Esta receta es válida únicamente para fines demostrativos. Todas las indicaciones deben ser corroboradas clínicamente. Prohibida su venta o distribución no autorizada.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
