import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Trash2
} from 'lucide-react'
import { Proveedor } from '@/types/compras'
import { comprasService } from '@/services/comprasService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export function ComponenteProveedores() {
  const { user } = useAuth()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null)
  const [vistaActual, setVistaActual] = useState<'proveedores' | 'cotizaciones'>('proveedores')

  const loadProveedores = async () => {
    if (user?.empresa_id) {
      setLoading(true)
      try {
        const data = await comprasService.getProveedores(user.empresa_id)
        setProveedores(data)
      } catch (error) {
        console.error(error)
        toast.error('Error cargando proveedores')
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadProveedores()
  }, [user?.empresa_id])

  const handleSaveProveedor = async (data: Partial<Proveedor>) => {
    try {
      if (proveedorSeleccionado) {
        await comprasService.updateProveedor(proveedorSeleccionado.id, data)
        toast.success('Proveedor actualizado')
      } else {
        await comprasService.createProveedor({ ...data, empresa_id: user?.empresa_id })
        toast.success('Proveedor creado')
      }
      setMostrarFormulario(false)
      setProveedorSeleccionado(null)
      loadProveedores()
    } catch (error) {
      toast.error('Error al guardar proveedor')
      console.error(error)
    }
  }

  const TarjetaProveedor = ({ proveedor }: { proveedor: Proveedor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Building className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre_comercial}</h3>
            <p className="text-sm text-gray-600">{proveedor.contacto_nombre || 'Sin contacto'}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proveedor.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
          {proveedor.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center text-gray-600">
          <Phone size={14} className="mr-2" />
          <span>{proveedor.contacto_telefono || 'N/A'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mail size={14} className="mr-2" />
          <span>{proveedor.contacto_email || 'N/A'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin size={14} className="mr-2" />
          <span className="text-xs truncate max-w-[200px]">{proveedor.direccion || 'Sin dirección'}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
        <button
          onClick={() => {
            setProveedorSeleccionado(proveedor)
            setMostrarFormulario(true)
          }}
          className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex items-center space-x-1"
        >
          <Edit size={14} />
          <span>Editar</span>
        </button>
      </div>
    </motion.div>
  )

  const FormularioProveedor = () => {
    const [formData, setFormData] = useState<Partial<Proveedor>>(proveedorSeleccionado || {
      nombre_comercial: '',
      rfc: '',
      contacto_nombre: '',
      contacto_telefono: '',
      contacto_email: '',
      direccion: '',
      dias_credito: 0,
      activo: true
    })

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {proveedorSeleccionado ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial</label>
                <input
                  type="text"
                  value={formData.nombre_comercial}
                  onChange={e => setFormData({ ...formData, nombre_comercial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RFC</label>
                <input
                  type="text"
                  value={formData.rfc || ''}
                  onChange={e => setFormData({ ...formData, rfc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="RFC"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
                <input
                  type="text"
                  value={formData.contacto_nombre || ''}
                  onChange={e => setFormData({ ...formData, contacto_nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nombre contacto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.contacto_telefono || ''}
                  onChange={e => setFormData({ ...formData, contacto_telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.contacto_email || ''}
                onChange={e => setFormData({ ...formData, contacto_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <textarea
                rows={2}
                value={formData.direccion || ''}
                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Días Crédito</label>
                <input
                  type="number"
                  value={formData.dias_credito || 0}
                  onChange={e => setFormData({ ...formData, dias_credito: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={formData.activo ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setMostrarFormulario(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSaveProveedor(formData)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proveedores</h2>
          <p className="text-gray-500 mt-1">Gestión de cadena de suministro</p>
        </div>
        <button
          onClick={() => {
            setProveedorSeleccionado(null)
            setMostrarFormulario(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando proveedores...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{proveedores.length}</p>
            </div>
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-emerald-600">{proveedores.filter(p => p.activo).length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proveedores.map(proveedor => (
              <TarjetaProveedor key={proveedor.id} proveedor={proveedor} />
            ))}
            {proveedores.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay proveedores registrados</p>
              </div>
            )}
          </div>
        </>
      )}

      {mostrarFormulario && <FormularioProveedor />}
    </div>
  )
}
