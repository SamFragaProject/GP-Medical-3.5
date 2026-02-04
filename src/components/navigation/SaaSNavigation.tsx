// Navegación adaptativa SaaS - Sistema dinámico personalizado
import React from 'react'
import { MenuPersonalizado } from './MenuPersonalizado'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  permission?: {
    resource?: string
    action?: string
    hierarchy?: string | string[]
  }
  badge?: string
  children?: NavigationItem[]
}

// ⚠️ COMPONENTE DEPRECADO - Usar MenuPersonalizado.tsx en su lugar
// 
// Este componente SaaSNavigation ha sido reemplazado por el sistema dinámico MenuPersonalizado
// que permite configuración basada en permisos de base de datos.
//
// Para usar el nuevo sistema, reemplace:
//   import { SaaSNavigation } from '@/components/navigation/SaaSNavigation'
// Por:
//   import { MenuPersonalizado } from '@/components/navigation/MenuPersonalizado'
//
// El nuevo sistema ofrece:
// - Menús personalizados por usuario
// - Permisos cargados desde base de datos
// - Cache para mejor performance
// - Actualización en tiempo real
// - Configuración dinámica por jerarquía
//
// Fecha de deprecación: 2025-11-04
// Versión: 2.0.0

interface NavigationProps {
  className?: string
}

/**
 * @deprecated Use MenuPersonalizado instead
 * @see MenuPersonalizado
 */
export function SaaSNavigation({ className = '' }: NavigationProps) {
  // Delegar al nuevo sistema dinámico
  return (
    <div className={className}>
      <MenuPersonalizado />
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2 text-yellow-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Sistema de Menús Actualizado</span>
        </div>
        <p className="mt-2 text-sm text-yellow-700">
          Este componente ha sido reemplazado por MenuPersonalizado.tsx para soporte de menús dinámicos.
        </p>
      </div>
    </div>
  )
}

/**
 * @deprecated Use MenuHierarchyIndicator from MenuPersonalizado instead
 * @see MenuHierarchyIndicator
 */
export function HierarchyIndicator() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 text-amber-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Componente Actualizado</span>
      </div>
      <p className="mt-2 text-sm text-amber-700">
        Use MenuHierarchyIndicator desde MenuPersonalizado para la nueva funcionalidad.
      </p>
    </div>
  )
}
