import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useCarrito } from '@/contexts/CarritoContext';
import { motion } from 'framer-motion';
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
  Zap,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Check
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
    precio: 125.50,
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
    precio: 87.75,
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
    precio: 249.90,
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
    precio: 320.00,
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
    precio: 450.00,
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
    precio: 285.50,
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
    precio: 520.00,
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
    precio: 157.75,
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
    precio: 350.00,
    imagen: "/api/placeholder/200/200",
    descripcion: "Biberón especial para reducir cólicos y regurgitaciones",
    rating: 4.8,
    stock: 12,
    requiereReceta: false,
    categoriaIcon: <Baby className="h-4 w-4" />
  },
  {
    id: 10,
    nombre: "Tensiómetro Digital",
    categoria: "equipos-medicos",
    marca: "Medisana",
    precio: 899.90,
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
  { id: 'todos', nombre: 'Todos', icono: <Package className="h-4 w-4" />, color: 'from-slate-500 to-slate-600' },
  { id: 'medicamentos', nombre: 'Medicamentos', icono: <Pill className="h-4 w-4" />, color: 'from-blue-500 to-indigo-600' },
  { id: 'suplementos', nombre: 'Suplementos', icono: <Zap className="h-4 w-4" />, color: 'from-amber-500 to-orange-600' },
  { id: 'cuidado-personal', nombre: 'Cuidado Personal', icono: <Shield className="h-4 w-4" />, color: 'from-pink-500 to-rose-600' },
  { id: 'equipos-medicos', nombre: 'Equipos Médicos', icono: <Activity className="h-4 w-4" />, color: 'from-emerald-500 to-teal-600' },
  { id: 'higiene', nombre: 'Higiene', icono: <Shield className="h-4 w-4" />, color: 'from-cyan-500 to-blue-600' },
  { id: 'bebes', nombre: 'Bebés', icono: <Baby className="h-4 w-4" />, color: 'from-purple-500 to-violet-600' },
];

