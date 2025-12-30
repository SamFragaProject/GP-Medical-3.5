// Panel Administrativo para Gestión de Productos Farmacéuticos
import React, { useState, useEffect } from 'react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Camera,
  Star,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import {
  Producto,
  Stock,
  Proveedor,
  CategoriaInventario,
  TipoProducto,
  CategoriaProducto,
  EstadoStock,
  TIPOS_PRODUCTO,
  CATEGORIAS_MEDICAMENTOS,
  CATEGORIAS_EQUIPOS,
  CATEGORIAS_CONSUMIBLES,
  FiltrosInventario
} from '@/types/inventario'
import toast from 'react-hot-toast'

interface ProductoExtendido extends Producto {
  stock?: Stock
  proveedor?: Proveedor
  recomendado?: boolean
}

interface FormularioProductoData {
  codigo: string
  nombre: string
  descripcion: string
  tipo: TipoProducto
  categoria: CategoriaProducto
  unidadMedida: string
  precioUnitario: number
  proveedorId: string
  requiereReceta: boolean
  requiereFrio: boolean
  temperaturaMin?: number
  temperaturaMax?: number
  imagen?: string
  cantidadMinima: number
  cantidadMaxima: number
  ubicacion: string
  recomendado: boolean
}

const PanelAdminFarmacia: React.FC = () => {
  const user = {
    id: 'demo-user',
    email: 'demo@mediflow.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'MediFlow Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  }
  const hasHierarchyRole = () => true
  
  // Estados principales
  const [productos, setProductos] = useState<ProductoExtendido[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [categorias, setCategorias] = useState<CategoriaInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('productos')
  
  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<ProductoExtendido | null>(null)
  const [esNuevoProducto, setEsNuevoProducto] = useState(true)
  
  // Estados para paginación y filtros
  const [paginaActual, setPaginaActual] = useState(1)
  const [productosPorPagina] = useState(10)
  const [filtros, setFiltros] = useState<FiltrosInventario>({})
  const [busqueda, setBusqueda] = useState('')
  const [ordenamiento, setOrdenamiento] = useState<'nombre' | 'precio' | 'stock'>('nombre')
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc')
  
  // Estados para formulario
  const [formulario, setFormulario] = useState<FormularioProductoData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: 'medicamento',
    categoria: 'analgesicos',
    unidadMedida: '',
    precioUnitario: 0,
    proveedorId: '',
    requiereReceta: false,
    requiereFrio: false,
    cantidadMinima: 0,
    cantidadMaxima: 0,
    ubicacion: '',
    recomendado: false
  })
  
  // Verificación de permisos eliminada - acceso directo
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [])
  
  const cargarDatos = async () => {
    setLoading(true)
    try {
      // Aquí se cargarían los datos desde la API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular carga
      setProductos(datosEjemplo)
      setProveedores(proveedoresEjemplo)
      setCategorias(categoriasEjemplo)
    } catch (error) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }
  
  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter(producto => {
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             producto.codigo.toLowerCase().includes(busqueda.toLowerCase())
      
      const coincideFiltros = 
        (!filtros.tipo || producto.tipo === filtros.tipo) &&
        (!filtros.categoria || producto.categoria === filtros.categoria) &&
        (!filtros.proveedorId || producto.proveedorId === filtros.proveedorId) &&
        coincideBusqueda
      
      return coincideFiltros
    })
    .sort((a, b) => {
      let valorA: any, valorB: any
      
      switch (ordenamiento) {
        case 'precio':
          valorA = a.precioUnitario
          valorB = b.precioUnitario
          break
        case 'stock':
          valorA = a.stock?.cantidadActual || 0
          valorB = b.stock?.cantidadActual || 0
          break
        default:
          valorA = a.nombre
          valorB = b.nombre
      }
      
      if (direccionOrden === 'asc') {
        return valorA > valorB ? 1 : -1
      } else {
        return valorA < valorB ? 1 : -1
      }
    })
  
  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina)
  const indiceInicio = (paginaActual - 1) * productosPorPagina
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + productosPorPagina)
  
  // Manejar formulario
  const abrirModalNuevo = () => {
    setEsNuevoProducto(true)
    setProductoEditando(null)
    setFormulario({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: 'medicamento',
      categoria: 'analgesicos',
      unidadMedida: '',
      precioUnitario: 0,
      proveedorId: '',
      requiereReceta: false,
      requiereFrio: false,
      cantidadMinima: 0,
      cantidadMaxima: 0,
      ubicacion: '',
      recomendado: false
    })
    setModalAbierto(true)
  }
  
  const abrirModalEditar = (producto: ProductoExtendido) => {
    setEsNuevoProducto(false)
    setProductoEditando(producto)
    setFormulario({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      tipo: producto.tipo,
      categoria: producto.categoria,
      unidadMedida: producto.unidadMedida,
      precioUnitario: producto.precioUnitario,
      proveedorId: producto.proveedorId,
      requiereReceta: producto.requiereReceta,
      requiereFrio: producto.requiereFrio,
      temperaturaMin: producto.temperaturaMin,
      temperaturaMax: producto.temperaturaMax,
      cantidadMinima: producto.stock?.cantidadMinima || 0,
      cantidadMaxima: producto.stock?.cantidadMaxima || 0,
      ubicacion: producto.stock?.ubicacion || '',
      recomendado: producto.recomendado || false
    })
    setModalAbierto(true)
  }
  
  const guardarProducto = async () => {
    try {
      // Validaciones
      if (!formulario.codigo || !formulario.nombre || !formulario.proveedorId) {
        toast.error('Por favor complete todos los campos requeridos')
        return
      }
      
      if (esNuevoProducto) {
        // Crear nuevo producto
        const nuevoProducto: ProductoExtendido = {
          id: `prod_${Date.now()}`,
          codigo: formulario.codigo,
          nombre: formulario.nombre,
          descripcion: formulario.descripcion,
          tipo: formulario.tipo,
          categoria: formulario.categoria,
          unidadMedida: formulario.unidadMedida,
          precioUnitario: formulario.precioUnitario,
          proveedorId: formulario.proveedorId,
          requiereReceta: formulario.requiereReceta,
          requiereFrio: formulario.requiereFrio,
          temperaturaMin: formulario.temperaturaMin,
          temperaturaMax: formulario.temperaturaMax,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          recomendado: formulario.recomendado,
          stock: {
            id: `stock_${Date.now()}`,
            productoId: `prod_${Date.now()}`,
            cantidadActual: 0,
            cantidadMinima: formulario.cantidadMinima,
            cantidadMaxima: formulario.cantidadMaxima,
            ubicacion: formulario.ubicacion,
            fechaEntrada: new Date(),
            precioCosto: formulario.precioUnitario,
            estado: 'disponible',
            alertasVencimiento: false,
            alertasStockBajo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
        
        setProductos([...productos, nuevoProducto])
        toast.success('Producto creado exitosamente')
      } else {
        // Actualizar producto existente
        const productosActualizados = productos.map(p => 
          p.id === productoEditando?.id 
            ? {
                ...p,
                codigo: formulario.codigo,
                nombre: formulario.nombre,
                descripcion: formulario.descripcion,
                tipo: formulario.tipo,
                categoria: formulario.categoria,
                unidadMedida: formulario.unidadMedida,
                precioUnitario: formulario.precioUnitario,
                proveedorId: formulario.proveedorId,
                requiereReceta: formulario.requiereReceta,
                requiereFrio: formulario.requiereFrio,
                temperaturaMin: formulario.temperaturaMin,
                temperaturaMax: formulario.temperaturaMax,
                recomendado: formulario.recomendado,
                stock: p.stock ? {
                  ...p.stock,
                  cantidadMinima: formulario.cantidadMinima,
                  cantidadMaxima: formulario.cantidadMaxima,
                  ubicacion: formulario.ubicacion,
                  updatedAt: new Date()
                } : undefined,
                updatedAt: new Date()
              }
            : p
        )
        
        setProductos(productosActualizados)
        toast.success('Producto actualizado exitosamente')
      }
      
      setModalAbierto(false)
    } catch (error) {
      toast.error('Error al guardar el producto')
    }
  }
  
  const eliminarProducto = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        setProductos(productos.filter(p => p.id !== id))
        toast.success('Producto eliminado exitosamente')
      } catch (error) {
        toast.error('Error al eliminar el producto')
      }
    }
  }
  
  const toggleRecomendado = async (id: string) => {
    try {
      const productosActualizados = productos.map(p =>
        p.id === id ? { ...p, recomendado: !p.recomendado } : p
      )
      setProductos(productosActualizados)
      toast.success('Producto actualizado')
    } catch (error) {
      toast.error('Error al actualizar el producto')
    }
  }
  
  const obtenerCategoriasPorTipo = (tipo: TipoProducto) => {
    switch (tipo) {
      case 'medicamento':
        return CATEGORIAS_MEDICAMENTOS
      case 'equipo_medico':
        return CATEGORIAS_EQUIPOS
      case 'consumible':
        return CATEGORIAS_CONSUMIBLES
      default:
        return []
    }
  }
  
  const obtenerColorEstadoStock = (estado: EstadoStock) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800'
      case 'bajo':
        return 'bg-yellow-100 text-yellow-800'
      case 'agotado':
        return 'bg-red-100 text-red-800'
      case 'vencido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const obtenerIconoEstadoStock = (estado: EstadoStock) => {
    switch (estado) {
      case 'disponible':
        return '✓'
      case 'bajo':
        return '⚠'
      case 'agotado':
        return '✕'
      case 'vencido':
        return '⏰'
      default:
        return '?'
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Panel Administrativo Farmacéutico
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión integral de productos farmacéuticos, inventario y proveedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={cargarDatos}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={abrirModalNuevo}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {productos.filter(p => p.stock?.estado === 'bajo').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${productos.reduce((total, p) => total + (p.precioUnitario * (p.stock?.cantidadActual || 0)), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendados</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {productos.filter(p => p.recomendado).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="productos" className="space-y-4">
          {/* Filtros y búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  value={filtros.tipo || ''}
                  onValueChange={(value) => setFiltros({...filtros, tipo: value as TipoProducto || undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de producto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los tipos</SelectItem>
                    {TIPOS_PRODUCTO.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtros.categoria || ''}
                  onValueChange={(value) => setFiltros({...filtros, categoria: value as CategoriaProducto || undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {CATEGORIAS_MEDICAMENTOS.concat(CATEGORIAS_EQUIPOS, CATEGORIAS_CONSUMIBLES).map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={ordenamiento}
                  onValueChange={(value: 'nombre' | 'precio' | 'stock') => setOrdenamiento(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nombre">Nombre</SelectItem>
                    <SelectItem value="precio">Precio</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc')}
                >
                  {direccionOrden === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de productos */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
              <CardDescription>
                {productosFiltrados.length} productos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Recomendado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosPaginados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.codigo}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-sm text-gray-500">{producto.descripcion}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TIPOS_PRODUCTO.find(t => t.value === producto.tipo)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {CATEGORIAS_MEDICAMENTOS.concat(CATEGORIAS_EQUIPOS, CATEGORIAS_CONSUMIBLES)
                            .find(c => c.value === producto.categoria)?.label}
                        </TableCell>
                        <TableCell>${producto.precioUnitario.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{producto.stock?.cantidadActual || 0}</span>
                            <span className="text-xs text-gray-500">
                              /{producto.stock?.cantidadMinima || 0} min
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={obtenerColorEstadoStock(producto.stock?.estado || 'disponible')}>
                            {obtenerIconoEstadoStock(producto.stock?.estado || 'disponible')}
                            {' '}
                            {producto.stock?.estado || 'disponible'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {proveedores.find(p => p.id === producto.proveedorId)?.nombre || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRecomendado(producto.id)}
                          >
                            <Star 
                              className={`h-4 w-4 ${producto.recomendado ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                            />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalEditar(producto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarProducto(producto.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginación */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Mostrando {indiceInicio + 1} a {Math.min(indiceInicio + productosPorPagina, productosFiltrados.length)} de {productosFiltrados.length} productos
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(paginaActual - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(paginaActual + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventario">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Inventario</CardTitle>
              <CardDescription>
                Control de stock, movimientos y alertas de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de gestión de inventario en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Categorías</CardTitle>
              <CardDescription>
                Administrar categorías y subcategorías de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de gestión de categorías en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reportes">
          <Card>
            <CardHeader>
              <CardTitle>Reportes y Analytics</CardTitle>
              <CardDescription>
                Análisis de ventas, consumo y rotación de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de reportes en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal para crear/editar producto */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {esNuevoProducto ? 'Nuevo Producto' : 'Editar Producto'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Código del Producto *</label>
                <Input
                  value={formulario.codigo}
                  onChange={(e) => setFormulario({...formulario, codigo: e.target.value})}
                  placeholder="Ej: MED001"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Producto *</label>
                <Input
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
                  placeholder="Ej: Paracetamol 500mg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Producto *</label>
                <Select
                  value={formulario.tipo}
                  onValueChange={(value) => {
                    const nuevoTipo = value as TipoProducto
                    setFormulario({
                      ...formulario,
                      tipo: nuevoTipo,
                      categoria: obtenerCategoriasPorTipo(nuevoTipo)[0]?.value || 'analgesicos'
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PRODUCTO.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría *</label>
                <Select
                  value={formulario.categoria}
                  onValueChange={(value) => setFormulario({...formulario, categoria: value as CategoriaProducto})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {obtenerCategoriasPorTipo(formulario.tipo).map(categoria => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidad de Medida *</label>
                <Input
                  value={formulario.unidadMedida}
                  onChange={(e) => setFormulario({...formulario, unidadMedida: e.target.value})}
                  placeholder="Ej: Tabletas, ml, unidades"
                />
              </div>
            </div>
            
            {/* Información comercial */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Comercial</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio Unitario *</label>
                <Input
                  type="number"
                  value={formulario.precioUnitario}
                  onChange={(e) => setFormulario({...formulario, precioUnitario: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Proveedor *</label>
                <Select
                  value={formulario.proveedorId}
                  onValueChange={(value) => setFormulario({...formulario, proveedorId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map(proveedor => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-medium">Configuraciones Especiales</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiereReceta"
                      checked={formulario.requiereReceta}
                      onCheckedChange={(checked) => setFormulario({...formulario, requiereReceta: !!checked})}
                    />
                    <label htmlFor="requiereReceta" className="text-sm">Requiere receta médica</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiereFrio"
                      checked={formulario.requiereFrio}
                      onCheckedChange={(checked) => setFormulario({...formulario, requiereFrio: !!checked})}
                    />
                    <label htmlFor="requiereFrio" className="text-sm">Requiere almacenamiento refrigerado</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recomendado"
                      checked={formulario.recomendado}
                      onCheckedChange={(checked) => setFormulario({...formulario, recomendado: !!checked})}
                    />
                    <label htmlFor="recomendado" className="text-sm">Producto recomendado</label>
                  </div>
                </div>
              </div>
              
              {formulario.requiereFrio && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperatura Mínima (°C)</label>
                    <Input
                      type="number"
                      value={formulario.temperaturaMin || ''}
                      onChange={(e) => setFormulario({...formulario, temperaturaMin: parseFloat(e.target.value) || undefined})}
                      placeholder="2"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperatura Máxima (°C)</label>
                    <Input
                      type="number"
                      value={formulario.temperaturaMax || ''}
                      onChange={(e) => setFormulario({...formulario, temperaturaMax: parseFloat(e.target.value) || undefined})}
                      placeholder="8"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Gestión de inventario */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Gestión de Inventario</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Mínimo *</label>
                <Input
                  type="number"
                  value={formulario.cantidadMinima}
                  onChange={(e) => setFormulario({...formulario, cantidadMinima: parseInt(e.target.value) || 0})}
                  placeholder="10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Máximo *</label>
                <Input
                  type="number"
                  value={formulario.cantidadMaxima}
                  onChange={(e) => setFormulario({...formulario, cantidadMaxima: parseInt(e.target.value) || 0})}
                  placeholder="100"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ubicación *</label>
                <Input
                  value={formulario.ubicacion}
                  onChange={(e) => setFormulario({...formulario, ubicacion: e.target.value})}
                  placeholder="Ej: Estantería A1"
                />
              </div>
            </div>
          </div>
          
          {/* Gestión de imágenes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Imágenes del Producto</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Arrastre una imagen aquí o haga clic para seleccionar</p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-6">
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarProducto}>
              {esNuevoProducto ? 'Crear Producto' : 'Actualizar Producto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Datos de ejemplo para desarrollo
const datosEjemplo: ProductoExtendido[] = [
  {
    id: 'prod_1',
    codigo: 'MED001',
    nombre: 'Paracetamol 500mg',
    descripcion: 'Analgésico y antipirético para alivio del dolor y fiebre',
    tipo: 'medicamento',
    categoria: 'analgesicos',
    unidadMedida: 'Tabletas',
    precioUnitario: 15.50,
    proveedorId: 'prov_1',
    requiereReceta: false,
    requiereFrio: false,
    activo: true,
    recomendado: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    stock: {
      id: 'stock_1',
      productoId: 'prod_1',
      cantidadActual: 150,
      cantidadMinima: 50,
      cantidadMaxima: 500,
      ubicacion: 'Estantería A1',
      fechaEntrada: new Date('2024-01-10'),
      precioCosto: 12.00,
      estado: 'disponible',
      alertasVencimiento: false,
      alertasStockBajo: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  },
  {
    id: 'prod_2',
    codigo: 'MED002',
    nombre: 'Amoxicilina 250mg',
    descripcion: 'Antibiótico de amplio espectro',
    tipo: 'medicamento',
    categoria: 'antibioticos',
    unidadMedida: 'Cápsulas',
    precioUnitario: 25.75,
    proveedorId: 'prov_1',
    requiereReceta: true,
    requiereFrio: false,
    activo: true,
    recomendado: false,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    stock: {
      id: 'stock_2',
      productoId: 'prod_2',
      cantidadActual: 25,
      cantidadMinima: 30,
      cantidadMaxima: 200,
      ubicacion: 'Estantería B2',
      fechaEntrada: new Date('2024-01-12'),
      precioCosto: 20.00,
      estado: 'bajo',
      alertasVencimiento: false,
      alertasStockBajo: true,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16')
    }
  },
  {
    id: 'prod_3',
    codigo: 'CON001',
    nombre: 'Guantes de Nitrilo',
    descripcion: 'Guantes desechables para uso médico',
    tipo: 'consumible',
    categoria: 'guantes',
    unidadMedida: 'Cajas',
    precioUnitario: 45.00,
    proveedorId: 'prov_2',
    requiereReceta: false,
    requiereFrio: false,
    activo: true,
    recomendado: true,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    stock: {
      id: 'stock_3',
      productoId: 'prod_3',
      cantidadActual: 5,
      cantidadMinima: 10,
      cantidadMaxima: 50,
      ubicacion: 'Almacén C1',
      fechaEntrada: new Date('2024-01-14'),
      precioCosto: 35.00,
      estado: 'agotado',
      alertasVencimiento: false,
      alertasStockBajo: true,
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17')
    }
  }
]

const proveedoresEjemplo: Proveedor[] = [
  {
    id: 'prov_1',
    nombre: 'Farmacéutica Nacional S.A.',
    contacto: 'Dr. Juan Pérez',
    telefono: '+34 91 123 4567',
    email: 'ventas@farmanacional.com',
    direccion: 'Calle Principal 123, Madrid',
    rfc: 'FNA123456789',
    activo: true,
    rating: 4.5,
    diasEntregaPromedio: 3,
    condicionesPago: '30 días',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'prov_2',
    nombre: 'Suministros Médicos S.L.',
    contacto: 'María García',
    telefono: '+34 93 987 6543',
    email: 'pedidos@suministrosmedicos.com',
    direccion: 'Av. Diagonal 456, Barcelona',
    rfc: 'SMG987654321',
    activo: true,
    rating: 4.2,
    diasEntregaPromedio: 5,
    condicionesPago: '15 días',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

const categoriasEjemplo: CategoriaInventario[] = [
  {
    id: 'cat_1',
    nombre: 'Analgésicos',
    descripcion: 'Medicamentos para el alivio del dolor',
    tipo: 'medicamento',
    activo: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cat_2',
    nombre: 'Antibióticos',
    descripcion: 'Medicamentos antimicrobianos',
    tipo: 'medicamento',
    activo: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export default PanelAdminFarmacia