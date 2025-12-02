import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useCarrito } from '@/contexts/CarritoContext';
import { 
  Search, 
  ShoppingCart, 
  Grid3X3, 
  List, 
  Filter,
  Star,
  Plus,
  Minus,
  Heart,
  Package,
  Pill,
  Activity,
  Shield,
  Baby,
  Zap
} from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  descuento?: number;
  imagen: string;
  descripcion: string;
  rating: number;
  stock: number;
  requiereReceta: boolean;
  categoriaIcon: React.ReactNode;
}

// Interfaz para transformar Producto a ProductoCarrito
interface ProductoCarrito {
  id: string
  nombre: string
  precio: number
  imagen?: string
  cantidad: number
  categoria?: string
  stock?: number
}

// Datos de productos simulados
const productosFarmacia: Producto[] = [
  {
    id: 1,
    nombre: "Ibuprofeno 400mg",
    categoria: "medicamentos",
    marca: "Laboratorios Kern",
    precio: 12.50,
    descuento: 15,
    imagen: "/api/placeholder/200/200",
    descripcion: "Antiinflamatorio no esteroideo para alivio del dolor y la inflamación",
    rating: 4.5,
    stock: 50,
    requiereReceta: false,
    categoriaIcon: <Pill className="h-4 w-4" />
  },
  {
    id: 2,
    nombre: "Paracetamol 500mg",
    categoria: "medicamentos",
    marca: "Teva",
    precio: 8.75,
    imagen: "/api/placeholder/200/200",
    descripcion: "Analgésico y antipirético para adultos y niños",
    rating: 4.8,
    stock: 75,
    requiereReceta: false,
    categoriaIcon: <Pill className="h-4 w-4" />
  },
  {
    id: 3,
    nombre: "Vitamina C 1000mg",
    categoria: "suplementos",
    marca: "Arkopharma",
    precio: 24.90,
    imagen: "/api/placeholder/200/200",
    descripcion: "Suplemento alimenticio para fortalecer el sistema inmune",
    rating: 4.3,
    stock: 30,
    requiereReceta: false,
    categoriaIcon: <Zap className="h-4 w-4" />
  },
  {
    id: 4,
    nombre: "Protector Solar FPS 50+",
    categoria: "cuidado-personal",
    marca: "La Roche Posay",
    precio: 32.00,
    imagen: "/api/placeholder/200/200",
    descripcion: "Protección solar facial con filtro mineral",
    rating: 4.7,
    stock: 25,
    requiereReceta: false,
    categoriaIcon: <Shield className="h-4 w-4" />
  },
  {
    id: 5,
    nombre: "Termómetro Digital",
    categoria: "equipos-medicos",
    marca: "Omron",
    precio: 45.00,
    descuento: 20,
    imagen: "/api/placeholder/200/200",
    descripcion: "Termómetro digital de lectura rápida y precisa",
    rating: 4.6,
    stock: 15,
    requiereReceta: false,
    categoriaIcon: <Activity className="h-4 w-4" />
  },
  {
    id: 6,
    nombre: "Crema Hidratante Piel Sensible",
    categoria: "cuidado-personal",
    marca: "Eucerin",
    precio: 28.50,
    imagen: "/api/placeholder/200/200",
    descripcion: "Crema hidratante para piel sensible y seca",
    rating: 4.4,
    stock: 40,
    requiereReceta: false,
    categoriaIcon: <Shield className="h-4 w-4" />
  },
  {
    id: 7,
    nombre: "Omega-3 Complejo",
    categoria: "suplementos",
    marca: "Solgar",
    precio: 52.00,
    imagen: "/api/placeholder/200/200",
    descripcion: "Suplemento de ácidos grasos omega-3 para la salud cardiovascular",
    rating: 4.9,
    stock: 20,
    requiereReceta: false,
    categoriaIcon: <Zap className="h-4 w-4" />
  },
  {
    id: 8,
    nombre: "Jabón Antiséptico",
    categoria: "higiene",
    marca: "Lactacyd",
    precio: 15.75,
    imagen: "/api/placeholder/200/200",
    descripcion: "Jabón líquido antiséptico para higiene diaria",
    rating: 4.2,
    stock: 60,
    requiereReceta: false,
    categoriaIcon: <Shield className="h-4 w-4" />
  },
  {
    id: 9,
    nombre: "Biberón Anticólicos",
    categoria: "bebes",
    marca: "Philips Avent",
    precio: 35.00,
    imagen: "/api/placeholder/200/200",
    descripcion: "Biberón especial para reducir cólicos y regurgitaciones",
    rating: 4.8,
    stock: 12,
    requiereReceta: false,
    categoriaIcon: <Baby className="h-4 w-4" />
  },
  {
    id: 10,
    nombre: "Tensiometro Digital",
    categoria: "equipos-medicos",
    marca: "Medisana",
    precio: 89.90,
    descuento: 10,
    imagen: "/api/placeholder/200/200",
    descripcion: "Tensiómetro digital de brazo con memoria y promedios",
    rating: 4.6,
    stock: 8,
    requiereReceta: false,
    categoriaIcon: <Activity className="h-4 w-4" />
  }
];

