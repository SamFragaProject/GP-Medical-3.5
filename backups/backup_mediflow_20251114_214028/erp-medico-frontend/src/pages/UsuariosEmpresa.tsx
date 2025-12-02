import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS } from '@/types/auth'

export function UsuariosEmpresa() {
  const { user, hasPermission } = useAuth()
  if (!user) return null
  const canManage = hasPermission('usuarios', 'update')

  const demo = [
    { id: 'u1', nombre: 'Dr. Roberto Pérez', rol: 'medico', estado: 'activo' },
    { id: 'u2', nombre: 'Ana Asistente', rol: 'asistente', estado: 'activo' },
    { id: 'u3', nombre: 'Pedro Médico', rol: 'medico', estado: 'inactivo' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-600">Gestión de usuarios dentro de tu empresa (demo)</p>
      </div>
      {!canManage && (
        <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-sm text-yellow-800">
          Tu rol ({ROLE_LABELS[user.rol]}) solo permite visualización de usuarios.
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Rol</th>
            <th className="py-2">Estado</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {demo.map(u => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="py-2">{u.nombre}</td>
              <td className="py-2 capitalize">{u.rol}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{u.estado}</span>
              </td>
              <td className="py-2 space-x-2">
                {canManage ? (
                  <>
                    <button className="text-xs px-2 py-1 rounded bg-primary text-white">Editar</button>
                    <button className="text-xs px-2 py-1 rounded bg-red-500 text-white">{u.estado === 'activo' ? 'Desactivar' : 'Activar'}</button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Sin permisos</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
