/**
 * Servicio de Extracción de Datos Inteligente
 * Resuelve problemas de "datos erróneos" mediante validación post-IA
 */
import { aiService } from './aiService';
import { ErrorHandler, ValidationError } from './errorHandler';
import { z } from 'zod';

export class DataExtractionService {
    private errorHandler = ErrorHandler.getInstance();

    /**
     * Extrae datos de un texto médico y los valida contra un esquema Zod
     */
    async extract<T>(
        text: string,
        schema: z.ZodSchema<T>,
        instruction: string
    ): Promise<T> {
        const systemPrompt = `Eres un experto en extracción de datos médicos. 
Tu tarea es extraer información precisa del texto proporcionado.
REGLA CRÍTICA: Responde ÚNICAMENTE con el objeto JSON puro, sin explicaciones ni markdown.

Instrucción específica: ${instruction}`;

        try {
            // 1. Llamada a la IA (Intento 1)
            const response = await aiService.ask(text, systemPrompt);

            // 2. Intento de parseo y validación
            return this.validateResponse(response, schema, text, instruction);
        } catch (error) {
            throw this.errorHandler.handle(error, 'DataExtractionService.extract');
        }
    }

    private async validateResponse<T>(
        response: string,
        schema: z.ZodSchema<T>,
        originalText: string,
        instruction: string
    ): Promise<T> {
        try {
            // Limpiar posible formato markdown si la IA se equivocó
            const cleanJson = response.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            // Validación estricta con Zod
            const validated = schema.parse(parsed);
            return validated;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.warn('⚠️ Validación fallida, intentando auto-corrección con IA...');
                return this.retryWithCorrection(response, error, originalText, instruction, schema);
            }
            throw new ValidationError('El formato de respuesta de la IA no es un JSON válido');
        }
    }

    /**
     * Si la IA devuelve datos mal formados, le enviamos el error para que se auto-corrija
     */
    private async retryWithCorrection<T>(
        badResponse: string,
        zodError: z.ZodError,
        originalText: string,
        instruction: string,
        schema: z.ZodSchema<T>
    ): Promise<T> {
        const correctionPrompt = `Tu respuesta anterior falló la validación.
Error de validación: ${JSON.stringify(zodError.format())}
Respuesta fallida: ${badResponse}

Por favor, corrige el JSON para que cumpla estrictamente con el esquema. 
Responde solo el JSON corregido del texto original: "${originalText.substring(0, 500)}..."`;

        const fixedResponse = await aiService.ask(instruction, correctionPrompt);

        try {
            const cleanJson = fixedResponse.replace(/```json|```/g, '').trim();
            return schema.parse(JSON.parse(cleanJson));
        } catch (finalError) {
            throw new ValidationError('No se pudo corregir la extracción de datos después de reintentar');
        }
    }
}

export const dataExtractionService = new DataExtractionService();

/**
 * Esquemas Comunes para GPMedical
 */
export const MedicalSchemas = {
    // Para análisis de Recetas / Notas
    receta: z.object({
        paciente: z.string(),
        medicamentos: z.array(z.object({
            nombre: z.string(),
            dosis: z.string(),
            frecuencia: z.string(),
            duracion: z.string().optional()
        })),
        diagnostico: z.string().optional()
    }),

    // Para Laboratorios
    laboratorio: z.object({
        estudio: z.string(),
        fecha: z.string(),
        resultados: z.array(z.object({
            parametro: z.string(),
            valor: z.string(),
            unidad: z.string(),
            rango_referencia: z.string().optional(),
            estado: z.enum(['normal', 'alto', 'bajo']).optional()
        }))
    })
};
