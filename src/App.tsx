// Aplicación principal del ERP Médico
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AIChatWidget } from '@/components/ia/AIChatWidget'
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
import Facturacion from '@/pages/Facturacion'
import InventoryPage from '@/pages/inventory/InventoryPage'
import { Configuracion } from '@/pages/Configuracion'
import { Pacientes } from '@/pages/Pacientes'
import { Certificaciones } from '@/pages/Certificaciones'
import { RayosX } from '@/pages/RayosX'
import { NuevaCita } from '@/pages/NuevaCita'
import { PerfilUsuario } from '@/pages/PerfilUsuario'
import { AlertasMedicas } from '@/pages/AlertasMedicas'
import Tienda from '@/pages/Tienda'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import Home from '@/pages/Home'
import AceptarInvitacion from '@/pages/AceptarInvitacion'
import './App.css'
import ExtractorMedico from '@/pages/apps/ExtractorMedico'
import GeneradorReportes from '@/pages/apps/GeneradorReportes'
import RRHH from '@/pages/rrhh/RRHH'
import GestionEmpresas from '@/pages/admin/GestionEmpresas'
import { Usuarios } from '@/pages/Usuarios'
import HistorialClinico from '@/pages/HistorialClinico'
import Sedes from '@/pages/Sedes'
import Medicos from '@/pages/Medicos'
import Resultados from '@/pages/Resultados'
import MisCitas from '@/pages/MisCitas'
import GestionRoles from '@/pages/admin/GestionRoles'
import GestionUsuariosEmpresa from '@/pages/admin/GestionUsuariosEmpresa'
import SuperAdminGodMode from '@/pages/admin/SuperAdminGodMode'
import RiesgosTrabajo from '@/pages/RiesgosTrabajo'
import DashboardLuxury from '@/pages/admin/DashboardLuxury'
import LogsView from '@/pages/admin/LogsView'
import { PluginMarketplace } from '@/pages/admin/PluginMarketplace'
import { AIWorkbench } from '@/pages/admin/AIWorkbench'
import WebhookSimulator from '@/pages/admin/WebhookSimulator'
import Nom035 from '@/pages/normatividad/Nom035'
import Nom036 from '@/pages/normatividad/Nom036'
import LeySilla from '@/pages/normatividad/LeySilla'
import Suscripcion from '@/pages/admin/Suscripcion'
import { AbilityProvider } from '@/providers/AbilityProvider'
import { GPMedicalProvider } from '@/providers/GPMedicalProvider'
import AvisoPrivacidad from '@/pages/legal/AvisoPrivacidad'
import TerminosCondiciones from '@/pages/legal/TerminosCondiciones'
import EstudiosMedicos from '@/pages/medicina/EstudiosMedicos'
import MatrizRiesgos from '@/pages/medicina/MatrizRiesgos'
import ProgramaAnualSalud from '@/pages/medicina/ProgramaAnualSalud'
import RecetaMedica from '@/pages/medicina/RecetaMedica'
import Incapacidades from '@/pages/medicina/Incapacidades'

// === AGENT SWARM: Nuevos módulos ERP Pro ===
import { ListaDictamenes, DictamenWizard } from '@/components/dictamenes'
import { ProgramaAnualNOM011, AudiometriaForm } from '@/components/nom011'
import { EvaluacionREBA, EvaluacionNIOSH } from '@/components/nom036'
import { PipelineEpisodios, ColaTrabajo, CheckInRecepcion, NuevoEpisodioWizard } from '@/components/episodios'
import KioscoHome from '@/pages/kiosco/KioscoHome'
import Identificacion from '@/pages/kiosco/Identificacion'
import RegistroRapido from '@/pages/kiosco/RegistroRapido'
import FirmaConsento from '@/pages/kiosco/FirmaConsento'
import SalaEspera from '@/pages/recepcion/SalaEspera'
import { PatientLayout } from '@/layouts/PatientLayout'
import PatientHome from '@/pages/pacientes/portal/PatientHome'

import PatientAppointments from '@/pages/pacientes/portal/PatientAppointments'
import PatientHealth from '@/pages/pacientes/portal/PatientHealth'
import PatientProfile from '@/pages/pacientes/portal/PatientProfile'
import { NotFound } from '@/pages/NotFound'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Chatbot V2 - Cargado dinámicamente según feature flag
const ChatbotV2 = import.meta.env.VITE_USE_CHATBOT_V2 === 'true'
  ? React.lazy(() => import('../src-v2/modules/chatbot-v2/components/ChatbotWidget'))
  : null

// === WRAPPERS PARA MÓDULOS SWARM ===
const DictamenesRouteWrapper = () => {
  const navigate = useNavigate();
  return <ListaDictamenes
    onNuevoDictamen={() => navigate('/medicina/dictamenes/nuevo')}
    onVerDictamen={(id) => navigate(`/medicina/dictamenes/${id}`)}
    onEditarDictamen={(id) => navigate(`/medicina/dictamenes/${id}`)}
  />;
};

