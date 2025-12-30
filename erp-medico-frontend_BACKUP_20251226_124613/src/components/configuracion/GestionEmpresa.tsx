// Gestión de Empresa y Sedes
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save,
  Upload,
  Star,
  Home,
  Crown,
  Users
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Empresa, Sede } from '@/types/configuracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface SedeFormData {
  name: string
  address: {
    street: string
    number: string
    colony: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  phone: string
  manager: string
  isMain: boolean
}

function EmpresaForm({ empresa, onSave }: { 
  empresa?: Empresa
  onSave: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    name: empresa?.name || '',
    legalName: empresa?.legalName || '',
    rfc: empresa?.rfc || '',
    address: {
      street: empresa?.address.street || '',
      number: empresa?.address.number || '',
      colony: empresa?.address.colony || '',
      city: empresa?.address.city || '',
      state: empresa?.address.state || '',
      country: empresa?.address.country || 'México',
      zipCode: empresa?.address.zipCode || ''
    },
    phone: empresa?.phone || '',
    email: empresa?.email || '',
    website: empresa?.website || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.legalName || !formData.rfc) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre comercial *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="MediFlow"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razón social *
          </label>
          <Input
            value={formData.legalName}
            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
            placeholder="MediFlow Sistemas Médicos S.A. de C.V."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RFC *
          </label>
          <Input
            value={formData.rfc}
            onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
            placeholder="MSM123456ABC"
            maxLength={13}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+52 55 1234 5678"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contacto@mediflow.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sitio web
          </label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.mediflow.com"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección fiscal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calle
            </label>
            <Input
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              placeholder="Av. Insurgentes Sur"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <Input
              value={formData.address.number}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, number: e.target.value }
              })}
              placeholder="1234"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colonia
            </label>
            <Input
              value={formData.address.colony}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, colony: e.target.value }
              })}
              placeholder="Del Valle"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <Input
              value={formData.address.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
              placeholder="Ciudad de México"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <Input
              value={formData.address.state}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, state: e.target.value }
              })}
              placeholder="CDMX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código postal
            </label>
            <Input
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, zipCode: e.target.value }
              })}
              placeholder="03100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" className="flex items-center space-x-2">
          <Save size={16} />
          <span>Guardar información</span>
        </Button>
      </div>
    </form>
  )
}

function SedeForm({ sede, onSave, onCancel }: { 
  sede?: Sede
  onSave: (data: SedeFormData) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<SedeFormData>({
    name: sede?.name || '',
    address: sede?.address || {
      street: '',
      number: '',
      colony: '',
      city: '',
      state: '',
      country: 'México',
      zipCode: ''
    },
    phone: sede?.phone || '',
    manager: sede?.manager || '',
    isMain: sede?.isMain ?? false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.manager) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la sede *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Sede Principal"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsable *
          </label>
          <Input
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            placeholder="Dr. Carlos Mendoza"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+52 55 1234 5678"
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isMain"
            checked={formData.isMain}
            onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isMain" className="ml-2 text-sm text-gray-700">
            Sede principal
          </label>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección de la sede</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calle
            </label>
            <Input
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              placeholder="Av. Insurgentes Sur"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <Input
              value={formData.address.number}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, number: e.target.value }
              })}
              placeholder="1234"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colonia
            </label>
            <Input
              value={formData.address.colony}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, colony: e.target.value }
              })}
              placeholder="Del Valle"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <Input
              value={formData.address.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
              placeholder="Ciudad de México"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <Input
              value={formData.address.state}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, state: e.target.value }
              })}
              placeholder="CDMX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código postal
            </label>
            <Input
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, zipCode: e.target.value }
              })}
              placeholder="03100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {sede ? 'Actualizar' : 'Crear'} Sede
        </Button>
      </div>
    </form>
  )
}

