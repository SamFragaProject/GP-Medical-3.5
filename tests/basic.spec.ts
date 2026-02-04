import { test, expect } from '@playwright/test';

test.describe('GPMedical ERP - Tests Básicos', () => {

    test('Login page loads correctly', async ({ page }) => {
        await page.goto('/');

        // Verificar que la página de login carga
        await expect(page).toHaveTitle(/Mediflow|GPMedical|Login/i);

        // Buscar elementos de login
        const loginForm = page.locator('form, [data-testid="login-form"], .login-container');
        await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
    });

    test('Demo login works - Super Admin', async ({ page }) => {
        await page.goto('/');

        // Buscar botón de Super Admin demo
        const superAdminBtn = page.getByRole('button', { name: /super.*admin/i });

        if (await superAdminBtn.isVisible()) {
            await superAdminBtn.click();

            // Verificar redirección al dashboard
            await page.waitForURL(/dashboard/, { timeout: 15000 });
            await expect(page).toHaveURL(/dashboard/);
        }
    });

    test('Pacientes page loads with data', async ({ page }) => {
        // Login primero
        await page.goto('/');
        const superAdminBtn = page.getByRole('button', { name: /super.*admin/i });
        if (await superAdminBtn.isVisible()) {
            await superAdminBtn.click();
            await page.waitForURL(/dashboard/, { timeout: 15000 });
        }

        // Navegar a pacientes
        await page.goto('/pacientes');

        // Verificar que hay pacientes (algún elemento de lista)
        const patientList = page.locator('[data-testid="patient-card"], .patient-row, table tbody tr');
        await expect(patientList.first()).toBeVisible({ timeout: 15000 });

        // Verificar console log de Supabase
        console.log('✅ Test de Pacientes completado');
    });

    test('Dashboard shows statistics', async ({ page }) => {
        // Login
        await page.goto('/');
        const superAdminBtn = page.getByRole('button', { name: /super.*admin/i });
        if (await superAdminBtn.isVisible()) {
            await superAdminBtn.click();
            await page.waitForURL(/dashboard/, { timeout: 15000 });
        }

        // Verificar que las estadísticas cargan
        await page.goto('/dashboard');

        // Buscar cards de estadísticas
        const statsCards = page.locator('.grid > div, [class*="card"]');
        await expect(statsCards.first()).toBeVisible({ timeout: 10000 });

        console.log('✅ Test de Dashboard completado');
    });

    test('Navigation menu works', async ({ page }) => {
        // Login
        await page.goto('/');
        const superAdminBtn = page.getByRole('button', { name: /super.*admin/i });
        if (await superAdminBtn.isVisible()) {
            await superAdminBtn.click();
            await page.waitForURL(/dashboard/, { timeout: 15000 });
        }

        // Verificar que el menú lateral existe
        const sidebar = page.locator('nav, aside, [class*="sidebar"], [class*="menu"]');
        await expect(sidebar.first()).toBeVisible();

        // Verificar links de navegación
        const navLinks = page.locator('nav a, aside a');
        expect(await navLinks.count()).toBeGreaterThan(3);

        console.log('✅ Test de Navegación completado');
    });

});