const DictamenWizardWrapper = () => {
  const navigate = useNavigate();
  return <DictamenWizard
    onComplete={() => navigate('/medicina/dictamenes')}
    onCancel={() => navigate('/medicina/dictamenes')}
  />;
};

const AudiometriaFormWrapper = () => {
  const navigate = useNavigate();
  return <AudiometriaForm
    onSubmit={() => navigate('/nom-011/programa')}
    onCancel={() => navigate('/nom-011/programa')}
  />;
};

const EvaluacionREBAWrapper = () => {
  const navigate = useNavigate();
  return <EvaluacionREBA
    onSubmit={() => navigate('/medicina/matriz-riesgos')}
    onCancel={() => navigate('/medicina/matriz-riesgos')}
  />;
};

const EvaluacionNIOSHWrapper = () => {
  const navigate = useNavigate();
  return <EvaluacionNIOSH
    onSubmit={() => navigate('/medicina/matriz-riesgos')}
    onCancel={() => navigate('/medicina/matriz-riesgos')}
  />;
};

const ColaTrabajoWrapper = () => {
  const params = useParams();
  return <ColaTrabajo sedeId="demo-sede" tipo={params.tipo as any} />;
};

const NuevoEpisodioWrapper = () => {
  const navigate = useNavigate();
  return <NuevoEpisodioWizard sedeId="demo-sede" isOpen={true} onClose={() => navigate('/episodios/pipeline')} />;
};

