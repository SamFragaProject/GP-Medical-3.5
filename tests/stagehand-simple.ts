/**
 * Test E2E con Stagehand + IA para GPMedical
 * Ejecutar con: npx tsx tests/stagehand-simple.ts
 */
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function runTest() {
    if (!OPENAI_KEY) {
        console.error('❌ OPENAI_API_KEY no configurada');
        process.exit(1);
    }

    console.log('🚀 Iniciando Stagehand con OpenAI...');

    const stagehand = new Stagehand({
        env: 'LOCAL',
        modelName: 'gpt-4o',
        modelClientOptions: {
            apiKey: OPENAI_KEY,
        },
        enableCaching: true,
        verbose: 0, // Menos logs
        headless: false, // Ver el navegador
    });

    try {
        await stagehand.init();
        const context = stagehand.context;
        const pages = context.pages();
        const page = pages.length > 0 ? pages[0] : await context.newPage();

        console.log('📍 Navegando a GPMedical...');
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(2000);

        console.log('🔐 Haciendo login con IA...');
        await stagehand.act('Escribe super@gpmedical.com en el campo de email');
        await stagehand.act('Escribe demo123 en el campo de contraseña');
        await stagehand.act('Haz clic en el botón de iniciar sesión');

        await page.waitForTimeout(3000);
        const currentUrl = page.url();
        console.log('📊 Página actual:', currentUrl);

        if (currentUrl.includes('dashboard')) {
            console.log('✅ ¡Login exitoso!');

            // Capturar screenshot
            await page.screenshot({ path: 'test-results/stagehand-dashboard.png' });
            console.log('📸 Screenshot guardado en test-results/stagehand-dashboard.png');
        } else {
            console.log('⚠️ Login falló o redirigió a otra página');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        console.log('🔄 Cerrando navegador...');
        await stagehand.close();
        console.log('✅ Test completado');
    }
}

runTest();
