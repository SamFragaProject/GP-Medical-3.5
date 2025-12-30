import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  UserX,
  Building2,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth'
import type { UserRole } from '@/types/auth'

interface Usuario {
  id: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  rol: UserRole
  empresa: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  foto_url?: string
  telefono?: string
  last_login?: string
  created_at: string
}

// Mock data
const USUARIOS_DEMO: Usuario[] = [
  {
    id: '1',
    nombre: 'Roberto',
    apellido_paterno: 'Pérez',
    apellido_materno: 'Sánchez',
    email: 'roberto.perez@mediflow.mx',
    rol: 'medico',
    empresa: 'TechCorp México',
    estado: 'activo',
    telefono: '55-1234-5678',
    last_login: '2024-11-25 10:30',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Ana',
    apellido_paterno: 'Martínez',
    apellido_materno: 'López',
    email: 'ana.martinez@techcorp.mx',
    rol: 'admin_empresa',
    empresa: 'TechCorp México',
    estado: 'activo',
    telefono: '55-9876-5432',
    last_login: '2024-11-25 09:15',
    created_at: '2024-02-20'
  },
  {
    id: '3',
    nombre: 'Pedro',
    apellido_paterno: 'González',
    apellido_materno: 'Ramírez',
    email: 'pedro.gonzalez@delta.mx',
    rol: 'medico',
    empresa: 'Constructora Delta',
    estado: 'inactivo',
    telefono: '81-5555-1234',
    last_login: '2024-11-20 14:45',
    created_at: '2023-11-10'
  },
  {
    id: '4',
    nombre: 'María',
    apellido_paterno: 'Rodríguez',
    apellido_materno: 'Fernández',
    email: 'maria.rodriguez@mediflow.mx',
    rol: 'super_admin',
    empresa: 'MediFlow',
    estado: 'activo',
    telefono: '55-7777-8888',
    last_login: '2024-11-25 11:00',
    created_at: '2023-01-01'
  },
  {
    id: '5',
    nombre: 'Carlos',
    apellido_paterno: 'Hernández',
    apellido_materno: 'García',
    email: 'carlos.hernandez@paciente.mx',
    rol: 'paciente',
    empresa: 'TechCorp México',
    estado: 'activo',
    telefono: '55-3333-4444',
    last_login: '2024-11-24 16:20',
    created_at: '2024-03-15'
  }
]

const ESTADO_COLORS = {
  activo: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  inactivo: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
  suspendido: { bg: 'bg-red-100', text: 'text-red-700', icon: UserX }
}

export function UsuariosEmpresa() {
  const { user, hasPermission } = useAuth()
  const [usuarios] = useState<Usuario[]>(USUARIOS_DEMO)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRol, setFilterRol] = useState<'all' | UserRole>('all')
  const [filterEstado, setFilterEstado] = useState<'all' | 'activo' | 'inactivo' | 'suspendido'>('all')

  if (!user) return null

  const canManage = hasPermission('usuarios', 'update')

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellido_paterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRol = filterRol === 'all' || u.rol === filterRol
    const matchesEstado = filterEstado === 'all' || u.estado === filterEstado
    return matchesSearch && matchesRol && matchesEstado
  })

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
    suspendidos: usuarios.filter(u => u.estado === 'suspendido').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestión de usuarios del sistema - {usuarios.length} total</p>
        </div>
        {canManage && (
          <Button className="bg-primary hover:bg-primary/90 text-gray-900 shadow-lg shadow-primary/25 rounded-xl px-6 transition-all hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Permission Warning */}
      {!canManage && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Tu rol ({ROLE_LABELS[user.rol]}) solo permite visualización de usuarios. No puedes editar ni eliminar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Activos', value: stats.activos, icon: CheckCircle, color: 'emerald' },
          { label: 'Inactivos', value: stats.inactivos, icon: XCircle, color: 'gray' },
          { label: 'Suspendidos', value: stats.suspendidos, icon: UserX, color: 'red' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Rol:</span>
              <Button
                variant={filterRol === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRol('all')}
                className="rounded-lg text-xs"
              >
                Todos
              </Button>
              {(['super_admin', 'admin_empresa', 'medico', 'paciente'] as UserRole[]).map(rol => (
                <Button
                  key={rol}
                  variant={filterRol === rol ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterRol(rol)}
                  className="rounded-lg text-xs"
                >
                  {ROLE_LABELS[rol]}
                </Button>
              ))}
            </div>

            <div className="w-px h-8 bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Estado:</span>
              <Button
                variant={filterEstado === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterEstado('all')}
                className="rounded-lg text-xs"
              >
                Todos
              </Button>
              <Button
                variant={filterEstado === 'activo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterEstado('activo')}
                className="rounded-lg text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Activos
              </Button>
              <Button
                variant={filterEstado === 'inactivo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterEstado('inactivo')}
                className="rounded-lg text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Inactivos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredUsuarios.map((usuario, index) => {
            const EstadoIcon = ESTADO_COLORS[usuario.estado].icon
            const estadoColor = ESTADO_COLORS[usuario.estado]

            return (
              <motion.div
                key={usuario.id}
                layoutId={`usuario-${usuario.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-none shadow-md hover:shadow-lg transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={usuario.foto_url} />
                        <AvatarFallback className={`${ROLE_COLORS[usuario.rol]} text-white font-bold text-lg`}>
                          {usuario.nombre[0]}{usuario.apellido_paterno[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {usuario.nombre} {usuario.apellido_paterno}
                        </CardTitle>
                        <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`text-xs ${ROLE_COLORS[usuario.rol]} text-white border-0`}>
                            {ROLE_LABELS[usuario.rol]}
                          </Badge>
                          <Badge className={`text-xs ${estadoColor.bg} ${estadoColor.text} flex items-center gap-1`}>
                            <EstadoIcon className="w-3 h-3" />
                            {usuario.estado}
                          </Badge>
                        </div>
                      </div>
                      {canManage && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{usuario.empresa}</span>
                      </div>
                      {usuario.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{usuario.telefono}</span>
                        </div>
                      )}
                      {usuario.last_login && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>Último acceso: {usuario.last_login}</span>
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div className="pt-3 border-t border-gray-100 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs hover:text-blue-600 hover:border-blue-300">
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs text-red-600 hover:bg-red-50 hover:border-red-300">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  )
}
