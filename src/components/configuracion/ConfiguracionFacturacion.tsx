// Configuración de Facturación
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  Settings, 
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

function PacConfig() {
  const { settings, updateNotificaciones } = useConfiguracion()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState(settings.facturacion.pac)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se actualizaría la configuración del PAC
    toast.success('Configuración del PAC actualizada')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-500 p-3 rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración PAC</h3>
          <p className="text-sm text-gray-600">Proveedor Autorizado de Certificación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del PAC
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="PAC Principal"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <Input
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              placeholder="pac01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="testMode"
              checked={formData.testMode}
              onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="testMode" className="ml-2 text-sm text-gray-700">
              Modo de pruebas
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pacEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="pacEnabled" className="ml-2 text-sm text-gray-700">
              Habilitar facturación CFDI
            </label>
          </div>
          <Button type="submit" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Guardar</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

function TaxesConfig() {
  const { settings } = useConfiguracion()
  const [showModal, setShowModal] = useState(false)
  const [editTax, setEditTax] = useState<any>(null)

  const handleSaveTax = (taxData: any) => {
    console.log('Guardar impuesto:', taxData)
    setShowModal(false)
    toast.success('Impuesto guardado exitosamente')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 p-3 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Impuestos</h3>
            <p className="text-sm text-gray-600">IVA, IEPS y otros impuestos</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Agregar Impuesto</span>
        </Button>
      </div>

      <div className="space-y-3">
        {settings.facturacion.impuestos.map((impuesto) => (
          <div
            key={impuesto.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{impuesto.name}</h4>
                <p className="text-sm text-gray-600">{impuesto.rate}% {impuesto.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={impuesto.isActive ? 'default' : 'secondary'}>
                {impuesto.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
              <Button variant="outline" size="sm">
                <Edit size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PaymentMethodsConfig() {
  const { settings } = useConfiguracion()
  const [showModal, setShowModal] = useState(false)

  const handleSavePaymentMethod = (methodData: any) => {
    console.log('Guardar método de pago:', methodData)
    setShowModal(false)
    toast.success('Método de pago guardado exitosamente')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 p-3 rounded-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago</h3>
            <p className="text-sm text-gray-600">Formas de pago disponibles</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Agregar Método</span>
        </Button>
      </div>

      <div className="space-y-3">
        {settings.facturacion.metodosPago.map((metodo) => (
          <div
            key={metodo.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{metodo.name}</h4>
                <p className="text-sm text-gray-600">Código: {metodo.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={metodo.isActive ? 'default' : 'secondary'}>
                {metodo.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
              <Button variant="outline" size="sm">
                <Edit size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ConceptsConfig() {
  const { settings } = useConfiguracion()
  const [showModal, setShowModal] = useState(false)

  const handleSaveConcept = (conceptData: any) => {
    console.log('Guardar concepto:', conceptData)
    setShowModal(false)
    toast.success('Concepto guardado exitosamente')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conceptos de Facturación</h3>
            <p className="text-sm text-gray-600">Servicios y productos facturables</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Agregar Concepto</span>
        </Button>
      </div>

      <div className="space-y-3">
        {settings.facturacion.conceptosFacturacion.map((concepto) => (
          <div
            key={concepto.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{concepto.name}</h4>
                <p className="text-sm text-gray-600">{concepto.description}</p>
                <p className="text-xs text-gray-500">Código: {concepto.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">${concepto.unitPrice}</p>
                <p className="text-xs text-gray-500">por unidad</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={concepto.isActive ? 'default' : 'secondary'}>
                  {concepto.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
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
}

export function ConfiguracionFacturacion() {
  const { settings } = useConfiguracion()
  const [activeTab, setActiveTab] = useState<'pac' | 'taxes' | 'payments' | 'concepts'>('pac')

  const tabs = [
    {
      id: 'pac',
      name: 'PAC & CFDI',
      icon: FileText,
      description: 'Proveedor y certificación'
    },
    {
      id: 'taxes',
      name: 'Impuestos',
      icon: DollarSign,
      description: 'IVA, IEPS, etc.'
    },
    {
      id: 'payments',
      name: 'Métodos de Pago',
      icon: CreditCard,
      description: 'Formas de pago'
    },
    {
      id: 'concepts',
      name: 'Conceptos',
      icon: Settings,
      description: 'Servicios facturables'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'pac':
        return <PacConfig />
      case 'taxes':
        return <TaxesConfig />
      case 'payments':
        return <PaymentMethodsConfig />
      case 'concepts':
        return <ConceptsConfig />
      default:
        return <PacConfig />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Facturación</h1>
        <p className="text-gray-600 mt-1">
          Configura CFDI, PAC, impuestos y métodos de pago
        </p>
      </div>

      {/* Status Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-blue-900">
                Sistema de Facturación {settings.facturacion.pac.isEnabled ? 'Activo' : 'Inactivo'}
              </h2>
              <p className="text-blue-700">
                {settings.facturacion.pac.isEnabled 
                  ? 'El sistema puede generar y timbrar CFDI automáticamente'
                  : 'La facturación está deshabilitada'
                }
              </p>
            </div>
          </div>
          <Badge variant={settings.facturacion.pac.isEnabled ? 'default' : 'secondary'}>
            {settings.facturacion.pac.isEnabled ? 'Operativo' : 'Deshabilitado'}
          </Badge>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>

      {/* Help Card */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Información Importante</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Asegúrate de tener una certificación PAC vigente</li>
              <li>• Configura correctamente los impuestos según tu régimen fiscal</li>
              <li>• Los conceptos de facturación deben tener códigos SAT válidos</li>
              <li>• Prueba la integración antes de generar facturas reales</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
