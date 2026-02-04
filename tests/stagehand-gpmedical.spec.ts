/**
 * Test E2E con Stagehand + IA para GPMedical
 * Este test usa lenguaje natural para navegar la aplicación
 */
import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

// Solo ejecutar si hay API key configurada
const OPENAI_KEY = process.env.OPENAI_API_KEY;

test.describe('GPMedical - Tests con IA (Stagehand)', () => {
    let stagehand: Stagehand;

    test.beforeAll(async () => {
        if (!OPENAI_KEY) {
            console.log('⚠️ OPENAI_API_KEY no configurada - saltando tests de Stagehand');
            return;
        }

        stagehand = new Stagehand({
            env: 'LOCAL',
            modelName: 'gpt-4o',
            modelClientOptions: {
                apiKey: OPENAI_KEY,
            },
            enableCaching: true,
        });
        await stagehand.init();
    });

    test.afterAll(async () => {
        if (stagehand) {
            await stagehand.close();
        }
    });

    test('Login con IA - describe la acción en español', async () => {
        test.skip(!OPENAI_KEY, 'Requiere OPENAI_API_KEY');

        const page = stagehand.page;
        await page.goto('http://localhost:3000');

        // Usar IA para hacer login
        await stagehand.act('Busca el campo de email y escribe admin@gpmedical.com');
        await stagehand.act('Busca el campo de contraseña y escribe demo123');
        await stagehand.act('Haz clic en el botón de iniciar sesión o login');

        // Verificar que llegamos al dashboard
        await page.waitForURL(/dashboard/);
        expect(page.url()).toContain('dashboard');
    });

    test('Extraer información de paciente con IA', async () => {
        test.skip(!OPENAI_KEY, 'Requiere OPENAI_API_KEY');

        const page = stagehand.page;
        await page.goto('http://localhost:3000/pacientes');

        // Extraer datos estructurados de la página
        const pacientes = await stagehand.extract({
            instruction: 'Extrae la lista de pacientes visibles con su nombre y empresa',
            schema: z.object({
                pacientes: z.array(z.object({
                    nombre: z.string(),
                    empresa: z.string().optional(),
                })),
            }),
        });

        console.log('Pacientes encontrados:', pacientes);
        expect(pacientes.pacientes.length).toBeGreaterThan(0);
    });

    test('Navegar menú y verificar módulos visibles', async () => {
        test.skip(!OPENAI_KEY, 'Requiere OPENAI_API_KEY');

        const page = stagehand.page;
        await page.goto('http://localhost:3000/dashboard');

        // Usar IA para describir lo que ve
        const menuItems = await stagehand.extract({
            instruction: 'Lista todos los elementos del menú lateral de navegación',
            schema: z.object({
                items: z.array(z.object({
                    nombre: z.string(),
                    activo: z.boolean().optional(),
                })),
            }),
        });

        console.log('Menú encontrado:', menuItems);
        expect(menuItems.items.length).toBeGreaterThan(0);
    });

    test('Crear cita usando lenguaje natural', async () => {
        test.skip(!OPENAI_KEY, 'Requiere OPENAI_API_KEY');

        const page = stagehand.page;
        await page.goto('http://localhost:3000/citas');

        // La IA encuentra y ejecuta las acciones
        await stagehand.act('Haz clic en el botón para crear una nueva cita');
        await stagehand.act('Selecciona un paciente de la lista');
        await stagehand.act('Elige una fecha para mañana');
        await stagehand.act('Selecciona el tipo de examen como "Examen de ingreso"');
        await stagehand.act('Guarda la cita');

        // Verificar éxito
        const resultado = await stagehand.extract({
            instruction: 'Verifica si apareció un mensaje de éxito o confirmación',
            schema: z.object({
                exito: z.boolean(),
                mensaje: z.string().optional(),
            }),
        });

        expect(resultado.exito).toBe(true);
    });
});
