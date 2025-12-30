// Ejemplo de uso del componente CarritoCompras
// Este archivo muestra cómo implementar el carrito en una aplicación real

import React from 'react'
import { CarritoProvider, CarritoCompras, BotonCarritoFlotante, BotonAgregarCarrito } from '@/components/tienda'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Ejemplo de productos para demo
const productosEjemplo = [
  {
    id: '1',
    nombre: 'Estetoscopio Digital Premium',
    precio: 299.99,
    categoria: 'Instrumentos Médicos',
    imagen: '/images/estetoscopio.jpg',
    stock: 15
  },
  {
    id: '2',
    nombre: 'Tensiómetro Omron',
    precio: 89.99,
    categoria: 'Monitoreo',
    imagen: '/images/tensiometro.jpg',
    stock: 25
  },
  {
    id: '3',
    nombre: 'Termómetro Infrarrojo',
    precio: 45.50,
    categoria: 'Monitoreo',
    imagen: '/images/termometro.jpg',
    stock: 30
  }
]

function ProductoCard({ producto }: { producto: typeof productosEjemplo[0] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{producto.nombre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Imagen del producto</span>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-primary">${producto.precio}</p>
          <p className="text-sm text-gray-500">{producto.categoria}</p>
          <p className="text-sm text-gray-500">Stock: {producto.stock} unidades</p>
        </div>
        <BotonAgregarCarrito 
          producto={producto}
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}

// Página de ejemplo con catálogo de productos
function PaginaCatalogo() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo Médico</h1>
        <p className="text-gray-600">Equipos y suministros médicos de alta calidad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productosEjemplo.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  )
}

// Página de ejemplo con el carrito
function PaginaCarrito() {
  return (
    <div className="container mx-auto p-6">
      <CarritoCompras />
    </div>
  )
}

// Ejemplo de aplicación principal que integra todo
export default function EjemploCarrito() {
  return (
    <CarritoProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navegación de ejemplo */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">ERP Médico - Tienda</h1>
              <Button variant="outline">
                Ver Carrito
              </Button>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main>
          <PaginaCatalogo />
        </main>

        {/* Botón flotante del carrito */}
        <BotonCarritoFlotante />

        {/* Footer de ejemplo */}
        <footer className="bg-white border-t mt-20">
          <div className="container mx-auto p-6 text-center text-gray-600">
            <p>&copy; 2024 ERP Médico. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </CarritoProvider>
  )
}

// Componente de ejemplo simplificado
export const EjemploUsoCarrito = () => {
  return null;
};

export { CarritoProvider, CarritoCompras, BotonCarritoFlotante, BotonAgregarCarrito };