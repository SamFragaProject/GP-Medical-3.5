/**
 * 📦 TIPOS DE INVENTARIO V2
 */

export type TipoProducto = 
  | 'medicamento'
  | 'material_curacion'
  | 'equipo_medico'
  | 'reactivo_laboratorio'
  | 'papeleria'
  | 'limpieza'
  | 'otro';

export type UnidadMedida = 
  | 'pieza'
  | 'caja'
  | 'frasco'
  | 'ampolla'
  | 'tableta'
  | 'ml'
  | 'litro'
  | 'gramo'
  | 'kg'
  | 'par'
  | 'sobre';

export interface Producto {
  id: string;
  empresaId: string;
  
  // Identificación
  codigo: string;
  codigoBarras?: string;
  nombre: string;
  descripcion?: string;
  
  // Categorización
  tipo: TipoProducto;
  categoriaId?: string;
  
  // Unidad
  unidadMedida: UnidadMedida;
  contenidoPorUnidad?: number;
  
  // Stock
  stockMinimo: number;
  stockMaximo?: number;
  stockActual: number;
  stockReservado: number;
  stockDisponible: number;
  
  // Ubicación
  ubicacion?: string;
  almacenId?: string;
  
  // Control de temperatura
  requiereRefrigeracion: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  
  // Precios
  costoUnitario: number;
  precioVenta: number;
  
  // Proveedor
  proveedorId?: string;
  proveedor?: {
    id: string;
    nombre: string;
    telefono?: string;
    email?: string;
  };
  
  // Lotes
  manejaLotes: boolean;
  
  // Estado
  activo: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Lote {
  id: string;
  productoId: string;
  empresaId: string;
  
  numeroLote: string;
  fechaFabricacion?: string;
  fechaCaducidad?: string;
  cantidadInicial: number;
  cantidadActual: number;
  
  // Ubicación específica
  ubicacion?: string;
  
  // Estado
  activo: boolean;
  agotado: boolean;
  
  createdAt: string;
}

export interface MovimientoInventario {
  id: string;
  empresaId: string;
  productoId: string;
  loteId?: string;
  
  tipo: 'entrada' | 'salida' | 'ajuste' | 'traslado' | 'devolucion';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  
  // Referencias
  motivo: string;
  documentoReferencia?: string; // Orden de compra, receta, etc.
  
  // Usuario
  usuarioId: string;
  usuario?: {
    id: string;
    nombre: string;
    apellidoPaterno: string;
  };
  
  createdAt: string;
}

export interface CreateProductoInput {
  codigo: string;
  codigoBarras?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoProducto;
  unidadMedida: UnidadMedida;
  stockMinimo: number;
  stockMaximo?: number;
  costoUnitario: number;
  precioVenta: number;
  proveedorId?: string;
  ubicacion?: string;
  requiereRefrigeracion?: boolean;
  manejaLotes?: boolean;
}

export interface UpdateStockInput {
  productoId: string;
  cantidad: number;
  tipo: MovimientoInventario['tipo'];
  motivo: string;
  loteId?: string;
  documentoReferencia?: string;
}

export interface InventarioFilters {
  search?: string;
  tipo?: TipoProducto;
  activo?: boolean;
  bajoStock?: boolean;
  proveedorId?: string;
  categoriaId?: string;
}

export interface InventarioStats {
  totalProductos: number;
  productosActivos: number;
  productosBajoStock: number;
  productosAgotados: number;
  valorTotal: number;
}

// Opciones para selects
export const TIPO_PRODUCTO_OPTIONS = [
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'material_curacion', label: 'Material de Curación' },
  { value: 'equipo_medico', label: 'Equipo Médico' },
  { value: 'reactivo_laboratorio', label: 'Reactivo de Laboratorio' },
  { value: 'papeleria', label: 'Papelería' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'otro', label: 'Otro' },
];

export const UNIDAD_MEDIDA_OPTIONS = [
  { value: 'pieza', label: 'Pieza' },
  { value: 'caja', label: 'Caja' },
  { value: 'frasco', label: 'Frasco' },
  { value: 'ampolla', label: 'Ampolla' },
  { value: 'tableta', label: 'Tableta' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'litro', label: 'Litro' },
  { value: 'gramo', label: 'Gramo' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'par', label: 'Par' },
  { value: 'sobre', label: 'Sobre' },
];
