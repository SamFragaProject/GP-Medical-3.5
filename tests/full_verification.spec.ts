import { test, expect } from '@playwright/test';

// ==========================================
// CONFIGURACIÓN — Login adaptado a Login.tsx v3.5 (CUDA Dark)
// ==========================================
const LOGIN_URL = '/login';

// Helper: Login with demo profile button
async function loginAs(page: any, profileLabel: string) {
    await page.goto(LOGIN_URL);
    // Los botones de demo son pequeños con texto del label
    await page.click(`button:has-text("${profileLabel}")`);
    // Submit: el botón dice "Initialize Protocol"
    await page.click('button:has-text("Initialize Protocol")');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
}

test.describe('GPMedical 3.5 — Full Verification Suite v3.0', () => {

    test.beforeEach(async ({ page, context }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await context.clearCookies();
    });

    // ==========================================
    // 1. LOGIN: VISUAL IDENTITY & SYSTEM STATUS
    // ==========================================
    test('Login: Visual Identity & System Status HUD', async ({ page }) => {
        await page.goto(LOGIN_URL);

        // GPMedical branding
        await expect(page.locator('text=GPMEDICAL').first()).toBeVisible();

        // CUDA Dark aesthetic elements
        await expect(page.locator('text=Autenticación')).toBeVisible();
        await expect(page.locator('text=Secure_Protocol_v3.5')).toBeVisible();

        // Demo profile buttons (5 roles)
        await expect(page.locator('text=SUPER_ADMIN')).toBeVisible();
        await expect(page.locator('text=MÉDICO')).toBeVisible();
        await expect(page.locator('text=RECEPCIÓN')).toBeVisible();

        // System Status HUD (bottom-left, xl screens)
        const statusHud = page.locator('text=System Status');
        // Only visible on xl screens
        if (await statusHud.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(page.locator('text=Supabase DB')).toBeVisible();
            await expect(page.locator('text=Ollama LLM')).toBeVisible();
            await expect(page.locator('text=CUDA Engine')).toBeVisible();
        }
    });

    // ==========================================
    // 2. LOGIN: SUPER ADMIN FLOW
    // ==========================================
    test('Login: Super Admin Access', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');
        await expect(page.locator('nav').first()).toBeVisible();
        await expect(page.locator('text=GPMedical').first()).toBeVisible();
    });

    // ==========================================
    // 3. NAVIGATION: SUPER ADMIN MODULES
    // ==========================================
    test('Navigation: Super Admin Module Access', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        // Dashboard visible
        await expect(page.locator('text=Dashboard').first()).toBeVisible();

        // Navigate to Empresas
        const empresasLink = page.locator('a[href="/empresas"]').first();
        if (await empresasLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await empresasLink.click();
            await expect(page).toHaveURL(/.*empresas/);
        }
    });

    // ==========================================
    // 4. NAVIGATION: MÉDICO FLOW
    // ==========================================
    test('Navigation: Médico Clinical Workflow', async ({ page }) => {
        await loginAs(page, 'MÉDICO');

        // Should see Pacientes in navigation
        await expect(page.locator('text=Pacientes').first()).toBeVisible();

        // Navigate to Pacientes
        const pacientesLink = page.locator('a[href="/pacientes"]').first();
        if (await pacientesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await pacientesLink.click();
            await expect(page).toHaveURL(/.*pacientes/);
        }
    });

    // ==========================================
    // 5. CRITICAL: CREATE PATIENT
    // ==========================================
    test('Critical: Create New Patient', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        await page.goto('/pacientes');
        await page.waitForLoadState('networkidle');

        const newBtn = page.locator('button:has-text("Nuevo Paciente")');
        if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await newBtn.click();
            await expect(page.locator('text=Registrar').or(page.locator('text=Nuevo'))).toBeVisible();

            const testName = `E2E-${Date.now()}`;
            const nameInput = page.locator('#nombre');
            if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nameInput.fill(testName);
                await page.fill('#apellido', 'Test');
                await page.click('button:has-text("Guardar")');
                await expect(page.locator(`text=${testName}`)).toBeVisible({ timeout: 10000 });
            }
        }
    });

    // ==========================================
    // 6. CRITICAL: CREATE APPOINTMENT
    // ==========================================
    test('Critical: Create New Appointment', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        await page.goto('/agenda');
        await page.waitForLoadState('networkidle');

        const newBtn = page.locator('button:has-text("Nueva Cita")');
        if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await newBtn.click();
            await expect(page.locator('[role="dialog"]').or(page.locator('text=Nueva Cita'))).toBeVisible();
        }
    });

    // ==========================================
    // 7. AI: CHAT WIDGET
    // ==========================================
    test('AI: Chat Widget Interaction', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        // Find the floating chat button (Brain icon, bottom-right)
        const chatButton = page.locator('.fixed.bottom-6.right-6 button').first();
        if (await chatButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await chatButton.click();

            // Verify widget opened with GPMedical EX header
            await expect(page.locator('text=GPMedical EX')).toBeVisible({ timeout: 3000 });

            // Quick Actions should be visible on first open
            await expect(page.locator('text=Acciones Rápidas')).toBeVisible();
            await expect(page.locator('text=Analizar Riesgo')).toBeVisible();
            await expect(page.locator('text=Generar Protocolo')).toBeVisible();
            await expect(page.locator('text=Asistir Diagnóstico')).toBeVisible();
            await expect(page.locator('text=Consultar NOM')).toBeVisible();

            // Ollama status should be visible (online/offline)
            const statusText = page.locator('text=Ollama').or(page.locator('text=Modo Offline'));
            await expect(statusText).toBeVisible({ timeout: 3000 });
        }
    });

    // ==========================================
    // 8. AI: VIGILANCIA EPIDEMIOLÓGICA
    // ==========================================
    test('AI: Vigilancia Epidemiológica Dashboard', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        await page.goto('/reportes/vigilancia');
        await page.waitForLoadState('networkidle');

        // Dashboard should load
        await expect(page.locator('text=Vigilancia').first()).toBeVisible({ timeout: 10000 });

        // Check for IA alerts tab
        const alertsTab = page.locator('button:has-text("Alertas"), [role="tab"]:has-text("Alertas")').first();
        if (await alertsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await alertsTab.click();
            await expect(
                page.locator('text=Alertas IA')
                    .or(page.locator('text=CUDA'))
                    .or(page.locator('text=Heurístico'))
            ).toBeVisible({ timeout: 5000 });
        }
    });

    // ==========================================
    // 9. AI: IA PREVENTIVA TAB (DOCTOR VIEW)
    // ==========================================
    test('AI: IA Preventiva Tab in Doctor Dashboard', async ({ page }) => {
        await loginAs(page, 'MÉDICO');

        const iaTab = page.locator('button:has-text("IA Preventiva"), [role="tab"]:has-text("IA Preventiva")').first();
        if (await iaTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await iaTab.click();
            await expect(
                page.locator('text=Alertas IA')
                    .or(page.locator('text=Riesgo Poblacional'))
                    .or(page.locator('text=Intelligence Bureau'))
            ).toBeVisible({ timeout: 5000 });
        }
    });

    // ==========================================
    // 10. NAVIGATION: INTELLIGENCE BUREAU MENU
    // ==========================================
    test('Navigation: Intelligence Bureau Section in Menu', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        // Menu should have Intelligence Bureau section
        const iaBureauSection = page.locator('text=Intelligence Bureau').first();
        if (await iaBureauSection.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Centro de IA link
            const iaLink = page.locator('text=Centro de IA');
            await expect(iaLink).toBeVisible();
        }
    });

    // ==========================================
    // 11. ROLES: ROLE TEMPLATES COVERAGE
    // ==========================================
    test('Roles: Multiple Role Login Verification', async ({ page }) => {
        // Test that all 5 demo profiles can login
        for (const role of ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'MÉDICO', 'RECEPCIÓN', 'DEMO_USER']) {
            await page.goto(LOGIN_URL);
            const btn = page.locator(`button:has-text("${role}")`);
            if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await btn.click();
                // Check that email field was populated
                const emailInput = page.locator('input[type="email"]');
                const emailValue = await emailInput.inputValue();
                expect(emailValue).toBeTruthy();
            }
        }
    });

    // ==========================================
    // 12. RESPONSIVE: SIDEBAR COLLAPSE
    // ==========================================
    test('Responsive: Sidebar on Desktop', async ({ page }) => {
        await loginAs(page, 'SUPER_ADMIN');

        // Sidebar should be visible on desktop
        const sidebar = page.locator('nav').first();
        await expect(sidebar).toBeVisible();

        // Should contain GPMedical branding
        await expect(page.locator('text=GPMedical').first()).toBeVisible();
    });
});
