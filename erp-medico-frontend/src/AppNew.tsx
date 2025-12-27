// Aplicación principal con sistema de roles y autenticación
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CarritoProvider } from '@/contexts/CarritoContext'
import { SystemProvider } from '@/contexts/SystemIntegrationContext'
import { AppLayout } from '@/layouts/AppLayout'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { LoginNew } from '@/pages/LoginNew'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PanelMenuConfig } from '@/components/admin/PanelMenuConfig'
import { EmpresasView } from '@/components/admin'
import { SuperAdminView } from '@/components/dashboard/SuperAdminView'
import { Dashboard } from '@/pages/Dashboard'
import { Agenda } from '@/pages/Agenda'
import { ExamenesOcupacionales } from '@/pages/ExamenesOcupacionales'
import { EvaluacionesRiesgo } from '@/pages/EvaluacionesRiesgo'
import { Reportes } from '@/pages/Reportes'
import { IA } from '@/pages/IA'
import { Facturacion } from '@/pages/Facturacion'
import { Inventario } from '@/pages/Inventario'
import { Configuracion } from '@/pages/Configuracion'
import { UsuariosEmpresa } from './pages/UsuariosEmpresa'
import { usePreferences } from '@/hooks/usePreferences'
import { Pacientes } from '@/pages/Pacientes'
import HistorialClinico from '@/pages/HistorialClinico'
import { Certificaciones } from '@/pages/Certificaciones'
import { RayosX } from '@/pages/RayosX'
import { NuevaCita } from '@/pages/NuevaCita'
import { PerfilUsuario } from '@/pages/PerfilUsuario'
import { AlertasMedicas } from '@/pages/AlertasMedicas'
import Tienda from '@/pages/Tienda'
import Home from '@/pages/Home'
import ExtractorMedico from '@/pages/apps/ExtractorMedico'
import RRHH from '@/pages/rrhh/RRHH'
import './App.css'
import '@/components/medicina/hc_rx_v2.css'

function AppNew() {
  return (
    <AuthProvider>
      <SystemProvider>
        <CarritoProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<StartRedirect />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginNew />} />

                {/* ======================================================== */}
                {/* 🔧 PLATFORM ROUTES (SaaS Admin: Super Admin, Socios)    */}
                {/* ======================================================== */}
                <Route path="platform" element={
                  <ProtectedRoute requiredRoles={['super_admin', 'admin_saas', 'contador_saas']}>
                    <PlatformLayout />
                  </ProtectedRoute>
                }>
                  {/* Redirección por defecto en plataforma */}
                  <Route index element={<Navigate to="dashboard" replace />} />

                  <Route path="dashboard" element={<SuperAdminView />} />
                  <Route path="empresas" element={<EmpresasView />} />
                  <Route path="usuarios" element={<UsuariosEmpresa />} />
                  <Route path="rrhh" element={<RRHH />} />
                  <Route path="configuracion" element={<Configuracion />} />
                  <Route path="ia" element={<IA />} />

                  {/* Módulos Clínicos (Acceso Administrativo) */}
                  <Route path="pacientes" element={<Pacientes />} />
                  <Route path="pacientes/:id/historial" element={<HistorialClinico />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="examenes" element={<ExamenesOcupacionales />} />
                  <Route path="rayos-x" element={<RayosX />} />
                  <Route path="reportes" element={<Reportes />} />
                  <Route path="facturacion" element={<Facturacion />} />
                  <Route path="tienda" element={<Tienda />} />
                  <Route path="alertas" element={<AlertasMedicas />} />

                  {/* Fallback platform */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>


                {/* ======================================================== */}
                {/* 🏥 APP ROUTES (Tenant: Clínicas, Médicos, Pacientes)   */}
                {/* ======================================================== */}
                <Route path="app" element={
                  <ProtectedRoute requiredRoles={['admin_empresa', 'medico', 'enfermera', 'recepcion', 'paciente', 'asistente']}>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  {/* Redirección por defecto en app */}
                  <Route index element={<Navigate to="dashboard" replace />} />

                  <Route path="dashboard" element={<Dashboard />} />

                  {/* Módulos Clínicos */}
                  <Route path="pacientes" element={<Pacientes />} />
                  <Route path="pacientes/:id/historial" element={<HistorialClinico />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="agenda/nueva" element={<NuevaCita />} />
                  <Route path="examenes" element={<ExamenesOcupacionales />} />
                  <Route path="rayos-x" element={<RayosX />} />
                  <Route path="evaluaciones" element={<EvaluacionesRiesgo />} />
                  <Route path="certificaciones" element={<Certificaciones />} />

                  {/* Módulos Administrativos */}
                  <Route path="facturacion" element={<Facturacion />} />
                  <Route path="inventario" element={<Inventario />} />
                  <Route path="reportes" element={<Reportes />} />
                  <Route path="ia" element={<IA />} />
                  <Route path="tienda" element={<Tienda />} />

                  {/* Módulos Personales */}
                  <Route path="perfil" element={<PerfilUsuario />} />
                  <Route path="alertas" element={<AlertasMedicas />} />

                  {/* Rutas Legacy (para compatibilidad interna si algo apunta mal) */}
                  <Route path="medicos" element={<Pacientes />} />
                  <Route path="sedes" element={<Configuracion />} />

                  {/* Fallback app */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Catch-all global fuera de grupos */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Toast notifications espectaculares */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#1f2937',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    borderRadius: '1rem',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '16px',
                  },
                  success: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                      borderLeft: '4px solid #10B981',
                    },
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                      borderLeft: '4px solid #EF4444',
                    },
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                  loading: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                      borderLeft: '4px solid #3B82F6',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </CarritoProvider>
      </SystemProvider>
    </AuthProvider>
  )
}

export default AppNew

// Redirección inicial inteligente basada en rol
function StartRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <div>Cargando...</div>
  if (!user) return <LoginNew />

  // Lógica de enrutamiento SaaS
  const PLATFORM_ROLES = ['super_admin', 'admin_saas', 'contador_saas']

  if (PLATFORM_ROLES.includes(user.rol)) {
    return <Navigate to="/platform/dashboard" replace />
  } else {
    return <Navigate to="/app/dashboard" replace />
  }
}
