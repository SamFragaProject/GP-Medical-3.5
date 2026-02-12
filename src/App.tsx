// Aplicación principal del ERP Médico - v3.5.6-stable
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CarritoProvider } from '@/contexts/CarritoContext'
import { SystemProvider } from '@/contexts/SystemIntegrationContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AbilityProvider } from '@/providers/AbilityProvider'
import { GPMedicalProvider } from '@/providers/GPMedicalProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Loader2 } from 'lucide-react'
import './App.css'

// ============================================
// LAZY LOADING: Cada página se carga bajo demanda (Plan Mejoras Fase 6.1)
// ============================================
const Dashboard = React.lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Pacientes = React.lazy(() => import('@/pages/Pacientes').then(m => ({ default: m.Pacientes })))
const Agenda = React.lazy(() => import('@/pages/Agenda').then(m => ({ default: m.Agenda })))
const NuevaCita = React.lazy(() => import('@/pages/NuevaCita').then(m => ({ default: m.NuevaCita })))
const ExamenesOcupacionales = React.lazy(() => import('@/pages/ExamenesOcupacionales').then(m => ({ default: m.ExamenesOcupacionales })))
const EvaluacionesRiesgo = React.lazy(() => import('@/pages/EvaluacionesRiesgo').then(m => ({ default: m.EvaluacionesRiesgo })))
const Reportes = React.lazy(() => import('@/pages/Reportes').then(m => ({ default: m.Reportes })))
const IA = React.lazy(() => import('@/pages/IA').then(m => ({ default: m.IA })))
const VigilanciaEpidemiologica = React.lazy(() => import('@/components/reportes/VigilanciaEpidemiologica').then(m => ({ default: m.VigilanciaEpidemiologica })))
const Facturacion = React.lazy(() => import('@/pages/Facturacion'))
const InventoryPage = React.lazy(() => import('@/pages/inventory/InventoryPage'))
const Configuracion = React.lazy(() => import('@/pages/Configuracion').then(m => ({ default: m.Configuracion })))
const Certificaciones = React.lazy(() => import('@/pages/Certificaciones').then(m => ({ default: m.Certificaciones })))
const RayosX = React.lazy(() => import('@/pages/RayosX').then(m => ({ default: m.RayosX })))
const PerfilUsuario = React.lazy(() => import('@/pages/PerfilUsuario').then(m => ({ default: m.PerfilUsuario })))
const AlertasMedicas = React.lazy(() => import('@/pages/AlertasMedicas').then(m => ({ default: m.AlertasMedicas })))
const Tienda = React.lazy(() => import('@/pages/Tienda'))
const LoginPage = React.lazy(() => import('@/pages/Login'))
const RegisterPage = React.lazy(() => import('@/pages/Register'))
const Home = React.lazy(() => import('@/pages/Home'))
const AceptarInvitacion = React.lazy(() => import('@/pages/AceptarInvitacion'))
const ExtractorMedico = React.lazy(() => import('@/pages/apps/ExtractorMedico'))
const GeneradorReportes = React.lazy(() => import('@/pages/apps/GeneradorReportes'))
const RRHH = React.lazy(() => import('@/pages/rrhh/RRHH'))
const GestionEmpresas = React.lazy(() => import('@/pages/admin/GestionEmpresas'))
const Usuarios = React.lazy(() => import('@/pages/Usuarios').then(m => ({ default: m.Usuarios })))
const HistorialClinico = React.lazy(() => import('@/pages/HistorialClinico'))
const Sedes = React.lazy(() => import('@/pages/Sedes'))
const Medicos = React.lazy(() => import('@/pages/Medicos'))
const Resultados = React.lazy(() => import('@/pages/Resultados'))
const MisCitas = React.lazy(() => import('@/pages/MisCitas'))
const GestionRoles = React.lazy(() => import('@/pages/admin/GestionRoles'))
const GestionUsuariosEmpresa = React.lazy(() => import('@/pages/admin/GestionUsuariosEmpresa'))
const SuperAdminGodMode = React.lazy(() => import('@/pages/admin/SuperAdminGodMode'))
const RiesgosTrabajo = React.lazy(() => import('@/pages/RiesgosTrabajo'))
const DashboardLuxury = React.lazy(() => import('@/pages/admin/DashboardLuxury'))
const LogsView = React.lazy(() => import('@/pages/admin/LogsView'))
const PluginMarketplace = React.lazy(() => import('@/pages/admin/PluginMarketplace').then(m => ({ default: m.PluginMarketplace })))
const AIWorkbench = React.lazy(() => import('@/pages/admin/AIWorkbench').then(m => ({ default: m.AIWorkbench })))
const WebhookSimulator = React.lazy(() => import('@/pages/admin/WebhookSimulator'))
const Nom035 = React.lazy(() => import('@/pages/normatividad/Nom035'))
const Nom036 = React.lazy(() => import('@/pages/normatividad/Nom036'))
const LeySilla = React.lazy(() => import('@/pages/normatividad/LeySilla'))
const Suscripcion = React.lazy(() => import('@/pages/admin/Suscripcion'))
const AvisoPrivacidad = React.lazy(() => import('@/pages/legal/AvisoPrivacidad'))
const TerminosCondiciones = React.lazy(() => import('@/pages/legal/TerminosCondiciones'))
const EstudiosMedicos = React.lazy(() => import('@/pages/medicina/EstudiosMedicos'))
const MatrizRiesgos = React.lazy(() => import('@/pages/medicina/MatrizRiesgos'))
const ProgramaAnualSalud = React.lazy(() => import('@/pages/medicina/ProgramaAnualSalud'))
const RecetaMedica = React.lazy(() => import('@/pages/medicina/RecetaMedica'))
const Incapacidades = React.lazy(() => import('@/pages/medicina/Incapacidades'))
const PanelMenuConfig = React.lazy(() => import('@/components/admin/PanelMenuConfig').then(m => ({ default: m.PanelMenuConfig })))
const AdminDashboardWrapper = React.lazy(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboardWrapper })))
const AIChatWidget = React.lazy(() => import('@/components/ia/AIChatWidget').then(m => ({ default: m.AIChatWidget })))

