import React, { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/hooks/usePreferences'
import { ROLE_LABELS } from '@/types/auth'
import {
  Settings, Users, Building2, Sliders, Shield, LayoutDashboard,
  Eye, EyeOff, Moon, Sun, Monitor, Type, Languages, Bell, Save, CreditCard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { BillingConfig } from '@/components/billing/BillingConfig'

interface TabDef { key: string; label: string; icon: React.ElementType; requireResource?: string }

export function Configuracion() {
  const { user, checkPermission } = useAuth()
  const { prefs, loaded, updatePreferences, toggleWidget } = usePreferences(user)
  const [active, setActive] = useState('cuenta')

  const tabs = useMemo<TabDef[]>(() => {
    if (!user) return []
    const base: TabDef[] = [
      { key: 'cuenta', label: 'Mi Cuenta', icon: Shield },
      { key: 'preferencias', label: 'Interfaz y Tema', icon: Sliders },
    ]
    if (user.rol === 'admin_empresa') {
      base.push({ key: 'empresa', label: 'Mi Empresa', icon: Building2, requireResource: 'empresas' })
      base.push({ key: 'usuarios', label: 'Usuarios', icon: Users, requireResource: 'usuarios' })
    }
    if (user.rol === 'super_admin') {
      base.push({ key: 'empresas', label: 'Gestión Empresas', icon: Building2, requireResource: 'empresas' })
      base.push({ key: 'sistema', label: 'Sistema Global', icon: Settings, requireResource: 'sistema' })
    }
    if (user.rol === 'admin_empresa' || user.rol === 'super_admin') {
      base.push({ key: 'billing_saas', label: 'Facturación y Plan', icon: CreditCard, requireResource: 'configuracion' })
    }
    return base.filter(t => !t.requireResource || checkPermission(t.requireResource, 'read'))
  }, [user, checkPermission])

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <PremiumPageHeader
          title="Consola de Configuración"
          subtitle={`Personalización de entorno y parámetros globales. Rol: ${ROLE_LABELS[user.rol]}`}
          icon={Settings}
          badge="ENV: PRODUCTION"
        />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar de Navegación */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sticky top-24">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = active === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200
                      ${isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Área de Contenido */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {active === 'cuenta' && (
                  <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
                    <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
                    </div>
                    <div className="px-8 pb-8">
                      <div className="relative flex items-end -mt-12 mb-6">
                        <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg">
                          <div className="h-full w-full rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
                            {user.nombre.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4 mb-1">
                          <h2 className="text-2xl font-bold text-slate-900">{user.nombre} {user.apellido_paterno}</h2>
                          <p className="text-slate-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Información Personal</h3>
                          <div className="grid gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <label className="text-xs font-medium text-slate-500">ID de Usuario</label>
                              <p className="text-sm font-medium text-slate-900 mt-1">{user.id}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <label className="text-xs font-medium text-slate-500">Rol del Sistema</label>
                              <div className="mt-1">
                                <Badge className="bg-slate-900">{ROLE_LABELS[user.rol]}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Seguridad</h3>
                          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-900">Contraseña</p>
                                <p className="text-xs text-slate-500">Último cambio hace 3 meses</p>
                              </div>
                              <Button variant="outline" size="sm">Cambiar</Button>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <div>
                                <p className="font-medium text-slate-900">Autenticación 2FA</p>
                                <p className="text-xs text-slate-500">Aumenta la seguridad de tu cuenta</p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {active === 'preferencias' && (
                  <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-tight">
                          <Monitor className="w-5 h-5 text-emerald-500" />
                          Apariencia
                        </CardTitle>
                        <CardDescription className="font-medium">Personaliza cómo se ve la aplicación en tu dispositivo</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">

                        <div className="grid sm:grid-cols-3 gap-4">
                          {[
                            { id: 'light', label: 'Claro', icon: Sun },
                            { id: 'dark', label: 'Oscuro', icon: Moon },
                            { id: 'system', label: 'Sistema', icon: Monitor }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => updatePreferences('theme', theme.id as any)}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                                ${prefs.theme === theme.id
                                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-inner'
                                  : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200'
                                }`}
                            >
                              <theme.icon className={`w-6 h-6 mb-2 ${prefs.theme === theme.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className="text-xs font-black uppercase tracking-widest">{theme.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Densidad de la Interfaz</Label>
                              <div className="flex gap-2">
                                {['comfortable', 'compact'].map(d => (
                                  <button
                                    key={d}
                                    onClick={() => updatePreferences('sidebarDensity', d as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                                        ${prefs.sidebarDensity === d
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                  >
                                    {d === 'comfortable' ? 'Cómoda' : 'Compacta'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Idioma</Label>
                              <div className="flex gap-2">
                                {['es', 'en'].map(lang => (
                                  <button
                                    key={lang}
                                    onClick={() => updatePreferences('language', lang as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                                        ${prefs.language === lang
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                  >
                                    {lang === 'es' ? 'Español' : 'English'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LayoutDashboard className="w-5 h-5 text-brand-600" />
                          Personalización del Dashboard
                        </CardTitle>
                        <CardDescription>Elige qué widgets quieres ver en tu pantalla principal</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { id: 'pacientes', label: 'Resumen Pacientes' },
                            { id: 'citas', label: 'Próximas Citas' },
                            { id: 'examenes', label: 'Exámenes Recientes' },
                            { id: 'ingresos', label: 'Gráfica Ingresos' },
                            { id: 'alertas', label: 'Alertas Sistema' },
                            { id: 'satisfaccion', label: 'Satisfacción' }
                          ].map(w => {
                            const isActive = prefs.dashboardWidgets.includes(w.id)
                            return (
                              <div
                                key={w.id}
                                onClick={() => toggleWidget(w.id)}
                                className={`cursor-pointer group flex items-center justify-between p-4 rounded-xl border transition-all
                                  ${isActive
                                    ? 'border-brand-200 bg-brand-50/50'
                                    : 'border-slate-100 bg-white hover:border-slate-300'
                                  }`}
                              >
                                <span className={`text-sm font-medium ${isActive ? 'text-brand-700' : 'text-slate-600'}`}>
                                  {w.label}
                                </span>
                                {isActive
                                  ? <Eye className="w-4 h-4 text-brand-600" />
                                  : <EyeOff className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                                }
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {active === 'usuarios' && user.rol === 'admin_empresa' && (
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Usuarios de la Empresa</CardTitle>
                          <CardDescription>Gestiona el acceso de tu personal (Modo Demo)</CardDescription>
                        </div>
                        <Button>
                          <Users className="w-4 h-4 mr-2" />
                          Nuevo Usuario
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                              <th className="px-6 py-4">Usuario</th>
                              <th className="px-6 py-4">Rol</th>
                              <th className="px-6 py-4">Estado</th>
                              <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {[
                              { id: 'u1', nombre: 'Dr. Roberto Pérez', email: 'roberto@GPMedical.com', rol: 'medico', estado: 'activo' },
                              { id: 'u2', nombre: 'Ana Asistente', email: 'ana@GPMedical.com', rol: 'asistente', estado: 'activo' },
                              { id: 'u3', nombre: 'Pedro Médico', email: 'pedro@GPMedical.com', rol: 'medico', estado: 'inactivo' }
                            ].map(u => (
                              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="font-medium text-slate-900">{u.nombre}</p>
                                    <p className="text-xs text-slate-500">{u.email}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="capitalize">{u.rol}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${u.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {u.estado}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8">Editar</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {active === 'sistema' && user.rol === 'super_admin' && (
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Control del Sistema Global</CardTitle>
                      <CardDescription>Activar o desactivar módulos para toda la plataforma</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {['agenda', 'inventario', 'facturacion', 'ia', 'alertas', 'reportes'].map(m => (
                          <div key={m} className="flex items-start space-x-3 p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                            <Switch defaultChecked id={`module-${m}`} />
                            <div>
                              <label htmlFor={`module-${m}`} className="text-sm font-medium text-slate-900 capitalize cursor-pointer">
                                Módulo de {m}
                              </label>
                              <p className="text-xs text-slate-500 mt-1">Habilitar funciones de {m}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {active === 'billing_saas' && (
                  <BillingConfig />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
