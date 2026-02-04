import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para escuchar notificaciones de la sala de espera en tiempo real.
 * Alerta al médico cuando un paciente es marcado como 'llamado'.
 */
export function useReceptionNotifications() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !user.empresa_id) return;

        // Suscribirse a cambios en la tabla cola_recepcion
        const channel = supabase
            .channel('reception_calls')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'cola_recepcion',
                    filter: `empresa_id=eq.${user.empresa_id}`
                },
                (payload) => {
                    const newData = payload.new;
                    const oldData = payload.old;

                    // Si el estado cambió a 'llamado'
                    if (newData.estado === 'llamado' && oldData.estado !== 'llamado') {
                        // Notificar visualmente
                        toast.success(`PAX EN ESPERA: ${newData.metadata?.nombre_paciente || 'Paciente'} ha sido llamado a recepción.`, {
                            duration: 6000,
                            icon: '🔔',
                            style: {
                                background: '#06b6d4',
                                color: '#fff',
                                fontWeight: 'bold',
                            }
                        });

                        // Alerta sonora (Premium: Voz + Sonido)
                        const patientName = newData.metadata?.nombre_paciente || 'Paciente';

                        try {
                            const audio = new Audio('/assets/sounds/notification.mp3');
                            audio.play().catch(() => {
                                // Si falla el audio (ej. no existe), usamos síntesis de voz
                                const utterance = new SpeechSynthesisUtterance(`Paciente ${patientName}, favor de pasar a recepción.`);
                                utterance.lang = 'es-MX';
                                utterance.rate = 0.9;
                                window.speechSynthesis.speak(utterance);
                            });
                        } catch (err) {
                            console.warn('Could not play notification sound:', err);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);
}
