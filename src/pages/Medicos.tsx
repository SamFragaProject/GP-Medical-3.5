import React from 'react'

export default function Medicos() {
  return (
    <div className="p-6">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold">Personal Médico</h1>
        <p className="text-sm text-slate-600">
          Este módulo está preparado en el menú/roles, pero aún no está implementado por completo.
        </p>
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="font-medium">Sugerencia de siguiente paso</p>
          <p className="text-slate-600 mt-1">
            Convertir este módulo en un flujo real (no solo una pantalla) y conectar sus permisos a RLS.
          </p>
        </div>
      </div>
    </div>
  )
}
