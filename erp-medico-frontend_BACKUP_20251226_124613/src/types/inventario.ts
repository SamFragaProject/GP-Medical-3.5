// Tipos para el módulo de Inventario Médico

export type TipoProducto = 'medicamento' | 'equipo_medico' | 'consumible' | 'suministro' | 'reactivo'
export type CategoriaProducto = 'analgesicos' | 'antibioticos' | 'antisepticos' | 'material_curacion' | 'equipos_laboratorio' | 'equipos_diagnostico' | 'sillas_ruedas' | 'camillas' | 'esparadrapos' | 'guantes' | 'mascarillas' | 'jeringas' | 'reactivos_laboratorio'
export type EstadoStock = 'disponible' | 'bajo' | 'agotado' | 'vencido' | 'revisar'
export type EstadoOrden = 'pendiente' | 'aprobada' | 'en_transito' | 'recibida' | 'cancelada'
export type EstadoMantenimiento = 'programado' | 'en_proceso' | 'completado' | 'vencido' | 'reparacion'

export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo: TipoProducto
  categoria: CategoriaProducto
  unidadMedida: string
  precioUnitario: number
  proveedorId: string
  requiereReceta: boolean
  requiereFrio: boolean
  temperaturaMin?: number
  temperaturaMax?: number
  activo: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  proveedor?: Proveedor
  stock?: Stock
  categorias?: CategoriaProducto
}

export interface Stock {
  id: string
  productoId: string
  cantidadActual: number
  cantidadMinima: number
  cantidadMaxima: number
  ubicacion: string
  lote?: string
  fechaVencimiento?: Date
  fechaEntrada: Date
  precioCosto: number
  temperatura?: number
  estado: EstadoStock
  alertasVencimiento: boolean
  alertasStockBajo: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  producto?: Producto
  movimientos?: MovimientoStock[]
}

export interface Proveedor {
  id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  rfc: string
  certificadoSanitario?: string
  activo: boolean
  rating: number
  diasEntregaPromedio: number
  condicionesPago: string
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  productos?: Producto[]
  ordenesCompra?: OrdenCompra[]
  cotizaciones?: Cotizacion[]
}

export interface OrdenCompra {
  id: string
  numeroOrden: string
  proveedorId: string
  fechaOrden: Date
  fechaEntregaEsperada: Date
  estado: EstadoOrden
  subtotal: number
  impuesto: number
  total: number
  observaciones?: string
  aprobadaPor?: string
  recibidaPor?: string
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  proveedor?: Proveedor
  items?: ItemOrdenCompra[]
}

export interface ItemOrdenCompra {
  id: string
  ordenCompraId: string
  productoId: string
  cantidad: number
  precioUnitario: number
  cantidadRecibida: number
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  ordenCompra?: OrdenCompra
  producto?: Producto
}

export interface Cotizacion {
  id: string
  proveedorId: string
  numeroCotizacion: string
  fechaCotizacion: Date
  fechaValidez: Date
  subtotal: number
  impuesto: number
  total: number
  observaciones?: string
  estado: 'enviada' | 'aceptada' | 'rechazada' | 'vencida'
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  proveedor?: Proveedor
  items?: ItemCotizacion[]
}

export interface ItemCotizacion {
  id: string
  cotizacionId: string
  productoId: string
  cantidad: number
  precioUnitario: number
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  cotizacion?: Cotizacion
  producto?: Producto
}

export interface EquipoMedico {
  id: string
  codigo: string
  nombre: string
  marca: string
  modelo: string
  numeroSerie: string
  fechaCompra: Date
  fechaGarantia?: Date
  costoAdquisicion: number
  ubicacion: string
  responsable?: string
  estado: 'activo' | 'fuervServicio' | 'mantenimiento' | 'descontinuado'
  activo: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  mantenimientos?: MantenimientoEquipo[]
  calibraciones?: CalibracionEquipo[]
}

export interface MantenimientoEquipo {
  id: string
  equipoId: string
  tipo: 'preventivo' | 'correctivo'
  fechaProgramada: Date
  fechaEjecutada?: Date
  descripcion: string
  costo?: number
  tecnico?: string
  estado: EstadoMantenimiento
  observaciones?: string
  proximoMantenimiento?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  equipo?: EquipoMedico
}

export interface CalibracionEquipo {
  id: string
  equipoId: string
  fechaCalibracion: Date
  fechaProximaCalibracion: Date
  resultado: 'aprobado' | 'rechazado' | 'pendiente'
  certificado: string
  tecnico?: string
  observaciones?: string
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  equipo?: EquipoMedico
}

export interface MovimientoStock {
  id: string
  stockId: string
  tipo: 'entrada' | 'salida' | 'ajuste' | 'vencimiento' | 'devolucion'
  cantidad: number
  motivo: string
  referencia?: string
  usuario: string
  fecha: Date
  createdAt: Date
  
  // Relaciones
  stock?: Stock
}

