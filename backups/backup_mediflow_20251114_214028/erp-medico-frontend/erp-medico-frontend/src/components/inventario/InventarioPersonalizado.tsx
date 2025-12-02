// Inventario personalizado por rol de usuario
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Plus, 
  Eye, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Building,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'


interface ProductoInventario {
  id: string
  nombre: string
  categoria: string
  stock: number
  stockMinimo: number
  precio: number
  estado: 'disponible' | 'stock_bajo' | 'agotado'
  proveedor: string
  fechaVencimiento?: string
}

interface SolicitudProducto {
  id: string
  productoId: string
  productoNombre: string
  medico: string
  cantidad: number
  fechaSolicitud: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  motivo: string
}

export function InventarioPersonalizado() {
  const user = {
  id: 'demo-user',
  email: 'demo@mediflow.com',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'MediFlow Demo Corp' },
  sede: { nombre: 'Sede Principal' }
}

const hasRole = () => true
  const [activeTab, setActiveTab] = useState('vista')
  const [productos, setProductos] = useState<ProductoInventario[]>([])
  const [solicitudes, setSolicitudes] = useState<SolicitudProducto[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Datos simulados
  const productosMock: ProductoInventario[] = [
    {
      id: '1',
      nombre: 'Guantes de Látex',
      categoria: 'Consumibles',
      stock: 250,
      stockMinimo: 50,
      precio: 12.50,
      estado: 'disponible',
      proveedor: 'Medical Supply Co.',
      fechaVencimiento: '2026-12-15'
    },
    {
      id: '2',
      nombre: 'Jeringas 5ml',
      categoria: 'Consumibles',
      stock: 15,
      stockMinimo: 100,
      precio: 8.75,
      estado: 'stock_bajo',
      proveedor: 'Syringe Solutions',
      fechaVencimiento: '2025-08-20'
    },
    {
      id: '3',
      nombre: 'Estetoscopio Digital',
      categoria: 'Equipos',
      stock: 5,
      stockMinimo: 2,
      precio: 1250.00,
      estado: 'disponible',
      proveedor: 'MedTech Industries'
    },
    {
      id: '4',
      nombre: 'Mascarillas N95',
      categoria: 'Protección',
      stock: 0,
      stockMinimo: 200,
      precio: 25.00,
      estado: 'agotado',
      proveedor: 'Safety First Inc.'
    }
  ]

  const solicitudesMock: SolicitudProducto[] = [
    {
      id: '1',
      productoId: '2',
      productoNombre: 'Jeringas 5ml',
      medico: 'Dra. Luna Rivera',
      cantidad: 500,
      fechaSolicitud: '2025-11-03',
      estado: 'pendiente',
      motivo: 'Stock bajo para procedimientos diarios'
    },
    {
      id: '2',
      productoId: '4',
      productoNombre: 'Mascarillas N95',
      medico: 'Dr. Roberto Silva',
      cantidad: 100,
      fechaSolicitud: '2025-11-02',
      estado: 'pendiente',
      motivo: 'Necesarias para consulta con pacientes confirmados'
    }
  ]

  useEffect(() => {
    setProductos(productosMock)
    setSolicitudes(solicitudesMock)
  }, [])

  const handleSolicitarProducto = (productoId: string) => {
    // Simular envío de solicitud
    alert('Solicitud enviada al Super Admin')
  }

  const handleAprobarSolicitud = (solicitudId: string) => {
    // Simular aprobación
    setSolicitudes(prev => prev.map(s => 
      s.id === solicitudId ? { ...s, estado: 'aprobada' } : s
    ))
  }

  const handleRechazarSolicitud = (solicitudId: string) => {
    // Simular rechazo
    setSolicitudes(prev => prev.map(s => 
      s.id === solicitudId ? { ...s, estado: 'rechazada' } : s
    ))
  }

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canEdit = hasRole('super_admin')
  const canRequest = hasRole('medico_trabajo') || hasRole('medico_especialista') || hasRole('medico_industrial')
  const isViewOnly = hasRole('admin_empresa')
  const isSuperAdmin = hasRole('super_admin')

  // Vista solo para Admin Empresa
  if (isViewOnly) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Inventario Médico</h1>
          <p className="text-blue-100 mt-1">Vista de productos disponibles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold">{productos.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {productos.filter(p => p.estado === 'stock_bajo').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agotados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {productos.filter(p => p.estado === 'agotado').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Producto</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductos.map((producto) => (
                    <tr key={producto.id} className="border-b">
                      <td className="p-2 font-medium">{producto.nombre}</td>
                      <td className="p-2">{producto.categoria}</td>
                      <td className="p-2">{producto.stock}</td>
                      <td className="p-2">
                        <Badge variant={
                          producto.estado === 'disponible' ? 'default' :
                          producto.estado === 'stock_bajo' ? 'secondary' : 'destructive'
                        }>
                          {producto.estado}
                        </Badge>
                      </td>
                      <td className="p-2">${producto.precio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vista para médicos (ver + solicitar)
  if (canRequest) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Inventario Médico</h1>
          <p className="text-green-100 mt-1">Gestión de productos y solicitudes</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('vista')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'vista' ? 'bg-white text-green-600' : 'text-gray-600'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Ver Inventario
          </button>
          <button
            onClick={() => setActiveTab('solicitar')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'solicitar' ? 'bg-white text-green-600' : 'text-gray-600'
            }`}
          >
            <ShoppingCart className="h-4 w-4 inline mr-2" />
            Solicitar Productos
          </button>
        </div>

        {activeTab === 'vista' && (
          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProductos.map((producto) => (
                      <tr key={producto.id} className="border-b">
                        <td className="p-2 font-medium">{producto.nombre}</td>
                        <td className="p-2">{producto.categoria}</td>
                        <td className="p-2">{producto.stock}</td>
                        <td className="p-2">
                          <Badge variant={
                            producto.estado === 'disponible' ? 'default' :
                            producto.estado === 'stock_bajo' ? 'secondary' : 'destructive'
                          }>
                            {producto.estado}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button 
                            size="sm"
                            onClick={() => handleSolicitarProducto(producto.id)}
                            disabled={producto.stock === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Solicitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'solicitar' && (
          <Card>
            <CardHeader>
              <CardTitle>Nueva Solicitud</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto Requerido
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Seleccionar producto...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <Input type="number" placeholder="Cantidad" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgencia
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>Baja</option>
                      <option>Media</option>
                      <option>Alta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de la Solicitud
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md h-20"
                    placeholder="Explique por qué necesita este producto..."
                  />
                </div>
                <Button className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Enviar Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Vista para Super Admin (gestión completa)
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
          <p className="text-purple-100 mt-1">Administración completa y solicitudes pendientes</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('vista')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'vista' ? 'bg-white text-purple-600' : 'text-gray-600'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Productos
          </button>
          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === 'solicitudes' ? 'bg-white text-purple-600' : 'text-gray-600'
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Solicitudes ({solicitudes.filter(s => s.estado === 'pendiente').length})
          </button>
        </div>

        {activeTab === 'vista' && (
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Precio</th>
                      <th className="text-left p-2">Proveedor</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProductos.map((producto) => (
                      <tr key={producto.id} className="border-b">
                        <td className="p-2 font-medium">{producto.nombre}</td>
                        <td className="p-2">{producto.categoria}</td>
                        <td className="p-2">{producto.stock}</td>
                        <td className="p-2">
                          <Badge variant={
                            producto.estado === 'disponible' ? 'default' :
                            producto.estado === 'stock_bajo' ? 'secondary' : 'destructive'
                          }>
                            {producto.estado}
                          </Badge>
                        </td>
                        <td className="p-2">${producto.precio}</td>
                        <td className="p-2 text-sm">{producto.proveedor}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Editar</Button>
                            <Button size="sm" variant="outline">Agregar Stock</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'solicitudes' && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{solicitud.productoNombre}</h4>
                        <p className="text-sm text-gray-600">
                          Solicitado por: {solicitud.medico}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {solicitud.cantidad}
                        </p>
                      </div>
                      <Badge variant={
                        solicitud.estado === 'pendiente' ? 'secondary' :
                        solicitud.estado === 'aprobada' ? 'default' : 'destructive'
                      }>
                        {solicitud.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Motivo:</strong> {solicitud.motivo}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Fecha: {solicitud.fechaSolicitud}
                      </span>
                      {solicitud.estado === 'pendiente' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAprobarSolicitud(solicitud.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRechazarSolicitud(solicitud.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return <div>Acceso no autorizado</div>
}