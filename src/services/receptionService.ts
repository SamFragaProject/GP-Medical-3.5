
import { supabase } from '../lib/supabase';

export interface TicketCola {
    id: string;
    created_at: string;
    paciente_id: string;
    empresa_id: string;
    tipo_registro: 'cita_previa' | 'nuevo_paciente';
    prioridad: 'normal' | 'urgente' | 'preferencial';
    estado: 'espera' | 'llamado' | 'en_consulta' | 'finalizado' | 'cancelado';
    motivo_visita?: string;
    medico_id?: string;
    metadata?: any;
    paciente?: {
        nombre: string;
        apellido: string;
    };
}

export const receptionService = {
    /**
     * Obtiene la cola de espera activa para la empresa del usuario
     */
    async getWaitingQueue(empresaId: string): Promise<TicketCola[]> {
        const { data, error } = await supabase
            .from('cola_recepcion')
            .select(`
                *,
                paciente:pacientes(nombre, apellido)
            `)
            .eq('empresa_id', empresaId)
            .in('estado', ['espera', 'llamado', 'en_consulta'])
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as TicketCola[];
    },

    /**
     * Registra un paciente en la cola (Check-in)
     */
    async checkIn(payload: Partial<TicketCola>) {
        const { data, error } = await supabase
            .from('cola_recepcion')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Llama a un paciente (Cambia estado a 'llamado')
     */
    async callPatient(ticketId: string) {
        const { data, error } = await supabase
            .from('cola_recepcion')
            .update({ estado: 'llamado' })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Inicia la consulta
     */
    async startConsultation(ticketId: string) {
        const { data, error } = await supabase
            .from('cola_recepcion')
            .update({ estado: 'en_consulta' })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Finaliza o cancela el turno
     */
    async updateStatus(ticketId: string, nuevoEstado: TicketCola['estado']) {
        const { data, error } = await supabase
            .from('cola_recepcion')
            .update({ estado: nuevoEstado })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
