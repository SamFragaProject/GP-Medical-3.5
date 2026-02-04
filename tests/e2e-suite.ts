/**
 * Suite de Tests E2E Profesional para GPMedical
 * Usando Stagehand con IA + Playwright
 * 
 * Ejecutar: npm run test:e2e
 */
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Schemas de extracción reutilizables
const schemas = {
    loginResult: z.object({
        success: z.boolean(),
        username: z.string().optional(),
        errorMessage: z.string().optional(),
    }),

    dashboardInfo: z.object({
        userName: z.string(),
        role: z.string(),
        modules: z.array(z.string()),
        stats: z.object({
            pacientes: z.number().optional(),
            citas: z.number().optional(),
        }).optional(),
    }),

    patientList: z.object({
        patients: z.array(z.object({
            name: z.string(),
            company: z.string().optional(),
            status: z.string().optional(),
        })),
        totalCount: z.number().optional(),
    }),

    menuItems: z.object({
        items: z.array(z.object({
            name: z.string(),
            isActive: z.boolean().optional(),
            hasSubmenu: z.boolean().optional(),
        })),
    }),
};

// Usuarios de prueba
const testUsers = {
    superAdmin: { email: 'super@gpmedical.com', password: 'demo123' },
    adminEmpresa: { email: 'admin@empresa.com', password: 'demo123' },
    medico: { email: 'medico@gpmedical.com', password: 'demo123' },
    recepcion: { email: 'recepcion@gpmedical.com', password: 'demo123' },
};

class GPMedicalTestSuite {
    private stagehand: Stagehand | null = null;
    private results: { test: string; status: 'pass' | 'fail'; duration: number; error?: string }[] = [];

    async init() {
        if (!OPENAI_KEY) {
            throw new Error('OPENAI_API_KEY no configurada');
        }

        this.stagehand = new Stagehand({
            env: 'LOCAL',
            modelName: 'gpt-4o',
            modelClientOptions: { apiKey: OPENAI_KEY },
            enableCaching: true,
            verbose: 0,
            headless: false,
        });

        await this.stagehand.init();
        console.log('✅ Stagehand inicializado');
    }

    async close() {
        if (this.stagehand) {
            await this.stagehand.close();
        }
        this.printResults();
    }

    private async runTest(name: string, fn: () => Promise<void>) {
        const start = Date.now();
        console.log(`\n🧪 Ejecutando: ${name}`);

        try {
            await fn();
            this.results.push({ test: name, status: 'pass', duration: Date.now() - start });
            console.log(`   ✅ Pasó (${Date.now() - start}ms)`);
        } catch (error: any) {
            this.results.push({ test: name, status: 'fail', duration: Date.now() - start, error: error.message });
            console.log(`   ❌ Falló: ${error.message}`);
        }
    }

    private printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE RESULTADOS');
        console.log('='.repeat(60));

        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;

        this.results.forEach(r => {
            const icon = r.status === 'pass' ? '✅' : '❌';
            console.log(`${icon} ${r.test} (${r.duration}ms)`);
            if (r.error) console.log(`   └─ Error: ${r.error}`);
        });

        console.log('='.repeat(60));
        console.log(`Total: ${passed} pasaron, ${failed} fallaron`);
    }

    async testLogin(userType: keyof typeof testUsers) {
        const user = testUsers[userType];
        const page = this.stagehand!.context.pages()[0] || await this.stagehand!.context.newPage();

        await page.goto(BASE_URL);
        await page.waitForTimeout(1500);

        await this.stagehand!.act(`Escribe ${user.email} en el campo de email o correo`);
        await this.stagehand!.act(`Escribe ${user.password} en el campo de contraseña`);
        await this.stagehand!.act('Haz clic en el botón de iniciar sesión o login');

        await page.waitForTimeout(2000);

        if (!page.url().includes('dashboard')) {
            throw new Error(`Login falló. URL actual: ${page.url()}`);
        }

        return page;
    }

    async testDashboardExtraction() {
        const info = await this.stagehand!.extract({
            instruction: 'Extrae el nombre del usuario logueado, su rol, y los nombres de todos los módulos visibles en el menú lateral',
            schema: schemas.dashboardInfo,
        });

        if (!info.userName || info.modules.length === 0) {
            throw new Error('No se pudo extraer información del dashboard');
        }

        console.log(`   📋 Usuario: ${info.userName} (${info.role})`);
        console.log(`   📋 Módulos: ${info.modules.join(', ')}`);

        return info;
    }

    async testNavigation(moduleName: string) {
        await this.stagehand!.act(`Navega al módulo de ${moduleName} haciendo clic en el menú`);

        const page = this.stagehand!.context.pages()[0];
        await page.waitForTimeout(1500);

        const url = page.url();
        console.log(`   📍 Navegó a: ${url}`);
    }

    async testPatientSearch(searchTerm: string) {
        const page = this.stagehand!.context.pages()[0];
        await page.goto(`${BASE_URL}/pacientes`);
        await page.waitForTimeout(1500);

        await this.stagehand!.act(`Busca "${searchTerm}" en el campo de búsqueda de pacientes`);
        await page.waitForTimeout(1000);

        const results = await this.stagehand!.extract({
            instruction: 'Extrae la lista de pacientes visibles después de la búsqueda',
            schema: schemas.patientList,
        });

        console.log(`   📋 Encontrados: ${results.patients.length} pacientes`);
        return results;
    }

    async runAllTests() {
        await this.runTest('1. Login como Super Admin', async () => {
            await this.testLogin('superAdmin');
        });

        await this.runTest('2. Extracción de información del Dashboard', async () => {
            await this.testDashboardExtraction();
        });

        await this.runTest('3. Navegación a Pacientes', async () => {
            await this.testNavigation('Pacientes');
        });

        await this.runTest('4. Navegación a Agenda/Citas', async () => {
            await this.testNavigation('Agenda');
        });

        await this.runTest('5. Navegación a Configuración', async () => {
            await this.testNavigation('Configuración');
        });
    }
}

// Ejecutar suite
async function main() {
    console.log('🏥 GPMedical - Suite de Tests E2E con IA');
    console.log('=========================================\n');

    const suite = new GPMedicalTestSuite();

    try {
        await suite.init();
        await suite.runAllTests();
    } catch (error: any) {
        console.error('❌ Error fatal:', error.message);
    } finally {
        await suite.close();
    }
}

main();
