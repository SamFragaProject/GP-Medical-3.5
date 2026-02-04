import { supabase } from '@/lib/supabase';
import { VacationRequest, VacationType } from '@/types/rrhh';

export const timeOffService = {
    // === Lógica de Vacaciones (Ley Federal del Trabajo - México 2024) ===
    calculateVacationDays(yearsOfService: number): number {
        // Año 1: 12 días
        // Año 2: 14 días
        // Año 3: 16 días
        // Año 4: 18 días
        // Año 5: 20 días
        // 6-10: 22 días
        // 11-15: 24 días
        // ...
        if (yearsOfService < 1) return 0;
        if (yearsOfService === 1) return 12;
        if (yearsOfService === 2) return 14;
        if (yearsOfService === 3) return 16;
        if (yearsOfService === 4) return 18;
        if (yearsOfService === 5) return 20;

        const fiveYearBlocks = Math.floor((yearsOfService - 6) / 5);
        return 22 + (fiveYearBlocks * 2);
    },

    async getVacationRequests(empresaId: string, employeeId?: string) {
        let query = supabase
            .from('rrhh_vacaciones')
            .select(`
                *,
                empleado:empleado_id (nombre, apellido, puesto)
            `)
            .eq('empresa_id', empresaId)
            .order('fecha_inicio', { ascending: false });

        if (employeeId) {
            query = query.eq('empleado_id', employeeId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as VacationRequest[];
    },

    async requestTimeOff(request: Omit<VacationRequest, 'id' | 'created_at' | 'estado' | 'dias_tomados'>) {
        // Calcular días tomados (simple check)
        const start = new Date(request.fecha_inicio);
        const end = new Date(request.fecha_fin);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diasTomados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        const { data, error } = await supabase
            .from('rrhh_vacaciones')
            .insert({
                ...request,
                dias_tomados: diasTomados,
                estado: 'pendiente'
            })
            .select()
            .single();

        if (error) throw error;
        return data as VacationRequest;
    },

    async updateRequestStatus(requestId: string, status: 'aprobado' | 'rechazado', approverId: string) {
        const { data, error } = await supabase
            .from('rrhh_vacaciones')
            .update({
                estado: status,
                aprobado_por: approverId
            })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return data as VacationRequest;
    }
};
