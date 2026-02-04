/**
 * 📦 INVENTARIO V2 - Exportaciones
 */

export { Inventario } from './components/Inventario';
export { useInventario } from './hooks/useInventario';
export { inventarioService } from './services/inventarioService';

export type {
  Producto,
  Lote,
  MovimientoInventario,
  CreateProductoInput,
  UpdateStockInput,
  InventarioFilters,
  InventarioStats,
  TipoProducto,
  UnidadMedida,
} from './types/inventario.types';

export { TIPO_PRODUCTO_OPTIONS, UNIDAD_MEDIDA_OPTIONS } from './types/inventario.types';
