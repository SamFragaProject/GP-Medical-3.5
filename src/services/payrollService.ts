import { supabase } from '@/lib/supabase';
import { Payroll, PayrollDetail } from '@/types/rrhh';

export const payrollService = {
    async getPayrolls(empresaId: string) {
        const { data, error } = await supabase
            .from('rrhh_nomina')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('periodo_inicio', { ascending: false });

        if (error) throw error;
        return data as Payroll[];
    },

    async createPayroll(payroll: Partial<Payroll>) {
        const { data, error } = await supabase
            .from('rrhh_nomina')
            .insert(payroll)
            .select()
            .single();

        if (error) throw error;
        return data as Payroll;
    },

    async getPayrollDetails(payrollId: string) {
        const { data, error } = await supabase
            .from('rrhh_nomina_detalles')
            .select(`
                *,
                empleado:empleado_id (nombre, apellido, puesto, rfc)
            `)
            .eq('nomina_id', payrollId);

        if (error) throw error;
        return data as PayrollDetail[];
    },

    async generatePayrollDetails(payrollId: string, empresaId: string) {
        // 1. Obtener empleados activos
        const { data: employees } = await supabase
            .from('rrhh_empleados')
            .select('*')
            .eq('empresa_id', empresaId)
            .eq('estado', 'activo');

        if (!employees) return [];

        // 2. Calcular nómina (Simplificado)
        // En un sistema real, esto consideraría faltas, horas extra, ISR, IMSS, etc.
        const detailsToInsert = employees.map(emp => {
            const salarioDiario = emp.salario_diario || 0;
            const diasTrabajados = 15; // Asumimos quincena completa
            const sueldoBruto = salarioDiario * diasTrabajados;

            // Deducciones Dummy (ISR ~10%, IMSS ~5%)
            const isr = sueldoBruto * 0.10;
            const imss = sueldoBruto * 0.05;
            const totalDeducciones = isr + imss;

            return {
                nomina_id: payrollId,
                empleado_id: emp.id,
                dias_trabajados: diasTrabajados,
                salario_base: salarioDiario,
                total_percepciones: sueldoBruto,
                total_deducciones: totalDeducciones,
                neto_pagar: sueldoBruto - totalDeducciones,
                desglose_json: {
                    sueldo: sueldoBruto,
                    isr: isr,
                    imss: imss
                }
            };
        });

        // 3. Insertar detalles
        const { data, error } = await supabase
            .from('rrhh_nomina_detalles')
            .insert(detailsToInsert)
            .select();

        if (error) throw error;

        // 4. Actualizar totales en cabecera
        const totalP = detailsToInsert.reduce((sum, d) => sum + d.total_percepciones, 0);
        const totalD = detailsToInsert.reduce((sum, d) => sum + d.total_deducciones, 0);
        const totalNeto = detailsToInsert.reduce((sum, d) => sum + d.neto_pagar, 0);

        await supabase
            .from('rrhh_nomina')
            .update({
                total_percepciones: totalP,
                total_deducciones: totalD,
                total_pagado: totalNeto
            })
            .eq('id', payrollId);

        return data;
    }
};