// === AGENT SWARM: Nuevos módulos ERP Pro (lazy) ===
const ListaDictamenes = React.lazy(() => import('@/components/dictamenes').then(m => ({ default: m.ListaDictamenes })))
const DictamenWizard = React.lazy(() => import('@/components/dictamenes').then(m => ({ default: m.DictamenWizard })))
const ProgramaAnualNOM011 = React.lazy(() => import('@/components/nom011').then(m => ({ default: m.ProgramaAnualNOM011 })))
const AudiometriaForm = React.lazy(() => import('@/components/nom011').then(m => ({ default: m.AudiometriaForm })))
const EvaluacionREBA = React.lazy(() => import('@/components/nom036').then(m => ({ default: m.EvaluacionREBA })))
const EvaluacionNIOSH = React.lazy(() => import('@/components/nom036').then(m => ({ default: m.EvaluacionNIOSH })))
const PipelineEpisodios = React.lazy(() => import('@/components/episodios').then(m => ({ default: m.PipelineEpisodios })))
const ColaTrabajo = React.lazy(() => import('@/components/episodios').then(m => ({ default: m.ColaTrabajo })))
const CheckInRecepcion = React.lazy(() => import('@/components/episodios').then(m => ({ default: m.CheckInRecepcion })))
const NuevoEpisodioWizard = React.lazy(() => import('@/components/episodios').then(m => ({ default: m.NuevoEpisodioWizard })))
const ExpedienteClinicoPro = React.lazy(() => import('@/pages/medicina/ExpedienteClinicoPro'))
const KioscoHome = React.lazy(() => import('@/pages/kiosco/KioscoHome'))
const Identificacion = React.lazy(() => import('@/pages/kiosco/Identificacion'))
const RegistroRapido = React.lazy(() => import('@/pages/kiosco/RegistroRapido'))
const FirmaConsento = React.lazy(() => import('@/pages/kiosco/FirmaConsento'))
const SalaEspera = React.lazy(() => import('@/pages/recepcion/SalaEspera'))
const PatientLayout = React.lazy(() => import('@/layouts/PatientLayout').then(m => ({ default: m.PatientLayout })))
const PatientHome = React.lazy(() => import('@/pages/pacientes/portal/PatientHome'))
const PatientAppointments = React.lazy(() => import('@/pages/pacientes/portal/PatientAppointments'))
const PatientHealth = React.lazy(() => import('@/pages/pacientes/portal/PatientHealth'))
const PatientProfile = React.lazy(() => import('@/pages/pacientes/portal/PatientProfile'))
const NotFound = React.lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))
const Campanias = React.lazy(() => import('@/pages/Campanias'))
const Cotizaciones = React.lazy(() => import('@/pages/Cotizaciones'))
const CuentasPorCobrar = React.lazy(() => import('@/pages/CuentasPorCobrar'))
const EspirometriaPage = React.lazy(() => import('@/pages/Espirometria'))
const EstudiosVisualesPage = React.lazy(() => import('@/pages/EstudiosVisuales'))
const EmpresaDashboardPage = React.lazy(() => import('@/components/dashboard/EmpresaDashboard'))
const CosteoAnalysis = React.lazy(() => import('@/components/billing/CosteoAnalysis'))
const OrdenesServicio = React.lazy(() => import('@/pages/OrdenesServicio'))
const LotesInventario = React.lazy(() => import('@/components/inventario/LotesInventario'))
const EvidenciasSTPSPage = React.lazy(() => import('@/pages/legal/EvidenciasSTPS'))
const ExpedienteMaestro = React.lazy(() => import('@/pages/ExpedienteMaestro').then(m => ({ default: m.ExpedienteMaestro })))
const IntelligenceBureau = React.lazy(() => import('@/pages/IntelligenceBureau').then(m => ({ default: m.IntelligenceBureau })))
const OnboardingWizard = React.lazy(() => import('@/components/onboarding/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })))

// Chatbot V2 - Cargado dinámicamente según feature flag
const ChatbotV2 = import.meta.env.VITE_USE_CHATBOT_V2 === 'true'
  ? React.lazy(() => import('../src-v2/modules/chatbot-v2/components/ChatbotWidget'))
  : null

// Fallback de carga para Suspense
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      <p className="mt-3 text-sm text-gray-500 font-medium">Cargando módulo...</p>
    </div>
  )
}

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
                    <Suspense fallback={<PageLoader />}>
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
                        {/* Rutas Protegidas Ensueltas en Layout */}
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                          <Route path="/dashboard" element={<ProtectedRoute resource="dashboard"><Dashboard /></ProtectedRoute>} />
                          <Route path="/onboarding" element={<OnboardingWizard />} />

                          {/* Redirecciones Estructurales */}
                          <Route path="/normatividad" element={<Navigate to="/normatividad/nom035" replace />} />
                          <Route path="/episodios" element={<Navigate to="/episodios/pipeline" replace />} />

                          <Route path="/pacientes" element={<Navigate to="/medicina/expediente" replace />} />
                          <Route path="/medicina/expediente" element={<ProtectedRoute resource="pacientes"><ExpedienteMaestro /></ProtectedRoute>} />
                          <Route path="/medicina/expediente/:id" element={<ProtectedRoute resource="pacientes"><ExpedienteMaestro /></ProtectedRoute>} />
                          <Route path="/normatividad/nom035" element={<ProtectedRoute resource="normatividad"><Nom035 /></ProtectedRoute>} />
                          <Route path="/normatividad/nom036" element={<ProtectedRoute resource="normatividad"><Nom036 /></ProtectedRoute>} />
                          <Route path="/normatividad/ley-silla" element={<ProtectedRoute resource="normatividad"><LeySilla /></ProtectedRoute>} />
                          <Route path="/agenda" element={<ProtectedRoute resource="agenda"><Agenda /></ProtectedRoute>} />
                          <Route path="/agenda/nueva" element={<ProtectedRoute resource="agenda"><NuevaCita /></ProtectedRoute>} />
                          <Route path="/alertas" element={<ProtectedRoute resource="alertas"><AlertasMedicas /></ProtectedRoute>} />
                          <Route path="/medicina/programa-anual" element={<ProtectedRoute resource="examenes"><ProgramaAnualSalud /></ProtectedRoute>} />
                          <Route path="/examenes" element={<ProtectedRoute resource="examenes"><ExamenesOcupacionales /></ProtectedRoute>} />
                          <Route path="/rayos-x" element={<ProtectedRoute resource="rayos_x"><RayosX /></ProtectedRoute>} />
                          <Route path="/riesgos-trabajo" element={<ProtectedRoute resource="riesgos_trabajo"><RiesgosTrabajo /></ProtectedRoute>} />
                          <Route path="/empresas" element={<ProtectedRoute resource="empresas"><GestionEmpresas /></ProtectedRoute>} />
                          <Route path="/usuarios" element={<ProtectedRoute resource="usuarios"><Usuarios /></ProtectedRoute>} />
                          <Route path="/sedes" element={<ProtectedRoute resource="sedes"><Sedes /></ProtectedRoute>} />
                          <Route path="/inventario" element={<ProtectedRoute resource="inventario"><InventoryPage /></ProtectedRoute>} />
                          <Route path="/historial" element={<Navigate to="/medicina/expediente" replace />} />
                          <Route path="/historial/:id" element={<Navigate to="/medicina/expediente" replace />} />
                          <Route path="/pacientes/:pacienteId/expediente" element={<ProtectedRoute resource="historial"><ExpedienteClinicoPro /></ProtectedRoute>} />
                          <Route path="/medicos" element={<ProtectedRoute resource="medicos"><Medicos /></ProtectedRoute>} />
                          <Route path="/resultados" element={<ProtectedRoute resource="resultados"><Resultados /></ProtectedRoute>} />
                          <Route path="/citas" element={<ProtectedRoute resource="citas"><MisCitas /></ProtectedRoute>} />
                          <Route path="/evaluaciones" element={<ProtectedRoute resource="evaluaciones"><EvaluacionesRiesgo /></ProtectedRoute>} />
                          <Route path="/ia" element={<ProtectedRoute resource="ia"><IntelligenceBureau /></ProtectedRoute>} />
                          <Route path="/apps/extractor" element={<Navigate to="/ia" replace />} />
                          <Route path="/medicina/estudios" element={<ProtectedRoute resource="examenes"><EstudiosMedicos /></ProtectedRoute>} />
                          <Route path="/medicina/matriz-riesgos" element={<ProtectedRoute resource="evaluaciones"><MatrizRiesgos /></ProtectedRoute>} />
                          <Route path="/medicina/recetas" element={<ProtectedRoute resource="prescripcion"><RecetaMedica /></ProtectedRoute>} />
                          <Route path="/medicina/incapacidades" element={<ProtectedRoute resource="prescripcion"><Incapacidades /></ProtectedRoute>} />
                          <Route path="/apps/reportes" element={<ProtectedRoute resource="ia"><GeneradorReportes /></ProtectedRoute>} />
                          <Route path="/certificaciones" element={<ProtectedRoute resource="certificaciones"><Certificaciones /></ProtectedRoute>} />
                          <Route path="/tienda" element={<ProtectedRoute resource="tienda"><Tienda /></ProtectedRoute>} />
                          <Route path="/facturacion" element={<ProtectedRoute resource="facturacion"><Facturacion /></ProtectedRoute>} />
                          <Route path="/reportes" element={<ProtectedRoute resource="reportes"><Reportes /></ProtectedRoute>} />
                          <Route path="/reportes/vigilancia" element={<ProtectedRoute resource="reportes"><VigilanciaEpidemiologica /></ProtectedRoute>} />
                          <Route path="/configuracion" element={<ProtectedRoute resource="configuracion"><Configuracion /></ProtectedRoute>} />
                          <Route path="/roles" element={<ProtectedRoute resource="roles_permisos"><GestionRoles /></ProtectedRoute>} />
                          <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
                          <Route path="/rrhh" element={<ProtectedRoute resource="rrhh"><RRHH /></ProtectedRoute>} />
                          <Route path="/recepcion/sala-espera" element={<ProtectedRoute resource="agenda"><SalaEspera /></ProtectedRoute>} />
                          <Route path="/admin/suscripcion" element={<ProtectedRoute resource="configuracion"><Suscripcion /></ProtectedRoute>} />
                          <Route path="/admin/menu-config" element={<ProtectedRoute resource="sistema"><PanelMenuConfig /></ProtectedRoute>} />
                          <Route path="/admin/dashboard" element={<ProtectedRoute resource="sistema"><AdminDashboardWrapper /></ProtectedRoute>} />
                          <Route path="/admin/god-mode" element={<ProtectedRoute resource="sistema"><SuperAdminGodMode /></ProtectedRoute>} />
                          <Route path="/admin/empresas" element={<ProtectedRoute resource="empresas"><GestionEmpresas /></ProtectedRoute>} />
                          <Route path="/admin/usuarios" element={<ProtectedRoute resource="usuarios"><Usuarios /></ProtectedRoute>} />
                          <Route path="/admin/roles" element={<ProtectedRoute resource="roles_permisos"><GestionRoles /></ProtectedRoute>} />
                          <Route path="/admin/empresas/:empresaId/usuarios" element={<ProtectedRoute resource="usuarios"><GestionUsuariosEmpresa /></ProtectedRoute>} />
                          <Route path="/admin/empresas/:empresaId/roles" element={<ProtectedRoute resource="roles_permisos"><GestionRoles /></ProtectedRoute>} />
                          <Route path="/admin/logs" element={<ProtectedRoute resource="sistema"><LogsView /></ProtectedRoute>} />
                          <Route path="/admin/marketplace" element={<ProtectedRoute resource="sistema"><PluginMarketplace /></ProtectedRoute>} />
                          <Route path="/admin/ai-workbench" element={<ProtectedRoute resource="sistema"><AIWorkbench /></ProtectedRoute>} />
                          <Route path="/admin/webhooks" element={<ProtectedRoute resource="sistema"><WebhookSimulator /></ProtectedRoute>} />
                          <Route path="/admin/luxury-dashboard" element={<ProtectedRoute resource="sistema"><DashboardLuxury /></ProtectedRoute>} />

                          {/* === AGENT SWARM: Rutas ERP Pro === */}
                          {/* Dictámenes Médico-Laborales */}
                          <Route path="/medicina/dictamenes" element={<ProtectedRoute resource="dictamenes"><DictamenesRouteWrapper /></ProtectedRoute>} />
                          <Route path="/medicina/dictamenes/nuevo" element={<ProtectedRoute resource="dictamenes"><DictamenWizardWrapper /></ProtectedRoute>} />
                          <Route path="/medicina/dictamenes/:id" element={<ProtectedRoute resource="dictamenes"><DictamenWizardWrapper /></ProtectedRoute>} />

                          {/* NOM-011 Conservación Auditiva */}
                          <Route path="/nom-011/programa" element={<ProtectedRoute resource="nom011"><ProgramaAnualNOM011 /></ProtectedRoute>} />
                          <Route path="/nom-011/audiometria/nuevo" element={<ProtectedRoute resource="nom011"><AudiometriaFormWrapper /></ProtectedRoute>} />

                          {/* NOM-036 Ergonomía */}
                          <Route path="/nom-036/evaluacion/reba" element={<ProtectedRoute resource="nom036"><EvaluacionREBAWrapper /></ProtectedRoute>} />
                          <Route path="/nom-036/evaluacion/niosh" element={<ProtectedRoute resource="nom036"><EvaluacionNIOSHWrapper /></ProtectedRoute>} />

                          {/* Motor de Flujos - Episodios */}
                          <Route path="/episodios/pipeline" element={<ProtectedRoute resource="episodios"><PipelineEpisodios sedeId="demo-sede" /></ProtectedRoute>} />
                          <Route path="/episodios/cola/:tipo" element={<ProtectedRoute resource="episodios"><ColaTrabajoWrapper /></ProtectedRoute>} />
                          <Route path="/recepcion/checkin" element={<ProtectedRoute resource="recepcion"><CheckInRecepcion sedeId="demo-sede" /></ProtectedRoute>} />
                          <Route path="/recepcion/episodio/nuevo" element={<ProtectedRoute resource="recepcion"><NuevoEpisodioWrapper /></ProtectedRoute>} />

                          {/* Campañas Masivas */}
                          <Route path="/campanias" element={<ProtectedRoute resource="campanias"><Campanias /></ProtectedRoute>} />
                          {/* Cotizaciones */}
                          <Route path="/cotizaciones" element={<ProtectedRoute resource="cotizaciones"><Cotizaciones /></ProtectedRoute>} />
                          {/* Cuentas por Cobrar */}
                          <Route path="/cxc" element={<ProtectedRoute resource="cxc"><CuentasPorCobrar /></ProtectedRoute>} />
                          {/* Espirometría */}
                          <Route path="/espirometria" element={<ProtectedRoute resource="espirometria"><EspirometriaPage /></ProtectedRoute>} />
                          {/* Estudios Visuales */}
                          <Route path="/vision" element={<ProtectedRoute resource="vision"><EstudiosVisualesPage /></ProtectedRoute>} />
                          {/* Dashboard Empresa */}
                          <Route path="/dashboard-empresa" element={<ProtectedRoute resource="dashboard"><EmpresaDashboardPage /></ProtectedRoute>} />
                          {/* Finanzas: Costeo */}
                          <Route path="/admin/costeo" element={<ProtectedRoute resource="facturacion"><CosteoAnalysis /></ProtectedRoute>} />
                          {/* Operaciones: Órdenes de Servicio */}
                          <Route path="/operaciones/ordenes" element={<ProtectedRoute resource="agenda"><OrdenesServicio /></ProtectedRoute>} />
                          {/* Inventario: Lotes y Caducidades */}
                          <Route path="/inventario/lotes" element={<ProtectedRoute resource="inventario"><LotesInventario /></ProtectedRoute>} />
                          {/* Legal: Evidencias STPS */}
                          <Route path="/legal/evidencias" element={<ProtectedRoute resource="reportes"><EvidenciasSTPSPage /></ProtectedRoute>} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>

                    <Toaster />
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
