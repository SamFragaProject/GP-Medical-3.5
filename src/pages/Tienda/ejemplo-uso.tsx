// Ejemplo de uso de la página Tienda.tsx
// Este archivo muestra diferentes formas de usar la página principal de la tienda

import React from 'react'
import Tienda from '@/pages/Tienda'
import { CarritoProvider } from '@/contexts/CarritoContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Ejemplo 1: Uso básico con routing
export function EjemploUsoBasico() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 1: Uso Básico</h2>
      <p className="mb-4">
        La forma más simple de usar la tienda es importando el componente directamente:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <code>{`import Tienda from '@/pages/Tienda'

function App() {
  return <Tienda />
}`}</code>
      </div>

      <Button 
        onClick={() => window.location.href = '/tienda'}
        className="bg-green-600 hover:bg-green-700"
      >
        Ver Tienda
      </Button>
    </div>
  )
}

// Ejemplo 2: Uso con layout
export function EjUsoConLayout() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 2: Con Layout</h2>
      <p className="mb-4">
        Para usar la tienda dentro del layout principal del ERP:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <code>{`import { Layout } from '@/components/Layout'
import Tienda from '@/pages/Tienda'

function App() {
  return (
    <Layout>
      <Tienda />
    </Layout>
  )
}`}</code>
      </div>
    </div>
  )
}

// Ejemplo 3: Componente individual - Carrito
export function EjemploCarritoIndividual() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 3: Solo Carrito</h2>
      <p className="mb-4">
        Para usar solo el carrito de compras en una sección específica:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <code>{`import { CarritoCompras } from '@/pages/Tienda'

function MiCarrito() {
  return <CarritoCompras />
}`}</code>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo Carrito Individual</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <CarritoCompras /> */}
        </CardContent>
      </Card>
    </div>
  )
}

// Ejemplo 4: Solo el provider
export function EjemploSoloProvider() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 4: Solo Provider</h2>
      <p className="mb-4">
        Para usar solo el contexto del carrito en componentes existentes:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <code>{`import { CarritoProvider } from '@/contexts/CarritoContext'

function MiComponente() {
  return (
    <CarritoProvider>
      {/* Tus componentes aquí */}
    </CarritoProvider>
  )
}`}</code>
      </div>
    </div>
  )
}

// Ejemplo 5: Integración con routing
export function EjemploRouting() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 5: Integración con React Router</h2>
      <p className="mb-4">
        Configuración completa de rutas para la tienda:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
        <pre><code>{`// En App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { TiendaFarmacia } from '@/pages/Tienda'
import { CheckoutFarmacia } from '@/pages/Tienda'

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/tienda" 
          element={
            <ProtectedRoute requiredRoles={['admin_empresa']}>
              <TiendaFarmacia />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tienda/checkout" 
          element={
            <ProtectedRoute>
              <CheckoutFarmacia />
            </ProtectedRoute>
          } 
        /></code></pre>
      </div>
      </Routes>
    </Router>
  )
}`}</code></pre>
      </div>
    </div>
  )
}

// Ejemplo 6: Personalización de estilos
export function EjemploPersonalizacion() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 6: Personalización</h2>
      <p className="mb-4">
        Cómo personalizar los colores y estilos de la tienda:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <code>{`// Personalizar colores CSS
:root {
  --tienda-primary: theme(colors.green.600);
  --tienda-secondary: theme(colors.blue.600);
  --tienda-background: theme(colors.green.50);
}

// En componentes
<div className="bg-[var(--tienda-background)]">
  <Tienda />
</div>`}</code>
      </div>
    </div>
  )
}

// Ejemplo 7: Testing
export function EjemploTesting() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplo 7: Testing</h2>
      <p className="mb-4">
        Ejemplo de pruebas para la tienda:
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <pre><code>{`import { render, screen, fireEvent } from '@testing-library/react'
import { TiendaFarmacia } from '@/pages/Tienda'
import { CarritoProvider } from '@/contexts/CarritoContext'

test('agrega producto al carrito', () => {
  render(
    <CarritoProvider>
      <TiendaFarmacia />
    </CarritoProvider>
  )
  
  const button = screen.getByText('Agregar al carrito')
  fireEvent.click(button)
  
  expect(screen.getByText('1 producto')).toBeInTheDocument()
})`}</code></pre>
      </div>
    </div>
  )
}

// Componente principal de demostración
export function DemoTienda() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Demostración de la Página Tienda
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Página Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                La página principal incluye modal del carrito y todas las funcionalidades.
              </p>
              <Button 
                onClick={() => window.location.href = '/tienda'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Abrir Tienda Completa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Compacta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Componente individual del carrito para espacios pequeños.
              </p>
              {/* <CarritoCompras /> */}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Documentación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Ver el archivo README.md para documentación completa de la API y ejemplos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline">
                  Ver README.md
                </Button>
                <Button variant="outline">
                  Ver Componentes
                </Button>
                <Button variant="outline">
                  Ver Contextos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DemoTienda
