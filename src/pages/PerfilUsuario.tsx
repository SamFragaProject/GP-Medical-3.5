import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, Phone, Calendar, Shield, Bell } from 'lucide-react'

export function PerfilUsuario() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">
          Administra tu información personal y configuraciones de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    DM
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Cambiar foto
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG o GIF. Máximo 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nombre completo
                  </label>
                  <Input defaultValue="Dr. Juan Pérez" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Número de empleado
                  </label>
                  <Input defaultValue="EMP-001" disabled />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Cédula profesional
                  </label>
                  <Input defaultValue="12345678" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Especialidad
                  </label>
                  <Input defaultValue="Medicina del Trabajo" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <Input type="email" defaultValue="doctor@GPMedical.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Teléfono
                  </label>
                  <Input defaultValue="+52 55 1234-5678" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Teléfono de emergencias
                  </label>
                  <Input defaultValue="+52 55 8765-4321" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha de nacimiento
                  </label>
                  <Input type="date" defaultValue="1980-05-15" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cambiar contraseña
                </label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Confirmar nueva contraseña
                </label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full">
                Actualizar Contraseña
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1">
              Guardar Cambios
            </Button>
            <Button variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Último acceso</span>
                <span className="text-sm">Hoy 08:30</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Miembro desde</span>
                <span className="text-sm">Enero 2024</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Push</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMS</span>
                <input type="checkbox" className="rounded" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rol y Permisos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline" className="w-full justify-center py-2">
                Médico Especialista
              </Badge>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  • Acceso completo a pacientes
                </div>
                <div className="text-sm text-gray-600">
                  • Crear y editar exámenes
                </div>
                <div className="text-sm text-gray-600">
                  • Generar reportes
                </div>
                <div className="text-sm text-gray-600">
                  • Configurar protocolos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
