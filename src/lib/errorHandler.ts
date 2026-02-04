/**
 * Servicio de manejo de errores robusto para GPMedical
 * Implementa patrones de error-handling-patterns skill
 */

// Tipos de error personalizados
export class GPMedicalError extends Error {
    constructor(
        message: string,
        public code: string,
        public severity: 'low' | 'medium' | 'high' | 'critical',
        public context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'GPMedicalError';
    }
}

export class ValidationError extends GPMedicalError {
    constructor(message: string, field?: string) {
        super(message, 'VALIDATION_ERROR', 'low', { field });
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends GPMedicalError {
    constructor(message: string = 'No autorizado') {
        super(message, 'AUTH_ERROR', 'high');
        this.name = 'AuthenticationError';
    }
}

export class NetworkError extends GPMedicalError {
    constructor(message: string, endpoint?: string) {
        super(message, 'NETWORK_ERROR', 'medium', { endpoint });
        this.name = 'NetworkError';
    }
}

export class DatabaseError extends GPMedicalError {
    constructor(message: string, query?: string) {
        super(message, 'DB_ERROR', 'critical', { query });
        this.name = 'DatabaseError';
    }
}

export class AIServiceError extends GPMedicalError {
    constructor(message: string, service: 'openai' | 'gemini' | 'ollama') {
        super(message, 'AI_ERROR', 'medium', { service });
        this.name = 'AIServiceError';
    }
}

// Handler centralizado de errores
export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: Array<{ timestamp: Date; error: GPMedicalError; handled: boolean }> = [];

    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    handle(error: unknown, context?: string): GPMedicalError {
        let gpError: GPMedicalError;

        if (error instanceof GPMedicalError) {
            gpError = error;
        } else if (error instanceof Error) {
            gpError = this.categorizeError(error);
        } else {
            gpError = new GPMedicalError(
                String(error),
                'UNKNOWN_ERROR',
                'medium'
            );
        }

        // Log interno
        this.errorLog.push({
            timestamp: new Date(),
            error: gpError,
            handled: true,
        });

        // Log a consola con formato
        this.logError(gpError, context);

        // Enviar a servicio de monitoreo (Sentry, etc.)
        this.reportError(gpError);

        return gpError;
    }

    private categorizeError(error: Error): GPMedicalError {
        const message = error.message.toLowerCase();

        // Errores de red
        if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
            return new NetworkError(error.message);
        }

        // Errores de autenticación
        if (message.includes('unauthorized') || message.includes('401') || message.includes('jwt')) {
            return new AuthenticationError(error.message);
        }

        // Errores de base de datos
        if (message.includes('supabase') || message.includes('postgres') || message.includes('sql')) {
            return new DatabaseError(error.message);
        }

        // Errores de IA
        if (message.includes('openai') || message.includes('gemini') || message.includes('ollama')) {
            const service = message.includes('openai') ? 'openai'
                : message.includes('gemini') ? 'gemini' : 'ollama';
            return new AIServiceError(error.message, service);
        }

        // Error genérico
        return new GPMedicalError(error.message, 'RUNTIME_ERROR', 'medium');
    }

    private logError(error: GPMedicalError, context?: string) {
        const emoji = {
            low: '⚠️',
            medium: '🔶',
            high: '🔴',
            critical: '🚨',
        }[error.severity];

        console.group(`${emoji} [${error.code}] ${error.name}`);
        console.error('Mensaje:', error.message);
        if (context) console.log('Contexto:', context);
        if (error.context) console.log('Datos:', error.context);
        console.log('Stack:', error.stack);
        console.groupEnd();
    }

    private reportError(error: GPMedicalError) {
        // TODO: Integrar con Sentry
        // Sentry.captureException(error, { extra: error.context });

        // Por ahora, solo log si es crítico
        if (error.severity === 'critical') {
            console.error('🚨 ERROR CRÍTICO - Requiere atención inmediata');
        }
    }

    getRecentErrors(count: number = 10) {
        return this.errorLog.slice(-count);
    }

    clearLog() {
        this.errorLog = [];
    }
}

// Wrapper para funciones async con manejo automático de errores
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            throw ErrorHandler.getInstance().handle(error, context);
        }
    }) as T;
}

// Hook para React
export function useErrorHandler() {
    const handler = ErrorHandler.getInstance();

    return {
        handleError: (error: unknown, context?: string) => handler.handle(error, context),
        getRecentErrors: () => handler.getRecentErrors(),
    };
}

// Utilidad para retry con backoff exponencial
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        baseDelay?: number;
        maxDelay?: number;
        onRetry?: (attempt: number, error: Error) => void;
    } = {}
): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                throw error;
            }

            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

            if (onRetry) {
                onRetry(attempt, lastError);
            }

            console.log(`⏳ Reintento ${attempt}/${maxRetries} en ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

export default ErrorHandler;
