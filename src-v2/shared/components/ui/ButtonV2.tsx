/**
 * 🔘 BUTTON V2
 * 
 * Mejoras sobre V1:
 * - Loading states con spinner
 * - Confirmaciones en acciones destructivas
 * - Validación de permisos integrada
 * - Manejo de errores automático
 * - Mejor accesibilidad
 */

import React, { useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '../../../modules/auth-v2/components/AuthProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ============================================
// TIPOS
// ============================================

interface ButtonV2Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'primary';
  
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  
  /** Estado de carga */
  isLoading?: boolean;
  
  /** Texto a mostrar durante carga */
  loadingText?: string;
  
  /** Requiere confirmación antes de ejecutar */
  confirmAction?: boolean;
  
  /** Título del diálogo de confirmación */
  confirmTitle?: string;
  
  /** Descripción del diálogo de confirmación */
  confirmDescription?: string;
  
  /** Texto del botón de confirmación */
  confirmButtonText?: string;
  
  /** Permiso requerido para mostrar el botón */
  requirePermission?: {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  };
  
  /** Callback cuando ocurre un error */
  onError?: (error: Error) => void;
  
  /** Callback cuando la acción tiene éxito */
  onSuccess?: () => void;
  
  /** Icono a mostrar antes del texto */
  icon?: React.ReactNode;
  
  /** Icono a mostrar después del texto */
  iconRight?: React.ReactNode;
  
  /** Mostrar badge de notificación */
  badge?: number | string;
  
  /** Tooltip text */
  tooltip?: string;
}

// ============================================
// COMPONENTE
// ============================================

export const ButtonV2 = React.forwardRef<HTMLButtonElement, ButtonV2Props>(
  ({
    children,
    variant = 'default',
    size = 'md',
    isLoading = false,
    loadingText,
    confirmAction = false,
    confirmTitle = '¿Estás seguro?',
    confirmDescription = 'Esta acción no se puede deshacer.',
    confirmButtonText = 'Confirmar',
    requirePermission,
    onClick,
    onError,
    onSuccess,
    disabled,
    icon,
    iconRight,
    badge,
    tooltip,
    className,
    ...props
  }, ref) => {
    // Estado interno
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    // Contexto de auth para permisos
    const auth = useAuthContext();

    // Verificar permisos
    if (requirePermission && !auth.hasPermission(
      requirePermission.resource,
      requirePermission.action
    )) {
      return null; // No renderizar si no tiene permisos
    }

    // Manejar click
    const handleClick = useCallback(async (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      // Si requiere confirmación, abrir diálogo
      if (confirmAction && !isConfirmOpen) {
        setIsConfirmOpen(true);
        return;
      }

      // Ejecutar acción
      if (onClick) {
        setIsProcessing(true);
        setError(null);

        try {
          await onClick(e);
          onSuccess?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError?.(error);
        } finally {
          setIsProcessing(false);
        }
      }
    }, [confirmAction, isConfirmOpen, onClick, onSuccess, onError]);

    // Confirmar acción destructiva
    const handleConfirm = async () => {
      setIsConfirmOpen(false);
      
      if (onClick) {
        setIsProcessing(true);
        setError(null);

        try {
          // Crear evento sintético para compatibilidad
          const syntheticEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
          } as React.MouseEvent<HTMLButtonElement>;
          
          await onClick(syntheticEvent);
          onSuccess?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError?.(error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    // Estilos base
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    // Variantes
    const variants = {
      default: 'bg-gray-900 text-white hover:bg-gray-800',
      primary: 'bg-[#00BFA6] text-white hover:bg-[#00A896] shadow-sm',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      ghost: 'text-gray-700 hover:bg-gray-100',
      link: 'text-[#00BFA6] underline-offset-4 hover:underline',
    };

    // Tamaños
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10',
    };

    // Estados
    const isDisabled = disabled || isLoading || isProcessing;
    const showLoading = isLoading || isProcessing;
    const currentVariant = error ? 'destructive' : variant;

    // Botón base
    const ButtonContent = (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[currentVariant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        title={tooltip}
        {...props}
      >
        {showLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!showLoading && icon && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {showLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children
        )}
        
        {!showLoading && iconRight && (
          <span className="flex-shrink-0">{iconRight}</span>
        )}
        
        {badge !== undefined && (
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
            {badge}
          </span>
        )}
        
        {error && (
          <AlertCircle className="h-4 w-4 ml-1" />
        )}
      </button>
    );

    // Si no requiere confirmación, retornar botón simple
    if (!confirmAction) {
      return ButtonContent;
    }

    // Si requiere confirmación, envolver en AlertDialog
    return (
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogTrigger asChild>
          {ButtonContent}
        </AlertDialogTrigger>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                variant === 'destructive' && 'bg-red-600 hover:bg-red-700'
              )}
            >
              {showLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                confirmButtonText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

ButtonV2.displayName = 'ButtonV2';

// ============================================
// UTILIDADES
// ============================================

/**
 * Botón de acción destructiva preconfigurado
 */
export function DeleteButton(props: Omit<ButtonV2Props, 'variant' | 'confirmAction'>) {
  return (
    <ButtonV2
      variant="destructive"
      confirmAction
      confirmTitle="¿Eliminar permanentemente?"
      confirmDescription="Esta acción no se puede deshacer. El elemento se eliminará permanentemente de la base de datos."
      confirmButtonText="Eliminar"
      icon={<TrashIcon />}
      {...props}
    />
  );
}

/**
 * Botón de guardar con loading preconfigurado
 */
export function SaveButton(props: Omit<ButtonV2Props, 'variant' | 'loadingText'>) {
  return (
    <ButtonV2
      variant="primary"
      loadingText="Guardando..."
      icon={<SaveIcon />}
      {...props}
    />
  );
}

// Iconos simples
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}


