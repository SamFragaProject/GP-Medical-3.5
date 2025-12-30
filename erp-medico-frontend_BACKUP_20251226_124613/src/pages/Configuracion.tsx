import React, { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/hooks/usePreferences'
import { ROLE_LABELS } from '@/types/auth'
import { Settings, Users, Building2, Sliders, Shield, LayoutDashboard, Eye, EyeOff } from 'lucide-react'

interface TabDef { key: string; label: string; icon: React.ElementType; requireResource?: string }

export function Configuracion() {
  const { user, hasPermission } = useAuth()
  const { prefs, loaded, updatePreferences, toggleWidget } = usePreferences(user)
  const [active, setActive] = useState('cuenta')

  const tabs = useMemo<TabDef[]>(() => {
    if (!user) return []
    const base: TabDef[] = [
      { key: 'cuenta', label: 'Cuenta', icon: Shield },
      { key: 'preferencias', label: 'Preferencias UI', icon: Sliders },
    ]
    if (user.rol === 'admin_empresa') {
      base.push({ key: 'empresa', label: 'Empresa', icon: Building2, requireResource: 'empresas' })
      base.push({ key: 'usuarios', label: 'Usuarios Empresa', icon: Users, requireResource: 'usuarios' })
    }
    if (user.rol === 'super_admin') {
      base.push({ key: 'empresas', label: 'Empresas', icon: Building2, requireResource: 'empresas' })
      base.push({ key: 'usuarios_global', label: 'Usuarios Globales', icon: Users, requireResource: 'usuarios' })
      base.push({ key: 'sistema', label: 'Sistema', icon: Settings, requireResource: 'sistema' })
    }
    return base.filter(t => !t.requireResource || hasPermission(t.requireResource, 'read'))
  }, [user, hasPermission])

  if (!user) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-600">Personaliza tu entorno y gestiona recursos según tu rol: {ROLE_LABELS[user.rol]}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isActive ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {active === 'cuenta' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Datos de la Cuenta</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Nombre</label>
                <p className="text-sm text-gray-900">{user.nombre} {user.apellido_paterno}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Correo</label>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Rol</label>
                <p className="text-sm capitalize">{ROLE_LABELS[user.rol]}</p>
              </div>
            </div>
          </div>
        )}

        {active === 'preferencias' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-900">Preferencias de Interfaz</h2>
            {!loaded && <p className="text-sm text-gray-500">Cargando preferencias...</p>}
            {loaded && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Tema */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Tema</label>
                    <div className="flex gap-2">
                      {['light','dark','system'].map(t => (
                        <button
                          key={t}
                          onClick={() => updatePreferences('theme', t as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${prefs.theme === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                  {/* Página inicial */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Página Inicial</label>
                    <select
                      value={prefs.startPage}
                      onChange={e => updatePreferences('startPage', e.target.value)}
                      className="w-full border-gray-300 rounded-lg text-sm"
                    >
                      <option value="/dashboard">Dashboard</option>
                      {hasPermission('citas','read') && <option value="/agenda">Agenda</option>}
                      {hasPermission('pacientes','read') && <option value="/pacientes">Pacientes</option>}
                      {user.rol === 'paciente' && <option value="/citas">Mis Citas</option>}
                    </select>
                  </div>
                  {/* Densidad sidebar */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Densidad Sidebar</label>
                    <div className="flex gap-2">
                      {['comfortable','compact'].map(d => (
                        <button
                          key={d}
                          onClick={() => updatePreferences('sidebarDensity', d as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${prefs.sidebarDensity === d ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  {/* Idioma */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Idioma</label>
                    <div className="flex gap-2">
                      {['es','en'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => updatePreferences('language', lang as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${prefs.language === lang ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                        >{lang.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Widgets Dashboard */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">Widgets del Dashboard</label>
                  <div className="flex flex-wrap gap-2">
                    {['pacientes','citas','examenes','ingresos','alertas','satisfaccion'].map(w => {
                      const activeW = prefs.dashboardWidgets.includes(w)
                      return (
                        <button
                          key={w}
                          onClick={() => toggleWidget(w)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${activeW ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          {activeW ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{w}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {active === 'usuarios' && user.rol === 'admin_empresa' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Usuarios de la Empresa (Demo)</h2>
            <p className="text-sm text-gray-600 mb-4">Gestión básica de médicos y asistentes (demo sin persistencia)</p>
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
                {[
                  { id: 'u1', nombre: 'Dr. Roberto Pérez', rol: 'medico', estado: 'activo' },
                  { id: 'u2', nombre: 'Ana Asistente', rol: 'asistente', estado: 'activo' },
                  { id: 'u3', nombre: 'Pedro Médico', rol: 'medico', estado: 'inactivo' }
                ].map(u => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.nombre}</td>
                    <td className="py-2 capitalize">{u.rol}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{u.estado}</span>
                    </td>
                    <td className="py-2 space-x-2">
                      <button className="text-xs px-2 py-1 rounded bg-primary text-white">Editar</button>
                      <button className="text-xs px-2 py-1 rounded bg-red-500 text-white">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'sistema' && user.rol === 'super_admin' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Control del Sistema</h2>
            <p className="text-sm text-gray-600">Activar/desactivar módulos globales (vista demo)</p>
            <div className="grid md:grid-cols-3 gap-4">
              {['agenda','inventario','facturacion','ia','alertas','reportes'].map(m => (
                <label key={m} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="capitalize">{m}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}