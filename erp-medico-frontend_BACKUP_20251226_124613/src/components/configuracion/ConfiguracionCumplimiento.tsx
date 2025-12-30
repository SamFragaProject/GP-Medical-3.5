// Configuración de Cumplimiento
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckSquare, 
  FileText, 
  Calendar,
  AlertTriangle,
  Clock,
  Users,
  Settings
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export function ConfiguracionCumplimiento() {
  const { settings } = useConfiguracion()
  const [formData, setFormData] = useState(settings.cumplimiento)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se actualizaría la configuración de cumplimiento
    toast.success('Configuración de cumplimiento actualizada')
  }

  const frequencies = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Cumplimiento</h1>
        <p className="text-gray-600 mt-1">
          Normativas, auditorías y compliance médico
        </p>
      </div>

      {/* Current Status */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-500 p-3 rounded-lg">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Estado de Cumplimiento</h3>
            <p className="text-green-700">Última auditoría completada exitosamente</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {settings.cumplimiento.normatives.filter(n => n.complianceRequired).length}
            </div>
            <div className="text-sm text-green-700">Normativas críticas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">98%</div>
            <div className="text-sm text-green-700">Nivel de cumplimiento</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {settings.cumplimiento.nextAudit ? 
                Math.ceil((settings.cumplimiento.nextAudit.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
              }d
            </div>
            <div className="text-sm text-green-700">Próxima auditoría</div>
          </div>
        </div>
      </Card>

      {/* Normatives */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Normativas y Regulaciones</h3>
              <p className="text-sm text-gray-600">Normativas aplicables al sistema</p>
            </div>
          </div>
          <Button className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Gestionar Normativas</span>
          </Button>
        </div>

        <div className="space-y-4">
          {settings.cumplimiento.normatives.map((normativa) => (
            <div
              key={normativa.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{normativa.name}</h4>
                  <p className="text-sm text-gray-600">{normativa.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <Badge variant="outline">{normativa.type}</Badge>
                    <span className="text-xs text-gray-500">
                      Última revisión: {normativa.lastReview.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={normativa.complianceRequired ? 'destructive' : 'secondary'}>
                  {normativa.complianceRequired ? 'Crítico' : 'Opcional'}
                </Badge>
                <Button variant="outline" size="sm">
                  Revisar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-500 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Auditorías</h3>
            <p className="text-sm text-gray-600">Programación y responsables de auditorías</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia de auditoría
              </label>
              <select
                value={formData.auditFrequency}
                onChange={(e) => setFormData({ ...formData, auditFrequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable de cumplimiento
              </label>
              <Input
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                placeholder="Dr. Carlos Mendoza"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Última auditoría
              </label>
              <Input
                type="date"
                value={formData.lastAudit?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lastAudit: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próxima auditoría
              </label>
              <Input
                type="date"
                value={formData.nextAudit?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  nextAudit: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>
          </div>

          <Button type="submit" className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Actualizar Configuración</span>
          </Button>
        </form>
      </Card>

      {/* Compliance Checklist */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-500 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lista de Verificación</h3>
            <p className="text-sm text-gray-600">Puntos clave de cumplimiento</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { item: 'Certificaciones médicas vigentes', completed: true },
            { item: 'Protocolos de seguridad actualizados', completed: true },
            { item: 'Capacitación del personal al día', completed: false },
            { item: 'Auditoría interna realizada', completed: true },
            { item: 'Documentación de procesos completa', completed: false }
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {item.completed && <CheckSquare className="h-3 w-3 text-white" />}
              </div>
              <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                {item.item}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}