export interface CategoriaInventario {
  id: string
  nombre: string
  descripcion?: string
  tipo: TipoProducto
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AlertaInventario {
  id: string
  tipo: 'vencimiento' | 'stock_bajo' | 'temperatura' | 'mantenimiento'
  productoId?: string
  equipoId?: string
  mensaje: string
  nivel: 'info' | 'warning' | 'error' | 'critical'
  leida: boolean
  fechaCreacion: Date
  fechaLectura?: Date
}

export interface ReporteConsumo {
  id: string
  productoId: string
  periodoInicio: Date
  periodoFin: Date
  cantidadConsumida: number
  costoTotal: number
  departamento?: string
  usuarioId: string
  createdAt: Date
  
  // Relaciones
  producto?: Producto
}

export interface AuditoriaInventario {
  id: string
  fechaAuditoria: Date
  auditor: string
  tipo: 'completa' | 'parcial' | 'especifica'
  observaciones?: string
  ajustesRealizados: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relaciones
  items?: ItemAuditoria[]
}

export interface ItemAuditoria {
  id: string
  auditoriaId: string
  productoId: string
  cantidadSistema: number
  cantidadFisica: number
  diferencia: number
  motivoDiferencia?: string
  ajusteAplicado: boolean
  createdAt: Date
  
  // Relaciones
  auditoria?: AuditoriaInventario
  producto?: Producto
}

// Interfaces para formularios
export interface FormularioProducto {
  codigo: string
  nombre: string
  descripcion?: string
  tipo: TipoProducto
  categoria: CategoriaProducto
  unidadMedida: string
  precioUnitario: number
  proveedorId: string
  requiereReceta: boolean
  requiereFrio: boolean
  temperaturaMin?: number
  temperaturaMax?: number
  cantidadMinima: number
  cantidadMaxima: number
  ubicacion: string
}

export interface FormularioOrdenCompra {
  proveedorId: string
  fechaEntregaEsperada: Date
  observaciones?: string
  items: {
    productoId: string
    cantidad: number
    precioUnitario: number
  }[]
}

export interface FormularioMovimientoStock {
  stockId: string
  tipo: MovimientoStock['tipo']
  cantidad: number
  motivo: string
  referencia?: string
}

// Interfaces para filtros y búsquedas
export interface FiltrosInventario {
  tipo?: TipoProducto
  categoria?: CategoriaProducto
  estado?: EstadoStock
  proveedorId?: string
  ubicacion?: string
  fechaVencimientoDesde?: Date
  fechaVencimientoHasta?: Date
  precioDesde?: number
  precioHasta?: number
  busqueda?: string
}

export interface ConfiguracionInventario {
  id: string
  empresaId: string
  diasAlertaVencimiento: number
  porcentajeAlertaStockBajo: number
  permitirVentasSinStock: boolean
  generarOrdenesAuto: boolean
  temperaturaMinimaAlerta: number
  temperaturaMaximaAlerta: number
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

// Interfaces para estadísticas y KPIs
export interface EstadisticasInventario {
  totalProductos: number
  totalValorInventario: number
  productosStockBajo: number
  productosVencidos: number
  productosPorVencer: number
  rotacionPromedio: number
  valorComprasMes: number
  valorVentasMes: number
  eficienciaInventario: number
}

export interface ReporteInventario {
  producto: string
  stockActual: number
  stockMinimo: number
  valorTotal: number
  proximoVencimiento?: Date
  diasVencimiento?: number
  rotacion: number
  categoria: string
  proveedor: string
}

export interface KardexProducto {
  fecha: Date
  tipoMovimiento: string
  cantidad: number
  precio: number
  saldo: number
  motivo: string
}

// Enums para categorización específica
export const CATEGORIAS_MEDICAMENTOS: { value: CategoriaProducto; label: string }[] = [
  { value: 'analgesicos', label: 'Analgésicos' },
  { value: 'antibioticos', label: 'Antibióticos' },
  { value: 'antisepticos', label: 'Antisépticos' },
]

export const CATEGORIAS_EQUIPOS: { value: CategoriaProducto; label: string }[] = [
  { value: 'equipos_laboratorio', label: 'Equipos de Laboratorio' },
  { value: 'equipos_diagnostico', label: 'Equipos de Diagnóstico' },
]

export const CATEGORIAS_CONSUMIBLES: { value: CategoriaProducto; label: string }[] = [
  { value: 'material_curacion', label: 'Material de Curación' },
  { value: 'esparadrapos', label: 'Esparadrapos' },
  { value: 'guantes', label: 'Guantes' },
  { value: 'mascarillas', label: 'Mascarillas' },
  { value: 'jeringas', label: 'Jeringas' },
]

export const TIPOS_PRODUCTO: { value: TipoProducto; label: string }[] = [
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'equipo_medico', label: 'Equipo Médico' },
  { value: 'consumible', label: 'Consumible' },
  { value: 'suministro', label: 'Suministro' },
  { value: 'reactivo', label: 'Reactivo' },
]
