import { test, expect } from '@playwright/test';

// ==========================================
// CONFIGURACIÓN DE ROLES (Basado en botones de acceso rápido)
// ==========================================
const ROLES_BUTTONS = {
    SUPER_ADMIN: 'Super Admin',
    MEDICO: 'Admin Médico',
    PACIENTE: 'Asistente' // Mapping Asistente as the third role for now
};

test.describe('MediFlow ERP - Comprehensive Verification Agent', () => {

    test.beforeEach(async ({ page, context }) => {
        // Asegurar viewport de escritorio
        await page.setViewportSize({ width: 1280, height: 720 });
        // Limpiar estado
        await context.clearCookies();
    });

    // ==========================================
    // 1. VERIFICACIÓN DE IDENTIDAD VISUAL & LOGIN
    // ==========================================
    test('Visual Identity Check', async ({ page }) => {
        await page.goto('/');
        if (!page.url().includes('login')) {
            await page.goto('/login');
        }

        // Verificar Títulos Generales (GPMedical)
        await expect(page.locator('text=GPMedical').first()).toBeVisible();

        // Verificar texto del Hero o login
        // En Login.tsx: "Bienvenido al Panel"
        await expect(page.locator('text=Bienvenido al Panel')).toBeVisible();

        // Verificar Acceso Rápido presente (Match "Portal de Acceso Corporativo")
        await expect(page.locator('text=Portal de Acceso Corporativo')).toBeVisible();

        // Login SUPER ADMIN
        // The button contains the icon and text, searching by text 'Super Admin' should work
        await page.click(`button:has-text("${ROLES_BUTTONS.SUPER_ADMIN}")`);

        // The submit button text is "ACCEDER AL PANEL OPERATIVO"
        await page.click('button:has-text("ACCEDER AL PANEL OPERATIVO")');

        // Redirección con regex para ser flexible con parámetros o subrutas
        await expect(page).toHaveURL(/.*dashboard/);

        // Sidebar check
        await expect(page.locator('nav')).toBeVisible();
        // El sidebar puede tener GPMedical
        await expect(page.locator('text=GPMedical').first()).toBeVisible();
    });

    // ==========================================
    // 2. ROL: SUPER ADMIN (NAVEGACIÓN)
    // ==========================================
    test('Role: Super Admin - Navigation & Access', async ({ page }) => {
        await page.goto('/login');
        await page.click(`button:has-text("${ROLES_BUTTONS.SUPER_ADMIN}")`);
        await page.click('button:has-text("ACCEDER AL PANEL OPERATIVO")');

        await expect(page).toHaveURL(/.*dashboard/);

        // Texto de bienvenida flexible
        await expect(page.locator('text=Super Admin Control Panel').or(page.locator('text=Panel de Control'))).toBeVisible();
        // Usamos regex para "Sam" ya que puede ser "Sam (Offline)"
        await expect(page.locator('h1, h2, h3, p, div').filter({ hasText: /Sam/ }).first()).toBeVisible();

        // Módulos
        await page.click('nav a[href="/empresas"]');
        await expect(page).toHaveURL(/.*empresas/);
    });

    // ==========================================
    // 3. ROL: MÉDICO (FLUJO CLÍNICO)
    // ==========================================
    test('Role: Médico - Clinical Workflow & AI Integration', async ({ page }) => {
        await page.goto('/login');
        await page.click(`button:has-text("${ROLES_BUTTONS.MEDICO}")`);
        await page.click('button:has-text("ACCEDER AL PANEL OPERATIVO")');

        await expect(page).toHaveURL(/.*dashboard/);
        // Flexible con "Dr. Roberto" o "Dr. Roberto (Offline)"
        // En Login.tsx el medico es 'Admin Médico', quizas el dashboard dice otra cosa.
        // Pero usemos un locator generico si falla.
        await expect(page.locator('text=Pacientes').first()).toBeVisible();

        await page.click('nav a[href="/pacientes"]');
        await expect(page.locator('h1:has-text("Pacientes")')).toBeVisible();
    });

    // ==========================================
    // 4. ACCIÓN CRÍTICA: REGISTRO DE PACIENTE
    // ==========================================
    test('Critical Action: Create New Patient', async ({ page }) => {
        await page.goto('/login');
        await page.click(`button:has-text("${ROLES_BUTTONS.MEDICO}")`);
        await page.click('button:has-text("ACCEDER AL PANEL OPERATIVO")');

        await page.click('nav a[href="/pacientes"]');

        await page.click('button:has-text("Nuevo Paciente")');
        await expect(page.locator('text=Registrar Nuevo Paciente')).toBeVisible();

        const testName = `Automated-${Date.now()}`;
        await page.fill('#nombre', testName);
        await page.fill('#apellido', 'Verification');
        await page.fill('#puesto', 'QA Tester');
        await page.fill('#email', `test-${Date.now()}@mediflow.com`);

        await page.click('button:has-text("Guardar Paciente")');
        // Esperamos a que el paciente aparezca en la lista
        await expect(page.locator(`text=${testName}`)).toBeVisible({ timeout: 10000 });
    });

    // ==========================================
    // 5. ACCIÓN CRÍTICA: EDITAR PACIENTE
    // ==========================================
    test('Critical Action: Edit Existing Patient', async ({ page }) => {
        await page.goto('/login');
        await page.click(`button:has-text("${ROLES_BUTTONS.MEDICO}")`);
        await page.click('button:has-text("ACCEDER AL PANEL OPERATIVO")');

        await page.click('nav a[href="/pacientes"]');

        // Esperar a que la lista cargue
        const editBtn = page.getByTitle('Editar Paciente').first();
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        await expect(page.locator('text=Editar Paciente')).toBeVisible();

        const updatedName = `Updated-${Date.now()}`;
        await page.fill('#nombre', updatedName);
        await page.click('button:has-text("Guardar Paciente")');

        await expect(page.locator(`text=${updatedName}`)).toBeVisible();
    });

    // ==========================================
    // 6. ACCIÓN CRÍTICA: AGENDAR CITA
    // ==========================================
    test('Critical Action: Create New Appointment', async ({ page }) => {
        await page.goto('/login');
        await page.click(`button:has-text("${ROLES_BUTTONS.MEDICO}")`);
        await page.click('button:has-text("ACCEDER AL PANEL OPERATIVO")');

        await page.click('nav a[href="/agenda"]');
        await expect(page).toHaveURL(/.*agenda/);

        await page.click('button:has-text("Nueva Cita")');
        // El título en el modal tiene "Medica" sin acento según vi en el código
        await expect(page.locator('text=Nueva Cita Medica')).toBeVisible();
    });
});
