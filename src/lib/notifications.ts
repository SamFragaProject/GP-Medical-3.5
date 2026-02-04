import { toast } from 'sonner';

/**
 * Medical notification system using Sonner
 * Provides consistent, professional notifications for medical actions
 */

export const medicalNotifications = {
    // Success notifications
    success: {
        prescriptionCreated: () => {
            toast.success('Receta creada exitosamente', {
                description: 'El documento está listo para imprimir',
                duration: 4000,
            });
        },

        certificateGenerated: () => {
            toast.success('Certificado de aptitud generado', {
                description: 'El certificado ha sido creado correctamente',
                duration: 4000,
            });
        },

        incidentReported: () => {
            toast.success('Incidente reportado', {
                description: 'El reporte ha sido guardado en el sistema',
                duration: 4000,
            });
        },

        patientSaved: () => {
            toast.success('Paciente guardado', {
                description: 'Los datos del paciente se han actualizado',
                duration: 3000,
            });
        },

        appointmentScheduled: () => {
            toast.success('Cita agendada', {
                description: 'La cita ha sido programada exitosamente',
                duration: 3000,
            });
        },
    },

    // Error notifications
    error: {
        generic: (message?: string) => {
            toast.error('Error', {
                description: message || 'Ha ocurrido un error. Por favor intenta de nuevo.',
                duration: 5000,
            });
        },

        saveFailed: () => {
            toast.error('Error al guardar', {
                description: 'No se pudieron guardar los cambios. Verifica tu conexión.',
                duration: 5000,
            });
        },

        loadFailed: () => {
            toast.error('Error al cargar datos', {
                description: 'No se pudieron cargar los datos. Intenta recargar la página.',
                duration: 5000,
            });
        },

        validationFailed: (field: string) => {
            toast.error('Datos incompletos', {
                description: `Por favor completa el campo: ${field}`,
                duration: 4000,
            });
        },
    },

    // Warning notifications
    warning: {
        unsavedChanges: () => {
            toast.warning('Cambios sin guardar', {
                description: 'Tienes cambios sin guardar. ¿Deseas continuar?',
                duration: 5000,
            });
        },

        restrictionActive: (restriction: string) => {
            toast.warning('Restricción laboral activa', {
                description: restriction,
                duration: 6000,
            });
        },

        evaluationExpired: () => {
            toast.warning('Evaluación vencida', {
                description: 'La evaluación periódica del trabajador ha vencido',
                duration: 5000,
            });
        },
    },

    // Info notifications
    info: {
        loading: (message: string) => {
            return toast.loading(message, {
                duration: Infinity, // Manual dismiss
            });
        },

        dismiss: (toastId: string | number) => {
            toast.dismiss(toastId);
        },

        reminder: (message: string) => {
            toast.info('Recordatorio', {
                description: message,
                duration: 4000,
            });
        },
    },

    // Promise-based notifications (for async operations)
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    },
};

// Custom notification with action button
export const notifyWithAction = (
    message: string,
    description: string,
    actionLabel: string,
    onAction: () => void
) => {
    toast(message, {
        description,
        action: {
            label: actionLabel,
            onClick: onAction,
        },
        duration: 6000,
    });
};

// Medical alert notification (high priority)
export const medicalAlert = (
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
) => {
    const colors = {
        low: 'info',
        medium: 'warning',
        high: 'error',
    };

    const method = colors[severity] as 'info' | 'warning' | 'error';

    toast[method](title, {
        description,
        duration: severity === 'high' ? 8000 : 5000,
    });
};