export function GestionEmpresa() {
  const { settings, updateEmpresa } = useConfiguracion()
  const [vistaActiva, setVistaActiva] = useState<'empresa' | 'sedes'>('empresa')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'edit-empresa' | 'create-sede' | 'edit-sede'>('edit-empresa')
  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede | null>(null)

  const handleGuardarEmpresa = (data: any) => {
    updateEmpresa(data)
    setShowModal(false)
  }

  const handleCrearSede = () => {
    setModalType('create-sede')
    setSedeSeleccionada(null)
    setShowModal(true)
  }

  const handleEditarSede = (sede: Sede) => {
    setModalType('edit-sede')
    setSedeSeleccionada(sede)
    setShowModal(true)
  }

  const handleGuardarSede = (data: SedeFormData) => {
    // Aquí se implementaría la lógica para crear/actualizar sedes
    console.log('Guardar sede:', data)
    setShowModal(false)
    toast.success('Sede guardada exitosamente')
  }

  const renderModal = () => {
    if (!showModal) return null

    return (
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {modalType === 'edit-empresa' ? 'Editar Información de Empresa' : 
               modalType === 'create-sede' ? 'Crear Nueva Sede' : 'Editar Sede'}
            </h2>
            {modalType === 'edit-empresa' ? (
              <EmpresaForm
                empresa={settings.empresa}
                onSave={handleGuardarEmpresa}
              />
            ) : (
              <SedeForm
                sede={modalType === 'edit-sede' ? sedeSeleccionada : undefined}
                onSave={handleGuardarSede}
                onCancel={() => setShowModal(false)}
              />
            )}
          </Card>
        </div>
      </Dialog>
    )
  }

  const sedesActivas = settings.sedes.filter(s => s.isActive)
  const sedesInactivas = settings.sedes.filter(s => !s.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresa y Sedes</h1>
          <p className="text-gray-600 mt-1">
            Configura la información corporativa y gestiona las ubicaciones
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setVistaActiva('empresa')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'empresa'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Información de Empresa
          </button>
          <button
            onClick={() => setVistaActiva('sedes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'sedes'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sedes ({settings.sedes.length})
          </button>
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {vistaActiva === 'empresa' ? (
          <motion.div
            key="empresa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Información de la empresa */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{settings.empresa.name}</h2>
                    <p className="text-gray-600">{settings.empresa.legalName}</p>
                  </div>
                </div>
                <Button onClick={() => {
                  setModalType('edit-empresa')
                  setShowModal(true)
                }} className="flex items-center space-x-2">
                  <Edit size={16} />
                  <span>Editar</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Información General</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">RFC:</span>
                        <span className="font-medium">{settings.empresa.rfc}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium">{settings.empresa.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{settings.empresa.email}</span>
                      </div>
                      {settings.empresa.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Sitio web:</span>
                          <a 
                            href={settings.empresa.website} 
                            className="font-medium text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {settings.empresa.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">Dirección Fiscal</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {settings.empresa.address.street} {settings.empresa.address.number}
                        </p>
                        <p className="text-gray-600">
                          Col. {settings.empresa.address.colony}
                        </p>
                        <p className="text-gray-600">
                          {settings.empresa.address.city}, {settings.empresa.address.state}
                        </p>
                        <p className="text-gray-600">
                          C.P. {settings.empresa.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="sedes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Controles */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Ubicaciones y Sedes
              </h2>
              <Button onClick={handleCrearSede} className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Nueva Sede</span>
              </Button>
            </div>

            {/* Sedes activas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sedes Activas ({sedesActivas.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sedesActivas.map((sede) => (
                  <Card key={sede.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          sede.isMain ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {sede.isMain ? <Crown size={20} /> : <Building size={20} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{sede.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {sede.isMain && (
                              <Badge className="bg-primary text-white">
                                <Crown size={12} className="mr-1" />
                                Principal
                              </Badge>
                            )}
                            <Badge variant="outline">Activa</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarSede(sede)}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {sede.address.street} {sede.address.number}, {sede.address.colony}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{sede.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Responsable: {sede.manager}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        Creada: {sede.createdAt.toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarSede(sede)}
                      >
                        Gestionar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sedes inactivas */}
            {sedesInactivas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sedes Inactivas ({sedesInactivas.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sedesInactivas.map((sede) => (
                    <Card key={sede.id} className="p-6 bg-gray-50 opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gray-200 text-gray-500">
                            <Building size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{sede.name}</h3>
                            <Badge variant="secondary">Inactiva</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarSede(sede)}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {sede.address.street} {sede.address.number}, {sede.address.colony}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{sede.phone}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {settings.sedes.length === 0 && (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No hay sedes registradas</p>
                <Button onClick={handleCrearSede} className="mt-4">
                  Crear primera sede
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {renderModal()}
    </div>
  )
}