function App() {
  // Limpieza de sesión forzosa para evitar conflictos de versiones anteriores
  React.useEffect(() => {
    const CLEANUP_KEY = 'v3.5.4-cleanup-executed';
    if (!localStorage.getItem(CLEANUP_KEY)) {
      console.log('🧹 Ejecutando limpieza profunda de sesión para v3.5.4...');
      localStorage.removeItem('GPMedical_user');
      localStorage.removeItem('sb-access-token');
      // No borrar todo para no perder preferencias, solo sesión
      localStorage.setItem(CLEANUP_KEY, 'true');

      // Si estamos en dashboard, redirigir a login para refrescar estado
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <GPMedicalProvider>
          <AuthProvider>
            <AbilityProvider>
              <SystemProvider>
                <CarritoProvider>
                  <div className="App">
                    <Routes>
                      {/* Ruta Raíz por defecto */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      {/* Rutas Públicas */}
                      <Route path="/home" element={<Home />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/privacidad" element={<AvisoPrivacidad />} />
                      <Route path="/terminos" element={<TerminosCondiciones />} />
                      <Route path="/aceptar-invitacion" element={<AceptarInvitacion />} />

                      {/* Kiosco */}
                      <Route path="/kiosco" element={<KioscoHome />} />
                      <Route path="/kiosco/identificacion" element={<Identificacion />} />
                      <Route path="/kiosco/registro" element={<RegistroRapido />} />
                      <Route path="/kiosco/firma" element={<FirmaConsento />} />

                      <Route path="/" element={<Home />} />

                      {/* Portal de Pacientes */}
                      <Route path="/pacientes/portal" element={
                        <ProtectedRoute>
                          <PatientLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<PatientHome />} />
                        <Route path="citas" element={<PatientAppointments />} />
                        <Route path="salud" element={<PatientHealth />} />
                        <Route path="perfil" element={<PatientProfile />} />
                      </Route>

                      {/* Rutas Protegidas */}
                      <Route path="/dashboard" element={<ProtectedRoute resource="dashboard"><Layout><Dashboard /></Layout></ProtectedRoute>} />
                      <Route path="/pacientes" element={<ProtectedRoute resource="pacientes"><Layout><Pacientes /></Layout></ProtectedRoute>} />
                      <Route path="/normatividad/nom035" element={<ProtectedRoute resource="normatividad"><Layout><Nom035 /></Layout></ProtectedRoute>} />
                      <Route path="/normatividad/nom036" element={<ProtectedRoute resource="normatividad"><Layout><Nom036 /></Layout></ProtectedRoute>} />
                      <Route path="/normatividad/ley-silla" element={<ProtectedRoute resource="normatividad"><Layout><LeySilla /></Layout></ProtectedRoute>} />
                      <Route path="/agenda" element={<ProtectedRoute resource="agenda"><Layout><Agenda /></Layout></ProtectedRoute>} />
                      <Route path="/agenda/nueva" element={<ProtectedRoute resource="agenda"><Layout><NuevaCita /></Layout></ProtectedRoute>} />
                      <Route path="/alertas" element={<ProtectedRoute resource="alertas"><Layout><AlertasMedicas /></Layout></ProtectedRoute>} />
                      <Route path="/medicina/programa-anual" element={<ProtectedRoute resource="examenes"><Layout><ProgramaAnualSalud /></Layout></ProtectedRoute>} />
                      <Route path="/examenes" element={<ProtectedRoute resource="examenes"><Layout><ExamenesOcupacionales /></Layout></ProtectedRoute>} />
                      <Route path="/rayos-x" element={<ProtectedRoute resource="rayos_x"><Layout><RayosX /></Layout></ProtectedRoute>} />
                      <Route path="/riesgos-trabajo" element={<ProtectedRoute resource="riesgos_trabajo"><Layout><RiesgosTrabajo /></Layout></ProtectedRoute>} />
                      <Route path="/empresas" element={<ProtectedRoute resource="empresas"><Layout><GestionEmpresas /></Layout></ProtectedRoute>} />
                      <Route path="/usuarios" element={<ProtectedRoute resource="usuarios"><Layout><Usuarios /></Layout></ProtectedRoute>} />
                      <Route path="/sedes" element={<ProtectedRoute resource="sedes"><Layout><Sedes /></Layout></ProtectedRoute>} />
                      <Route path="/inventario" element={<ProtectedRoute resource="inventario"><Layout><InventoryPage /></Layout></ProtectedRoute>} />
                      <Route path="/historial" element={<ProtectedRoute resource="historial"><Layout><HistorialClinico /></Layout></ProtectedRoute>} />
                      <Route path="/historial/:id" element={<ProtectedRoute resource="historial"><Layout><HistorialClinico /></Layout></ProtectedRoute>} />
                      <Route path="/medicos" element={<ProtectedRoute resource="medicos"><Layout><Medicos /></Layout></ProtectedRoute>} />
                      <Route path="/resultados" element={<ProtectedRoute resource="resultados"><Layout><Resultados /></Layout></ProtectedRoute>} />
                      <Route path="/citas" element={<ProtectedRoute resource="citas"><Layout><MisCitas /></Layout></ProtectedRoute>} />
                      <Route path="/evaluaciones" element={<ProtectedRoute resource="evaluaciones"><Layout><EvaluacionesRiesgo /></Layout></ProtectedRoute>} />
                      <Route path="/ia" element={<ProtectedRoute resource="ia"><Layout><IA /></Layout></ProtectedRoute>} />
                      <Route path="/medicina/estudios" element={<ProtectedRoute resource="examenes"><Layout><EstudiosMedicos /></Layout></ProtectedRoute>} />
                      <Route path="/medicina/matriz-riesgos" element={<ProtectedRoute resource="evaluaciones"><Layout><MatrizRiesgos /></Layout></ProtectedRoute>} />
                      <Route path="/medicina/recetas" element={<ProtectedRoute resource="prescripcion"><Layout><RecetaMedica /></Layout></ProtectedRoute>} />
                      <Route path="/medicina/incapacidades" element={<ProtectedRoute resource="prescripcion"><Layout><Incapacidades /></Layout></ProtectedRoute>} />
                      <Route path="/apps/extractor" element={<ProtectedRoute resource="ia"><Layout><ExtractorMedico /></Layout></ProtectedRoute>} />
                      <Route path="/apps/reportes" element={<ProtectedRoute resource="ia"><Layout><GeneradorReportes /></Layout></ProtectedRoute>} />
                      <Route path="/certificaciones" element={<ProtectedRoute resource="certificaciones"><Layout><Certificaciones /></Layout></ProtectedRoute>} />
                      <Route path="/tienda" element={<ProtectedRoute resource="tienda"><Layout><Tienda /></Layout></ProtectedRoute>} />
                      <Route path="/facturacion" element={<ProtectedRoute resource="facturacion"><Layout><Facturacion /></Layout></ProtectedRoute>} />
                      <Route path="/reportes" element={<ProtectedRoute resource="reportes"><Layout><Reportes /></Layout></ProtectedRoute>} />
                      <Route path="/configuracion" element={<ProtectedRoute resource="configuracion"><Layout><Configuracion /></Layout></ProtectedRoute>} />
                      <Route path="/roles" element={<ProtectedRoute resource="roles_permisos"><Layout><GestionRoles /></Layout></ProtectedRoute>} />
                      <Route path="/perfil" element={<ProtectedRoute><Layout><PerfilUsuario /></Layout></ProtectedRoute>} />
                      <Route path="/rrhh" element={<ProtectedRoute resource="rrhh"><Layout><RRHH /></Layout></ProtectedRoute>} />
                      <Route path="/recepcion/sala-espera" element={<ProtectedRoute resource="agenda"><Layout><SalaEspera /></Layout></ProtectedRoute>} />
                      <Route path="/admin/suscripcion" element={<ProtectedRoute resource="configuracion"><Layout><Suscripcion /></Layout></ProtectedRoute>} />
                      <Route path="/admin/menu-config" element={<ProtectedRoute resource="sistema"><Layout><PanelMenuConfig /></Layout></ProtectedRoute>} />
                      <Route path="/admin/dashboard" element={<ProtectedRoute resource="sistema"><Layout><AdminDashboardWrapper /></Layout></ProtectedRoute>} />
                      <Route path="/admin/god-mode" element={<ProtectedRoute resource="sistema"><Layout><SuperAdminGodMode /></Layout></ProtectedRoute>} />
                      <Route path="/admin/empresas" element={<ProtectedRoute resource="empresas"><Layout><GestionEmpresas /></Layout></ProtectedRoute>} />
                      <Route path="/admin/usuarios" element={<ProtectedRoute resource="usuarios"><Layout><Usuarios /></Layout></ProtectedRoute>} />
                      <Route path="/admin/roles" element={<ProtectedRoute resource="roles_permisos"><Layout><GestionRoles /></Layout></ProtectedRoute>} />
                      <Route path="/admin/empresas/:empresaId/usuarios" element={<ProtectedRoute resource="usuarios"><Layout><GestionUsuariosEmpresa /></Layout></ProtectedRoute>} />
                      <Route path="/admin/empresas/:empresaId/roles" element={<ProtectedRoute resource="roles_permisos"><Layout><GestionRoles /></Layout></ProtectedRoute>} />
                      <Route path="/admin/logs" element={<ProtectedRoute resource="sistema"><Layout><LogsView /></Layout></ProtectedRoute>} />
                      <Route path="/admin/marketplace" element={<ProtectedRoute resource="sistema"><Layout><PluginMarketplace /></Layout></ProtectedRoute>} />
                      <Route path="/admin/ai-workbench" element={<ProtectedRoute resource="sistema"><Layout><AIWorkbench /></Layout></ProtectedRoute>} />
                      <Route path="/admin/webhooks" element={<ProtectedRoute resource="sistema"><Layout><WebhookSimulator /></Layout></ProtectedRoute>} />
                      <Route path="/admin/luxury-dashboard" element={<ProtectedRoute resource="sistema"><DashboardLuxury /></ProtectedRoute>} />

                      {/* === AGENT SWARM: Rutas ERP Pro === */}
                      {/* Dictámenes Médico-Laborales */}
                      <Route path="/medicina/dictamenes" element={
                        <ProtectedRoute resource="dictamenes">
                          <Layout>
                            <DictamenesRouteWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/medicina/dictamenes/nuevo" element={
                        <ProtectedRoute resource="dictamenes">
                          <Layout>
                            <DictamenWizardWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/medicina/dictamenes/:id" element={
                        <ProtectedRoute resource="dictamenes">
                          <Layout>
                            <DictamenWizardWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />

                      {/* NOM-011 Conservación Auditiva */}
                      <Route path="/nom-011/programa" element={
                        <ProtectedRoute resource="nom011">
                          <Layout>
                            <ProgramaAnualNOM011 />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/nom-011/audiometria/nuevo" element={
                        <ProtectedRoute resource="nom011">
                          <Layout>
                            <AudiometriaFormWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />

                      {/* NOM-036 Ergonomía */}
                      <Route path="/nom-036/evaluacion/reba" element={
                        <ProtectedRoute resource="nom036">
                          <Layout>
                            <EvaluacionREBAWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/nom-036/evaluacion/niosh" element={
                        <ProtectedRoute resource="nom036">
                          <Layout>
                            <EvaluacionNIOSHWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />

                      {/* Motor de Flujos - Episodios */}
                      <Route path="/episodios/pipeline" element={
                        <ProtectedRoute resource="episodios">
                          <Layout>
                            <PipelineEpisodios sedeId="demo-sede" />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/episodios/cola/:tipo" element={
                        <ProtectedRoute resource="episodios">
                          <Layout>
                            <ColaTrabajoWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/recepcion/checkin" element={
                        <ProtectedRoute resource="recepcion">
                          <Layout>
                            <CheckInRecepcion sedeId="demo-sede" />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/recepcion/episodio/nuevo" element={
                        <ProtectedRoute resource="recepcion">
                          <Layout>
                            <NuevoEpisodioWrapper />
                          </Layout>
                        </ProtectedRoute>
                      } />

                      <Route path="*" element={<NotFound />} />
                    </Routes>

                    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

                    {/* Chatbot original */}
                    <AIChatWidget />

                    {/* Chatbot V2 - Cargado condicionalmente */}
                    {ChatbotV2 && (
                      <React.Suspense fallback={null}>
                        <ChatbotV2 />
                      </React.Suspense>
                    )}
                  </div>
                </CarritoProvider>
              </SystemProvider>
            </AbilityProvider>
          </AuthProvider>
        </GPMedicalProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