const TiendaFarmacia: React.FC = () => {
  const [productos] = useState<Producto[]>(productosFarmacia);
  const { productos: carrito, agregarProducto, obtenerTotalItems, removerProducto, total } = useCarrito();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [vistaGrid, setVistaGrid] = useState(true);
  const [filtroPrecio, setFiltroPrecio] = useState('todos');
  const [filtroMarca, setFiltroMarca] = useState('todas');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [productosFavoritos, setProductosFavoritos] = useState<number[]>([]);
  const [productosAgregados, setProductosAgregados] = useState<number[]>([]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter(producto => {
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;

      const coincidePrecio = !filtroPrecio || filtroPrecio === 'todos' ||
        (filtroPrecio === 'bajo' && producto.precio < 200) ||
        (filtroPrecio === 'medio' && producto.precio >= 200 && producto.precio <= 500) ||
        (filtroPrecio === 'alto' && producto.precio > 500);

      const coincideMarca = !filtroMarca || filtroMarca === 'todas' || producto.marca === filtroMarca;

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

    // Animación de confirmación
    setProductosAgregados(prev => [...prev, producto.id]);
    setTimeout(() => {
      setProductosAgregados(prev => prev.filter(id => id !== producto.id));
    }, 2000);
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

  const categoriaActual = categorias.find(c => c.id === categoriaSeleccionada);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Categorías horizontales con estilo premium */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categorias.map((categoria, index) => (
              <motion.button
                key={categoria.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setCategoriaSeleccionada(categoria.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${categoriaSeleccionada === categoria.id
                    ? `bg-gradient-to-r ${categoria.color} text-white shadow-lg shadow-blue-500/20`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {categoria.icono}
                {categoria.nombre}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros */}
          <div className={`lg:w-72 ${mostrarFiltros ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32"
            >
              {/* Buscador */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-12 py-6 rounded-2xl border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 bg-white shadow-sm"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filtros Card */}
              <Card className="border-blue-100 shadow-lg shadow-blue-500/5 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-bold text-lg">Filtros</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Filtro de Precio */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Rango de Precio
                    </label>
                    <Select value={filtroPrecio} onValueChange={setFiltroPrecio}>
                      <SelectTrigger className="border-blue-100 rounded-xl py-5">
                        <SelectValue placeholder="Todos los precios" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="todos">Todos los precios</SelectItem>
                        <SelectItem value="bajo">Menos de $200</SelectItem>
                        <SelectItem value="medio">$200 - $500</SelectItem>
                        <SelectItem value="alto">Más de $500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de Marca */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Marca
                    </label>
                    <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                      <SelectTrigger className="border-blue-100 rounded-xl py-5">
                        <SelectValue placeholder="Todas las marcas" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="todas">Todas las marcas</SelectItem>
                        {marcas.map(marca => (
                          <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limpiar filtros */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiltroPrecio('todos');
                      setFiltroMarca('todas');
                      setBusqueda('');
                    }}
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl py-5 font-semibold"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </Button>
                </CardContent>
              </Card>

              {/* Promo Card */}
              <Card className="mt-6 border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl overflow-hidden shadow-xl shadow-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-bold text-blue-200">OFERTA LIMITADA</span>
                  </div>
                  <h4 className="text-xl font-black mb-2">20% OFF en Vitaminas</h4>
                  <p className="text-blue-100 text-sm mb-4">Usa el código SALUD20 en tu compra</p>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl">
                    Aplicar Cupón
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contenido principal - Productos */}
          <div className="flex-1">
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  {categoriaActual?.nombre || 'Todos los Productos'}
                </h2>
                <p className="text-slate-500 mt-1">
                  {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Controles de vista */}
              <div className="flex items-center gap-2">
                <Button
                  variant={vistaGrid ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVistaGrid(true)}
                  className={`p-3 rounded-xl ${vistaGrid ? 'bg-blue-600 text-white' : 'border-blue-200'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={!vistaGrid ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVistaGrid(false)}
                  className={`p-3 rounded-xl ${!vistaGrid ? 'bg-blue-600 text-white' : 'border-blue-200'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="lg:hidden border-blue-200 rounded-xl px-4"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            {/* Grid de productos */}
            {productosFiltrados.length === 0 ? (
              <Card className="border-blue-100 rounded-3xl">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-3xl flex items-center justify-center">
                    <Package className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron productos</h3>
                  <p className="text-slate-500 mb-6">Intenta ajustar los filtros o la búsqueda</p>
                  <Button
                    onClick={() => {
                      setFiltroPrecio('todos');
                      setFiltroMarca('todas');
                      setBusqueda('');
                      setCategoriaSeleccionada('todos');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
                  >
                    Ver Todos los Productos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={
                vistaGrid
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {productosFiltrados.map((producto, index) => (
                  <motion.div
                    key={producto.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-blue-100 rounded-3xl overflow-hidden bg-white ${vistaGrid ? '' : 'flex flex-row'
                        }`}
                    >
                      <div className={`relative ${vistaGrid ? '' : 'w-48 h-48 flex-shrink-0'}`}>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-52 flex items-center justify-center relative overflow-hidden">
                          <Package className="h-20 w-20 text-blue-200 group-hover:scale-110 transition-transform duration-300" />
                          {/* Efecto de brillo */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </div>

                        {producto.descuento && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-lg shadow-rose-500/30 border-0 px-3 py-1 rounded-xl">
                            -{producto.descuento}%
                          </Badge>
                        )}

                        {producto.requiereReceta && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold border-0 rounded-xl">
                            Receta
                          </Badge>
                        )}

                        <button
                          className="absolute top-3 right-3 mt-8 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          onClick={() => toggleFavorito(producto.id)}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${productosFavoritos.includes(producto.id)
                                ? 'text-rose-500 fill-current'
                                : 'text-slate-400'
                              }`}
                          />
                        </button>
                      </div>

                      <div className={vistaGrid ? '' : 'flex-1 flex flex-col justify-between'}>
                        <CardHeader className="pb-2 pt-5">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 rounded-lg px-2 py-0.5 font-medium">
                              {producto.categoriaIcon}
                              <span className="ml-1">
                                {categorias.find(c => c.id === producto.categoria)?.nombre}
                              </span>
                            </Badge>
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                              <span className="text-xs font-bold text-amber-700">{producto.rating}</span>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                            {producto.nombre}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">{producto.marca}</p>
                        </CardHeader>

                        <CardContent className={`${vistaGrid ? 'pt-0' : 'pt-0 flex-1'} pb-5`}>
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                            {producto.descripcion}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {producto.descuento ? (
                                <>
                                  <span className="text-2xl font-black text-blue-600">
                                    ${calcularPrecioConDescuento(producto).toFixed(2)}
                                  </span>
                                  <span className="text-sm text-slate-400 line-through">
                                    ${producto.precio.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-black text-blue-600">
                                  ${producto.precio.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-600 bg-emerald-50 rounded-lg font-medium">
                              {producto.stock} en stock
                            </Badge>
                          </div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              className={`w-full font-bold text-white rounded-2xl py-6 shadow-lg transition-all duration-300 ${productosAgregados.includes(producto.id)
                                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
                                }`}
                              onClick={() => agregarAlCarrito(producto)}
                              disabled={producto.stock === 0}
                            >
                              {productosAgregados.includes(producto.id) ? (
                                <>
                                  <Check className="h-5 w-5 mr-2" />
                                  ¡Agregado!
                                </>
                              ) : (
                                <>
                                  <Plus className="h-5 w-5 mr-2" />
                                  Agregar al Carrito
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
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
