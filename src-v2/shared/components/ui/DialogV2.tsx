/**
 * 🗨️ DIALOG V2
 * 
 * Mejoras sobre V1:
 * - Animaciones suaves
 * - Mejor accesibilidad
 * - Cierre con ESC o click fuera configurable
 * - Tamaños predefinidos
 * - Header con icono opcional
 */

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../src/lib/utils';

// ============================================
// TIPOS
// ============================================

interface DialogV2Props {
  /** Control de apertura */
  open: boolean;
  
  /** Callback al cambiar estado */
  onOpenChange: (open: boolean) => void;
  
  /** Contenido */
  children: React.ReactNode;
  
  /** Tamaño del diálogo */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Cerrar al hacer click fuera */
  closeOnOverlayClick?: boolean;
  
  /** Cerrar con tecla ESC */
  closeOnEscape?: boolean;
  
  /** Prevenir scroll del body */
  preventBodyScroll?: boolean;
  
  /** Clase adicional */
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function DialogV2({
  open,
  onOpenChange,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className,
}: DialogV2Props) {
  
  // Prevenir scroll del body
  useEffect(() => {
    if (!preventBodyScroll) return;
    
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, preventBodyScroll]);

  // Cerrar con ESC
  useEffect(() => {
    if (!closeOnEscape || !open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, open, onOpenChange]);

  // Cerrar en overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onOpenChange(false);
    }
  }, [closeOnOverlayClick, onOpenChange]);

  if (!open) return null;

  // Tamaños
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />
      
      {/* Contenido */}
      <div
        className={cn(
          'relative z-50 w-full bg-white rounded-lg shadow-lg',
          'animate-in zoom-in-95 fade-in duration-200',
          sizes[size],
          className
        )}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
        
        {children}
      </div>
    </div>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

export function DialogHeader({ 
  children, 
  icon,
  className 
}: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-6 pb-4', className)}>
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-2">
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}

export function DialogTitle({ 
  children, 
  className 
}: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({ 
  children, 
  className 
}: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)}>
      {children}
    </p>
  );
}

export function DialogFooter({ 
  children, 
  className,
  align = 'right'
}: DialogFooterProps) {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn(
      'flex items-center gap-2 p-6 pt-4 border-t',
      alignments[align],
      className
    )}>
      {children}
    </div>
  );
}

export function DialogContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

// ============================================
// EJEMPLOS DE USO
// ============================================

/*
// Diálogo simple
<DialogV2 open={open} onOpenChange={setOpen}>
  <DialogHeader>
    <DialogTitle>Título</DialogTitle>
    <DialogDescription>Descripción</DialogDescription>
  </DialogHeader>
  <DialogContent>
    Contenido
  </DialogContent>
  <DialogFooter>
    <Button onClick={() => setOpen(false)}>Cerrar</Button>
  </DialogFooter>
</DialogV2>

// Diálogo de confirmación
<DialogV2 open={open} onOpenChange={setOpen} size="sm">
  <DialogHeader icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}>
    <DialogTitle>¿Estás seguro?</DialogTitle>
    <DialogDescription>
      Esta acción no se puede deshacer.
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="ghost" onClick={() => setOpen(false)}>
      Cancelar
    </Button>
    <Button variant="destructive" onClick={handleConfirm}>
      Confirmar
    </Button>
  </DialogFooter>
</DialogV2>
*/
