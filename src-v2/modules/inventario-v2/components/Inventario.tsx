/**
 * 📦 PÁGINA DE INVENTARIO V2
 */

import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, Search, TrendingDown } from 'lucide-react';
import { ButtonV2 } from '../../../shared/components/ui/ButtonV2';
import { useInventario } from '../hooks/useInventario';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';
import { TIPO_PRODUCTO_OPTIONS } from '../types/inventario.types';
import type { Producto } from '../types/inventario.types';

export function Inventario() {
  const { hasPermission } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showEntradaModal, setShowEntradaModal] = useState(false);

  const {
    productos,
    productosBajoStock,
    stats,
    filters,
    isLoading,
    isLoadingStats,
    setSearch,
    setTipoFilter,
    setBajoStockFilter,
    clearFilters,
    create,
    entradaInventario,
    salidaInventario,
    isCreating,
    isUpdatingStock,
  } = useInventario();

  const canCreate = hasPermission('inventario', 'create');
  const canUpdate = hasPermission('inventario', 'update');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500">
            {isLoadingStats
              ? 'Cargando...'
              : `${stats?.totalProductos || 0} productos registrados`
            }
          </p>
        </div>
        
        {canCreate && (
          <ButtonV2
            variant="primary"
            onClick={() => {
              setSelectedProducto(null);
              setShowModal(true);
            }}
            icon={<Plus className="h-4 w-4" />}
          >
            Nuevo Producto
          </ButtonV2>
        )}
      </div>

      {/* Alertas de bajo stock */}
      {productosBajoStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">
              {productosBajoStock.length} productos con bajo stock
            </h3>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            Hay productos que han alcanzado el stock mínimo. Considera reabastecer.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="h-5 w-5 text-blue-600" />}
            label="Total Productos"
            value={stats.totalProductos}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            label="Bajo Stock"
            value={stats.productosBajoStock}
            alert={stats.productosBajoStock > 0}
          />
          <StatCard
            icon={<TrendingDown className="h-5 w-5 text-red-600" />}
            label="Agotados"
            value={stats.productosAgotados}
            alert={stats.productosAgotados > 0}
          />
          <StatCard
            icon={<Package className="h-5 w-5 text-green-600" />}
            label="Activos"
            value={stats.productosActivos}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filters.search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.tipo || ''}
          onChange={(e) => setTipoFilter(e.target.value || undefined)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Todos los tipos</option>
          {TIPO_PRODUCTO_OPTIONS.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
        
        <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={filters.bajoStock || false}
            onChange={(e) => setBajoStockFilter(e.target.checked)}
            className="rounded text-primary"
          />
          <span className="text-sm">Solo bajo stock</span>
        </label>
        
        {Object.keys(filters).length > 0 && (
          <ButtonV2 variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </ButtonV2>
        )}
      </div>

      {/* Tabla de productos */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No hay productos</p>
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">{producto.codigo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {TIPO_PRODUCTO_OPTIONS.find(t => t.value === producto.tipo)?.label || producto.tipo}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          producto.stockActual <= producto.stockMinimo
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {producto.stockActual}
                        </span>
                        <span className="text-xs text-gray-500">
                          / {producto.stockMinimo} mín
                        </span>
                        {producto.stockActual <= producto.stockMinimo && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      ${producto.precioVenta.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {canUpdate && (
                        <div className="flex items-center justify-end gap-2">
                          <ButtonV2
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProducto(producto);
                              setShowEntradaModal(true);
                            }}
                          >
                            + Stock
                          </ButtonV2>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  alert = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${alert ? 'bg-red-50 border-red-100' : 'bg-white'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
