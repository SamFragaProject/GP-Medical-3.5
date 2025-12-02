// Aplicación principal del ERP Médico
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CarritoProvider } from '@/contexts/CarritoContext'
import { SystemProvider } from '@/contexts/SystemIntegrationContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
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
import LoginPage from '@/pages/Login' // Asumiendo que existe, si no, lo crearé
import Home from '@/pages/Home'
import './App.css'
import ExtractorMedico from '@/pages/apps/ExtractorMedico'
import GeneradorReportes from '@/pages/apps/GeneradorReportes'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas - Sin Providers problemáticos */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas con Autenticación - Con todos los Providers */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <SystemProvider>
                <CarritoProvider>
                  <div className="App">
                    <Routes>
                      {/* Rutas Protegidas */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Dashboard />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute resource="dashboard">
                            <Layout>
                              <Dashboard />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/pacientes"
                        element={
                          <ProtectedRoute resource="pacientes">
                            <Layout>
                              <Pacientes />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/agenda"
                        element={
                          <ProtectedRoute resource="agenda">
                            <Layout>
                              <Agenda />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/agenda/nueva"
                        element={
                          <ProtectedRoute resource="agenda">
                            <Layout>
                              <NuevaCita />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/alertas"
                        element={
                          <ProtectedRoute resource="alertas">
                            <Layout>
                              <AlertasMedicas />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Medicina del trabajo */}
                      <Route
                        path="/examenes"
                        element={
                          <ProtectedRoute resource="examenes">
                            <Layout>
                              <ExamenesOcupacionales />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/rayos-x"
                        element={
                          <ProtectedRoute resource="rayos_x">
                            <Layout>
                              <RayosX />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/evaluaciones"
                        element={
                          <ProtectedRoute resource="evaluaciones">
                            <Layout>
                              <EvaluacionesRiesgo />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />


                      <Route
                        path="/ia"
                        element={
                          <ProtectedRoute resource="ia">
                            <Layout>
                              <IA />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Apps Integradas */}
                      <Route
                        path="/apps/extractor"
                        element={
                          <ProtectedRoute resource="ia">
                            <Layout>
                              <ExtractorMedico />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/apps/reportes"
                        element={
                          <ProtectedRoute resource="ia">
                            <Layout>
                              <GeneradorReportes />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/certificaciones"
                        element={
                          <ProtectedRoute resource="certificaciones">
                            <Layout>
                              <Certificaciones />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Gestión */}
                      <Route
                        path="/tienda"
                        element={
                          <ProtectedRoute resource="tienda">
                            <Layout>
                              <Tienda />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/facturacion"
                        element={
                          <ProtectedRoute resource="facturacion">
                            <Layout>
                              <Facturacion />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/reportes"
                        element={
                          <ProtectedRoute resource="reportes">
                            <Layout>
                              <Reportes />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Sistema */}
                      <Route
                        path="/configuracion"
                        element={
                          <ProtectedRoute resource="configuracion">
                            <Layout>
                              <Configuracion />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/perfil"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <PerfilUsuario />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Rutas administrativas */}
                      <Route
                        path="/admin/menu-config"
                        element={
                          <ProtectedRoute resource="sistema">
                            <Layout>
                              <PanelMenuConfig />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute resource="sistema">
                            <Layout>
                              <AdminDashboardWrapper />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
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
                </CarritoProvider>
              </SystemProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
