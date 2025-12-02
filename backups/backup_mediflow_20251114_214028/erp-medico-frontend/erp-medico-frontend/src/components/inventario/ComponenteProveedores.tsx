// Componente para gestión de proveedores y cotizaciones
import React, { useState } from 'react'
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
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  ShoppingCart
} from 'lucide-react'
import { Proveedor, Cotizacion } from '@/types/inventario'
import { useInventario } from '@/hooks/useInventario'
import toast from 'react-hot-toast'

export function ComponenteProveedores() {
  const { proveedores } = useInventario()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null)
  const [vistaActual, setVistaActual] = useState<'proveedores' | 'cotizaciones'>('proveedores')
  const [mostrarCotizacion, setMostrarCotizacion] = useState(false)

  // Simulación de cotizaciones
  const cotizacionesSimuladas: Cotizacion[] = [
    {
      id: '1',
      proveedorId: '1',
      numeroCotizacion: 'COT-2024-001',
      fechaCotizacion: new Date('2024-10-15'),
      fechaValidez: new Date('2024-10-30'),
      subtotal: 15000,
      impuesto: 2400,
      total: 17400,
      observaciones: 'Precios especiales por volumen',
      estado: 'enviada',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      proveedorId: '2',
      numeroCotizacion: 'COT-2024-002',
      fechaCotizacion: new Date('2024-10-20'),
      fechaValidez: new Date('2024-11-05'),
      subtotal: 25000,
      impuesto: 4000,
      total: 29000,
      observaciones: 'Incluye instalación y capacitación',
      estado: 'aceptada',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const obtenerEstadoCotizacion = (estado: string) => {
    const estados = {
      enviada: { color: 'bg-primary/10 text-primary', icono: Clock, texto: 'Enviada' },
      aceptada: { color: 'bg-success/10 text-success', icono: CheckCircle, texto: 'Aceptada' },
      rechazada: { color: 'bg-danger/10 text-danger', icono: AlertTriangle, texto: 'Rechazada' },
      vencida: { color: 'bg-gray/10 text-gray', icono: Clock, texto: 'Vencida' }
    }
    return estados[estado as keyof typeof estados] || estados.enviada
  }

  const renderEstrellas = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <Star
            key={estrella}
            size={16}
            className={`${
              estrella <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  const TarjetaProveedor = ({ proveedor }: { proveedor: Proveedor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre}</h3>
            <p className="text-sm text-gray-600">{proveedor.contacto}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          proveedor.activo ? 'bg-success/10 text-success' : 'bg-gray/10 text-gray'
        }`}>
          {proveedor.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center text-gray-600">
          <Phone size={14} className="mr-2" />
          <span>{proveedor.telefono}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mail size={14} className="mr-2" />
          <span>{proveedor.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin size={14} className="mr-2" />
          <span className="text-xs">{proveedor.direccion}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Calificación:</span>
          {renderEstrellas(proveedor.rating)}
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Entrega:</span>
            <p>{proveedor.diasEntregaPromedio} días</p>
          </div>
          <div>
            <span className="font-medium">Pago:</span>
            <p>{proveedor.condicionesPago}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
        <button
          onClick={() => {
            setProveedorSeleccionado(proveedor)
            setMostrarFormulario(true)
          }}
          className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center space-x-1"
        >
          <Edit size={14} />
          <span>Editar</span>
        </button>
        <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1">
          <Eye size={14} />
          <span>Ver</span>
        </button>
      </div>
    </motion.div>
  )

  const TarjetaCotizacion = ({ cotizacion }: { cotizacion: Cotizacion }) => {
    const estado = obtenerEstadoCotizacion(cotizacion.estado)
    const EstadoIcono = estado.icono
    const proveedor = proveedores.find(p => p.id === cotizacion.proveedorId)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{cotizacion.numeroCotizacion}</h3>
            <p className="text-sm text-gray-600">
              Proveedor: {proveedor?.nombre}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
            <EstadoIcono size={12} className="mr-1" />
            {estado.texto}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">Fecha Cotización:</span>
            <p>{new Date(cotizacion.fechaCotizacion).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Válida hasta:</span>
            <p>{new Date(cotizacion.fechaValidez).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Total:</span>
            <p className="text-lg font-bold text-gray-900">${cotizacion.total.toFixed(2)}</p>
          </div>
          <div>
            <span className="font-medium">Items:</span>
            <p>{cotizacion.items?.length || 0} productos</p>
          </div>
        </div>

        {cotizacion.observaciones && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <span className="text-xs text-gray-500">Observaciones:</span>
            <p className="text-sm text-gray-700 mt-1">{cotizacion.observaciones}</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setMostrarCotizacion(true)}
            className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center space-x-1"
          >
            <Eye size={14} />
            <span>Ver Detalle</span>
          </button>
          {cotizacion.estado === 'enviada' && (
            <>
              <button className="px-3 py-1.5 text-sm text-success hover:bg-success/10 rounded-md transition-colors flex items-center space-x-1">
                <CheckCircle size={14} />
                <span>Aceptar</span>
              </button>
              <button className="px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors flex items-center space-x-1">
                <AlertTriangle size={14} />
                <span>Rechazar</span>
              </button>
            </>
          )}
          {cotizacion.estado === 'aceptada' && (
            <button className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center space-x-1">
              <ShoppingCart size={14} />
              <span>Crear Orden</span>
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  const FormularioProveedor = () => (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                defaultValue={proveedorSeleccionado?.nombre}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RFC</label>
              <input
                type="text"
                defaultValue={proveedorSeleccionado?.rfc}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="RFC del proveedor"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contacto Principal</label>
              <input
                type="text"
                defaultValue={proveedorSeleccionado?.contacto}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                defaultValue={proveedorSeleccionado?.telefono}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Número de teléfono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={proveedorSeleccionado?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="correo@proveedor.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <textarea
              rows={3}
              defaultValue={proveedorSeleccionado?.direccion}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Dirección completa del proveedor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días de Entrega Promedio</label>
              <input
                type="number"
                defaultValue={proveedorSeleccionado?.diasEntregaPromedio}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condiciones de Pago</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="contado">Contado</option>
                <option value="15_dias">15 días</option>
                <option value="30_dias">30 días</option>
                <option value="45_dias">45 días</option>
                <option value="60_dias">60 días</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificado Sanitario</label>
              <input
                type="text"
                defaultValue={proveedorSeleccionado?.certificadoSanitario}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Número de certificado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => {
              setMostrarFormulario(false)
              setProveedorSeleccionado(null)
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              toast.success(proveedorSeleccionado ? 'Proveedor actualizado' : 'Proveedor creado')
              setMostrarFormulario(false)
              setProveedorSeleccionado(null)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {proveedorSeleccionado ? 'Actualizar' : 'Crear'} Proveedor
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Proveedores</h2>
          <p className="text-gray-600 mt-1">Administración de proveedores y cotizaciones</p>
        </div>
        <button
          onClick={() => {
            setProveedorSeleccionado(null)
            setMostrarFormulario(true)
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Navegación de vistas */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'proveedores', label: 'Proveedores', icon: Building },
          { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText }
        ].map(vista => (
          <button
            key={vista.id}
            onClick={() => setVistaActual(vista.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              vistaActual === vista.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <vista.icon size={16} />
            <span>{vista.label}</span>
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Proveedores</p>
              <p className="text-2xl font-bold text-gray-900">{proveedores.length}</p>
            </div>
            <Building className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-success">
                {proveedores.filter(p => p.activo).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cotizaciones</p>
              <p className="text-2xl font-bold text-gray-900">{cotizacionesSimuladas.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating Promedio</p>
              <p className="text-2xl font-bold text-warning">
                {(proveedores.reduce((acc, p) => acc + p.rating, 0) / proveedores.length).toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-warning" />
          </div>
        </div>
      </div>

      {/* Contenido según la vista */}
      {vistaActual === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proveedores.map(proveedor => (
            <TarjetaProveedor key={proveedor.id} proveedor={proveedor} />
          ))}
        </div>
      )}

      {vistaActual === 'cotizaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cotizacionesSimuladas.map(cotizacion => (
            <TarjetaCotizacion key={cotizacion.id} cotizacion={cotizacion} />
          ))}
        </div>
      )}

      {/* Modales */}
      {mostrarFormulario && <FormularioProveedor />}
      
      {mostrarCotizacion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalle de Cotización</h2>
                <button
                  onClick={() => setMostrarCotizacion(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">Detalle de cotización - Próximamente</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
