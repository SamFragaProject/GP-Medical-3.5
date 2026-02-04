/**
 * Configuración de Stagehand para GPMedical
 * Testing con IA usando OpenAI
 */
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

// Configuración por defecto
export const stagehandConfig = {
    env: 'LOCAL' as const,
    modelName: 'gpt-4o' as const,
    modelClientOptions: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    enableCaching: true, // Cachear acciones para no repetir llamadas a IA
    verbose: 1,
};

/**
 * Crear instancia de Stagehand
 */
export async function createStagehand() {
    const stagehand = new Stagehand(stagehandConfig);
    await stagehand.init();
    return stagehand;
}

/**
 * Schemas de extracción comunes para GPMedical
 */
export const schemas = {
    // Extraer datos de paciente de la UI
    paciente: z.object({
        nombre: z.string().describe('Nombre completo del paciente'),
        edad: z.number().optional().describe('Edad del paciente'),
        empresa: z.string().optional().describe('Empresa donde trabaja'),
    }),

    // Extraer resultado de diagnóstico
    diagnostico: z.object({
        resultado: z.string().describe('Resultado del diagnóstico'),
        recomendaciones: z.array(z.string()).optional().describe('Lista de recomendaciones'),
    }),

    // Extraer datos de cita
    cita: z.object({
        fecha: z.string().describe('Fecha de la cita'),
        hora: z.string().describe('Hora de la cita'),
        tipo: z.string().describe('Tipo de examen o consulta'),
        estado: z.string().describe('Estado de la cita'),
    }),
};

export default stagehandConfig;
