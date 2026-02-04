import { supabase } from '@/lib/supabase';
import { Employee } from '@/types/rrhh';

export const employeeService = {
    async getEmployees(empresaId: string, search?: string) {
        let query = supabase
            .from('rrhh_empleados')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre', { ascending: true });

        if (search) {
            query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,puesto.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Employee[];
    },

    async getEmployeeById(id: string) {
        const { data, error } = await supabase
            .from('rrhh_empleados')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Employee;
    },

    async createEmployee(employee: Partial<Employee>) {
        const { data, error } = await supabase
            .from('rrhh_empleados')
            .insert(employee)
            .select()
            .single();

        if (error) throw error;
        return data as Employee;
    },

    async updateEmployee(id: string, updates: Partial<Employee>) {
        const { data, error } = await supabase
            .from('rrhh_empleados')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Employee;
    }
};
