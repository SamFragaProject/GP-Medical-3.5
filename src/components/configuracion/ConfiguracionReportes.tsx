// Configuración de Reportes
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  Settings,
  Plus,
  Edit,
  Eye
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export function ConfiguracionReportes() {
  const { settings } = useConfiguracion()

  const renderTemplates = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Plantillas de Reportes</h3>
            <p className="text-sm text-gray-600">Plantillas personalizables para diferentes tipos de reportes</p>
          </div>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Nueva Plantilla</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {settings.reportes.templates.map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                {template.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{template.type}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Formato: {template.format}
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye size={14} />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderSchedule = () => (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-500 p-3 rounded-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Programación Automática</h3>
          <p className="text-sm text-gray-600">Configura reportes automáticos periódicos</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Reporte Mensual</h4>
            <p className="text-sm text-gray-600">Generación automática cada mes</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">08:00</span>
            <Button variant="outline" size="sm">
              <Settings size={14} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Reporte Semanal</h4>
            <p className="text-sm text-gray-600">Generación automática cada lunes</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">09:00</span>
            <Button variant="outline" size="sm">
              <Settings size={14} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Reportes</h1>
        <p className="text-gray-600 mt-1">
          Gestiona plantillas, formatos y programación de reportes
        </p>
      </div>

      {/* Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-500 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
            <p className="text-sm text-gray-600">Ajustes por defecto para reportes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato por defecto
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programación automática
            </label>
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary" />
              <label className="ml-2 text-sm text-gray-700">Habilitado</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de generación
            </label>
            <Input type="time" defaultValue="08:00" />
          </div>
        </div>
      </Card>

      {/* Templates */}
      {renderTemplates()}

      {/* Schedule */}
      {renderSchedule()}
    </div>
  )
}
