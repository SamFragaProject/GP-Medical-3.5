import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
    'dashboard': 'Panel de Control',
    'pacientes': 'Pacientes',
    'medicina': 'Medicina',
    'dictamenes': 'Dictámenes',
    'nuevo': 'Nuevo',
    'editar': 'Editar',
    'nom-011': 'NOM-011 Auditiva',
    'programa': 'Programa Anual',
    'audiometria': 'Audiometría',
    'nom-036': 'NOM-036 Ergonomía',
    'evaluacion': 'Evaluación',
    'reba': 'REBA',
    'niosh': 'NIOSH',
    'episodios': 'Episodios',
    'pipeline': 'Pipeline',
    'cola': 'Colas de Trabajo',
    'recepcion': 'Recepción',
    'checkin': 'Check-in',
    'normatividad': 'Normatividad',
    'nom035': 'NOM-035',
    'nom036': 'NOM-036',
    'ley-silla': 'Ley de la Silla',
    'reportes': 'Reportes',
    'vigilancia': 'Vigilancia Epidemiológica',
    'agenda': 'Agenda',
    'nueva': 'Nueva Cita',
    'expediente': 'Expediente',
    'historial': 'Historial Clínico',
    'empresas': 'Empresas',
    'usuarios': 'Usuarios',
    'roles': 'Roles',
    'sedes': 'Sedes',
    'inventario': 'Inventario',
    'medicos': 'Médicos',
    'resultados': 'Resultados',
    'citas': 'Mis Citas',
    'evaluaciones': 'Evaluaciones de Riesgo',
    'examenes': 'Exámenes Ocupacionales',
    'facturacion': 'Facturación',
    'configuracion': 'Configuración',
    'perfil': 'Mi Perfil',
    'rrhh': 'Recursos Humanos',
    'admin': 'Administración',
    'god-mode': 'Super Admin',
    'marketplace': 'Marketplace',
    'suscripcion': 'Suscripción',
    'logs': 'Bitácora',
    'recetas': 'Recetas',
    'incapacidades': 'Incapacidades',
    'estudios': 'Estudios Médicos',
    'matriz-riesgos': 'Matriz de Riesgos',
    'programa-anual': 'Programa Anual de Salud',
    'rayos-x': 'Rayos X',
    'riesgos-trabajo': 'Riesgos de Trabajo',
    'alertas': 'Alertas Médicas',
    'certificaciones': 'Certificaciones',
    'ia': 'Inteligencia Artificial',
    'apps': 'Aplicaciones',
    'extractor': 'Extractor Médico',
    'sala-espera': 'Sala de Espera',
    'tienda': 'Tienda',
    'portal': 'Portal del Paciente',
    'salud': 'Mi Salud',
}

export function Breadcrumbs() {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x)

    if (pathnames.length === 0 || pathnames[0] === 'dashboard') return null

    return (
        <nav className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 bg-white/50 backdrop-blur-md p-2 px-4 rounded-xl border border-white/20 self-start shadow-sm">
            <Link
                to="/dashboard"
                className="flex items-center hover:text-primary transition-colors gap-1"
            >
                <Home className="w-3.5 h-3.5" />
                <span className="sr-only">Inicio</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1
                const to = `/${pathnames.slice(0, index + 1).join('/')}`
                const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1)

                return (
                    <React.Fragment key={to}>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        {last ? (
                            <span className="text-slate-900 font-black truncate max-w-[150px]">
                                {label}
                            </span>
                        ) : (
                            <Link
                                to={to}
                                className="hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </React.Fragment>
                )
            })}
        </nav>
    )
}
