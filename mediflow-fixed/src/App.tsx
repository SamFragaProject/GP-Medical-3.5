// Aplicación principal del ERP Médico - SIN AUTENTICACIÓN
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CarritoProvider } from '@/contexts/CarritoContext'
import { SystemProvider } from '@/contexts/SystemIntegrationContext'
import { Layout } from '@/components/Layout'
import { PatientLimitedAccess } from '@/components/PatientLimitedAccess'
import { PermissionTester } from '@/components/PermissionTester'
import { PermissionIntegrationTester } from '@/components/PermissionIntegrationTester'
// import { NavigationGuard, ROUTE_PERMISSIONS } from '@/components/auth/NavigationGuard'
import { PanelMenuConfig } from '@/components/admin/PanelMenuConfig'
import { AdminDashboardWrapper } from '@/components/admin/AdminDashboard'
import { Dashboard } from '@/pages/Dashboard'
import { Agenda } from '@/pages/Agenda'
import { ExamenesOcupacionales } from '@/pages/ExamenesOcupacionales'
import { EvaluacionesRiesgo } from '@/pages/EvaluacionesRiesgo'
import { Reportes } from '@/pages/Reportes'
import { IA } from '@/pages/IA'
import { Facturacion } from '@/pages/Facturacion'
import { Inventario } from '@/pages/Inventario'
import { Configuracion } from '@/pages/Configuracion'
import { Pacientes } from '@/pages/Pacientes'
import { Certificaciones } from '@/pages/Certificaciones'
import { RayosX } from '@/pages/RayosX'
import { NuevaCita } from '@/pages/NuevaCita'
import { PerfilUsuario } from '@/pages/PerfilUsuario'
import { AlertasMedicas } from '@/pages/AlertasMedicas'
import Tienda from '@/pages/Tienda'
import TiendaFarmacia from '@/components/tienda/TiendaFarmacia'
import './App.css'



function App() {
  return (
    <SystemProvider>
      <CarritoProvider>
        <Router>
        <div className="App">
          <Routes>
            {/* Rutas principales sin autenticación */}
            <Route 
              path="/" 
              element={<Layout><Dashboard /></Layout>}
            />
            
            <Route 
              path="/dashboard" 
              element={<Layout><Dashboard /></Layout>}
            >
              <Route 
                index 
                element={<Layout><Dashboard /></Layout>}
              />
              
              {/* Módulos principales */}
              <Route 
                path="pacientes" 
                element={<Layout><Pacientes /></Layout>}
              />
              <Route 
                path="agenda" 
                element={<Layout><Agenda /></Layout>}
              />
              <Route 
                path="agenda/nueva" 
                element={<Layout><NuevaCita /></Layout>}
              />
              <Route 
                path="alertas" 
                element={<Layout><AlertasMedicas /></Layout>}
              />
              
              {/* Medicina del trabajo */}
              <Route 
                path="examenes" 
                element={<Layout><ExamenesOcupacionales /></Layout>}
              />
              <Route 
                path="rayos-x" 
                element={<Layout><RayosX /></Layout>}
              />
              <Route 
                path="evaluaciones" 
                element={<Layout><EvaluacionesRiesgo /></Layout>}
              />
              <Route 
                path="ia" 
                element={<Layout><IA /></Layout>}
              />
              <Route 
                path="certificaciones" 
                element={<Layout><Certificaciones /></Layout>}
              />
              
              {/* Gestión */}
              <Route 
                path="tienda" 
                element={<Layout><Tienda /></Layout>}
              />
              <Route 
                path="facturacion" 
                element={<Layout><Facturacion /></Layout>}
              />
              <Route 
                path="reportes" 
                element={<Layout><Reportes /></Layout>}
              />
              
              {/* Sistema */}
              <Route 
                path="configuracion" 
                element={<Layout><Configuracion /></Layout>}
              />
              <Route 
                path="perfil" 
                element={<Layout><PerfilUsuario /></Layout>}
              />
              
              {/* Rutas especiales */}
              <Route 
                path="paciente" 
                element={<Layout><PatientLimitedAccess /></Layout>}
              />
              <Route 
                path="permission-tester" 
                element={<Layout><PermissionTester /></Layout>}
              />
              <Route 
                path="integration-tester" 
                element={<Layout><PermissionIntegrationTester /></Layout>}
              />
              <Route 
                path="admin/menu-config" 
                element={<Layout><PanelMenuConfig /></Layout>}
              />
              <Route 
                path="admin/dashboard" 
                element={<Layout><AdminDashboardWrapper /></Layout>}
              />
            </Route>

            {/* Ruta catch-all */}
            <Route path="*" element={<Layout><Dashboard /></Layout>} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '14px',
              },
              success: {
                style: {
                  borderLeft: '4px solid #00BFA6',
                },
                iconTheme: {
                  primary: '#00BFA6',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  borderLeft: '4px solid #EF4444',
                },
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
        </CarritoProvider>
      </SystemProvider>
  )
}

export default App