const categorias = [
  { id: 'todos', nombre: 'Todos', icono: <Package className="h-4 w-4" /> },
  { id: 'medicamentos', nombre: 'Medicamentos', icono: <Pill className="h-4 w-4" /> },
  { id: 'suplementos', nombre: 'Suplementos', icono: <Zap className="h-4 w-4" /> },
  { id: 'cuidado-personal', nombre: 'Cuidado Personal', icono: <Shield className="h-4 w-4" /> },
  { id: 'equipos-medicos', nombre: 'Equipos Médicos', icono: <Activity className="h-4 w-4" /> },
  { id: 'higiene', nombre: 'Higiene', icono: <Shield className="h-4 w-4" /> },
  { id: 'bebes', nombre: 'Bebés', icono: <Baby className="h-4 w-4" /> },
];

const TiendaFarmacia: React.FC = () => {
  const [productos] = useState<Producto[]>(productosFarmacia);
  const { productos: carrito, agregarProducto, obtenerTotalItems, removerProducto, total } = useCarrito();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [vistaGrid, setVistaGrid] = useState(true);
  const [filtroPrecio, setFiltroPrecio] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [productosFavoritos, setProductosFavoritos] = useState<number[]>([]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter(producto => {
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                              producto.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
                              producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincideCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
      
      const coincidePrecio = !filtroPrecio || 
        (filtroPrecio === 'bajo' && producto.precio < 20) ||
        (filtroPrecio === 'medio' && producto.precio >= 20 && producto.precio <= 50) ||
        (filtroPrecio === 'alto' && producto.precio > 50);
      
      const coincideMarca = !filtroMarca || producto.marca === filtroMarca;
      
      return coincideBusqueda && coincideCategoria && coincidePrecio && coincideMarca;
    });
    
    return resultado;
  }, [productos, busqueda, categoriaSeleccionada, filtroPrecio, filtroMarca]);

  // Obtener marcas únicas
  const marcas = useMemo(() => {
    return [...new Set(productos.map(p => p.marca))].sort();
  }, [productos]);

  // Funciones del carrito usando contexto global
  const agregarAlCarrito = (producto: Producto) => {
    const productoCarrito: Omit<ProductoCarrito, 'cantidad'> = {
      id: producto.id.toString(),
      nombre: producto.nombre,
      precio: calcularPrecioConDescuento(producto),
      imagen: producto.imagen,
      categoria: producto.categoria,
      stock: producto.stock
    };
    agregarProducto(productoCarrito);
  };

  const toggleFavorito = (productoId: number) => {
    setProductosFavoritos(prev => 
      prev.includes(productoId)
        ? prev.filter(id => id !== productoId)
        : [...prev, productoId]
    );
  };

  const calcularPrecioConDescuento = (producto: Producto) => {
    if (producto.descuento) {
      return producto.precio * (1 - producto.descuento / 100);
    }
    return producto.precio;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                  Tienda Farmacéutica
                </h1>
                <p className="text-gray-600">Productos de salud y bienestar</p>
              </div>
            </div>
            
            {/* Carrito */}
            <div className="relative">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrito
                {obtenerTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center">
                    {obtenerTotalItems()}
                  </Badge>
                )}
              </Button>
              {obtenerTotalItems() > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Carrito de Compras</h3>
                    <p className="text-sm text-gray-600">{obtenerTotalItems()} productos</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {carrito.map(item => (
                      <div key={item.id} className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-800">{item.nombre}</p>
                          {item.categoria && (
                            <p className="text-xs text-gray-600">{item.categoria}</p>
                          )}
                          <p className="text-sm font-semibold text-green-600">
                            €{item.precio.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium w-8 text-center">{item.cantidad}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-800">Total:</span>
                      <span className="font-bold text-green-600 text-lg">€{carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2)}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                      Proceder al Pago
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            
            {/* Controles de vista */}
            <div className="flex items-center space-x-2">
              <Button
                variant={vistaGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaGrid(true)}
                className={vistaGrid ? "bg-gradient-to-r from-green-600 to-blue-600 text-white" : ""}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={!vistaGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaGrid(false)}
                className={!vistaGrid ? "bg-gradient-to-r from-green-600 to-blue-600 text-white" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="border-green-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categorías y Filtros */}
          <div className={`lg:w-64 ${mostrarFiltros ? 'block' : 'hidden lg:block'}`}>
            <Card className="border-green-100 shadow-sm">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-green-600" />
                  Categorías
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {categorias.map(categoria => (
                  <Button
                    key={categoria.id}
                    variant={categoriaSeleccionada === categoria.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      categoriaSeleccionada === categoria.id 
                        ? "bg-gradient-to-r from-green-600 to-blue-600 text-white" 
                        : "text-gray-700 hover:bg-green-50"
                    }`}
                    onClick={() => setCategoriaSeleccionada(categoria.id)}
                  >
                    {categoria.icono}
                    <span className="ml-2">{categoria.nombre}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="mt-4 border-green-100 shadow-sm">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-800">Filtros</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtro de Precio */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Precio</label>
                  <Select value={filtroPrecio} onValueChange={setFiltroPrecio}>
                    <SelectTrigger className="border-green-200">
                      <SelectValue placeholder="Todos los precios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los precios</SelectItem>
                      <SelectItem value="bajo">Menos de €20</SelectItem>
                      <SelectItem value="medio">€20 - €50</SelectItem>
                      <SelectItem value="alto">Más de €50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Marca */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Marca</label>
                  <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                    <SelectTrigger className="border-green-200">
                      <SelectValue placeholder="Todas las marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las marcas</SelectItem>
                      {marcas.map(marca => (
                        <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Limpiar filtros */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setFiltroPrecio('');
                    setFiltroMarca('');
                  }}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50"
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Resultados de búsqueda */}
            <div className="mb-4">
              <p className="text-gray-600">
                Mostrando {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
                {categoriaSeleccionada !== 'todos' && (
                  <span> en <strong>{categorias.find(c => c.id === categoriaSeleccionada)?.nombre}</strong></span>
                )}
              </p>
            </div>

            {/* Grid de productos */}
            {productosFiltrados.length === 0 ? (
              <Card className="border-green-100">
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
                  <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda</p>
                </CardContent>
              </Card>
            ) : (
              <div className={
                vistaGrid 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {productosFiltrados.map(producto => (
                  <Card 
                    key={producto.id} 
                    className={`group hover:shadow-lg transition-all duration-200 border-green-100 ${
                      vistaGrid ? '' : 'flex flex-row'
                    }`}
                  >
                    <div className={`relative ${vistaGrid ? '' : 'w-48 h-48 flex-shrink-0'}`}>
                      <div className="bg-gray-100 h-48 flex items-center justify-center rounded-t-lg">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                      {producto.descuento && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{producto.descuento}%
                        </Badge>
                      )}
                      {producto.requiereReceta && (
                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
                          Receta
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 mt-8 bg-white/80 hover:bg-white"
                        onClick={() => toggleFavorito(producto.id)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            productosFavoritos.includes(producto.id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                    </div>
                    
                    <div className={vistaGrid ? '' : 'flex-1 flex flex-col justify-between'}>
                      <CardHeader className={vistaGrid ? 'pb-2' : 'pb-2'}>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {producto.categoriaIcon}
                            <span className="ml-1">
                              {categorias.find(c => c.id === producto.categoria)?.nombre}
                            </span>
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{producto.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                          {producto.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">{producto.marca}</p>
                      </CardHeader>
                      
                      <CardContent className={vistaGrid ? 'pt-0' : 'pt-0 flex-1'}>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {producto.descripcion}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {producto.descuento ? (
                              <>
                                <span className="text-lg font-bold text-green-600">
                                  €{calcularPrecioConDescuento(producto).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  €{producto.precio.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-green-600">
                                €{producto.precio.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {producto.stock} disponibles
                          </Badge>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                          onClick={() => agregarAlCarrito(producto)}
                          disabled={producto.stock === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar al Carrito
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiendaFarmacia;