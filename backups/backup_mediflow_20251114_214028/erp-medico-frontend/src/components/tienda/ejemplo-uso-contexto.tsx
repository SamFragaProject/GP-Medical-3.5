// Ejemplo de uso del contexto del carrito global
import React from 'react'
import { useCarrito } from '@/contexts/CarritoContext'

const EjemploUsoContexto: React.FC = () => {
  const {
    productos,
    agregarProducto,
    removerProducto,
    actualizarCantidad,
    limpiarCarrito,
    obtenerTotalItems,
    subtotal,
    total,
    cuponActivo,
    metodoEnvio
  } = useCarrito()

  // Producto de ejemplo para agregar
  const productoEjemplo = {
    id: '123',
    nombre: 'Paracetamol 500mg',
    precio: 25.50,
    categoria: 'medicamentos',
    stock: 100,
    imagen: '/api/placeholder/200/200'
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ejemplo de Uso del Carrito Global</h2>
      
      {/* Estado del carrito */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Estado Actual del Carrito:</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p>Total de items: {obtenerTotalItems()}</p>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Total: ${total.toFixed(2)}</p>
          <p>Cupón activo: {cuponActivo ? cuponActivo.codigo : 'Ninguno'}</p>
          <p>Método de envío: {metodoEnvio ? metodoEnvio.descripcion : 'No seleccionado'}</p>
        </div>
      </div>

      {/* Productos en el carrito */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Productos:</h3>
        {productos.length === 0 ? (
          <p className="text-gray-500">No hay productos en el carrito</p>
        ) : (
          <div className="space-y-2">
            {productos.map((producto) => (
              <div key={producto.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium">{producto.nombre}</p>
                  <p className="text-sm text-gray-600">${producto.precio.toFixed(2)} x {producto.cantidad}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    -
                  </button>
                  <span>{producto.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removerProducto(producto.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex space-x-4">
        <button
          onClick={() => agregarProducto(productoEjemplo)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Agregar Producto Ejemplo
        </button>
        
        <button
          onClick={limpiarCarrito}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Limpiar Carrito
        </button>
      </div>

      {/* Información del contexto */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold mb-2">✅ Contexto Global Integrado:</h4>
        <ul className="text-sm space-y-1">
          <li>• Estado global del carrito compartido entre componentes</li>
          <li>• Persistencia automática en localStorage</li>
          <li>• Cálculo automático de totales y descuentos</li>
          <li>• Gestión de cupones y métodos de envío</li>
          <li>• Notificaciones toast integradas</li>
          <li>• Sincronización en tiempo real</li>
        </ul>
      </div>
    </div>
  )
}

export default EjemploUsoContexto