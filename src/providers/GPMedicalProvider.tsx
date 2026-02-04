/**
 * GPMedical Global Services Provider
 * Integra ErrorHandler, AIService y DataExtraction en el Ciclo de Vida de React
 */
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { ErrorHandler, GPMedicalError } from '@/lib/errorHandler';
import { aiService } from '@/lib/aiService';
import { dataExtractionService } from '@/lib/dataExtractionService';
import { toast } from 'react-hot-toast';

interface ServicesContextType {
    ai: typeof aiService;
    extractor: typeof dataExtractionService;
    handleError: (error: unknown, context?: string) => GPMedicalError;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function GPMedicalProvider({ children }: { children: ReactNode }) {

    // Inicialización de monitoreo global de errores
    useEffect(() => {
        const globalErrorHandler = (event: ErrorEvent) => {
            ErrorHandler.getInstance().handle(event.error, 'Ventana Global');
        };

        const promiseHandler = (event: PromiseRejectionEvent) => {
            ErrorHandler.getInstance().handle(event.reason, 'Promesa Global');
        };

        window.addEventListener('error', globalErrorHandler);
        window.addEventListener('unhandledrejection', promiseHandler);

        return () => {
            window.removeEventListener('error', globalErrorHandler);
            window.removeEventListener('unhandledrejection', promiseHandler);
        };
    }, []);

    const handleError = (error: unknown, context?: string) => {
        const gpError = ErrorHandler.getInstance().handle(error, context);

        // Alerta visual al usuario según severidad
        if (gpError.severity === 'high' || gpError.severity === 'critical') {
            toast.error(`${gpError.message}`, {
                duration: 5000,
                position: 'top-right',
            });
        } else {
            toast(gpError.message, {
                icon: '⚠️',
            });
        }

        return gpError;
    };

    const value = {
        ai: aiService,
        extractor: dataExtractionService,
        handleError,
    };

    return (
        <ServicesContext.Provider value={value}>
            {children}
        </ServicesContext.Provider>
    );
}

/**
 * Hook personalizado para usar los servicios de primer nivel
 */
export function useGPMedical() {
    const context = useContext(ServicesContext);
    if (context === undefined) {
        throw new Error('useGPMedical debe usarse dentro de un GPMedicalProvider');
    }
    return context;
}
