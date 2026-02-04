import { test, expect } from '@playwright/test';

test.describe('GPMedical Stage 1: Super Admin God Mode', () => {

    test.beforeEach(async ({ page }) => {
        // Login as Super Admin using the demo button for simplicity in testing
        await page.goto('/');
        const superAdminBtn = page.getByRole('button', { name: /super.*admin/i });
        if (await superAdminBtn.isVisible()) {
            await superAdminBtn.click();
            await page.waitForURL(/dashboard/, { timeout: 15000 });
        }
    });

    test('Access real User Management and check real data', async ({ page }) => {
        // Navegar a la gestión de usuarios
        await page.goto('/admin/usuarios');

        // Verificar que el título de la página es correcto
        await expect(page.getByText(/Gestión de Usuarios/i)).toBeVisible();
        await expect(page.getByText(/GOD MODE/i)).toBeVisible();

        // Verificar que la lista de usuarios carga (elementos reales de la DB)
        // Buscamos las tarjetas de usuario que creamos con UsuarioCard
        const userCards = page.locator('.bg-white.rounded-2xl.p-6.border-gray-100');
        await expect(userCards.first()).toBeVisible({ timeout: 15000 });

        console.log('✅ Listado de usuarios reales verificado');
    });

    test('Role Management Wizard Flow (Edit Mode)', async ({ page }) => {
        // Navegar a la gestión de roles
        await page.goto('/admin/roles');

        // Debería ver tarjetas de roles
        const roleCards = page.locator('div:has-text("NIVEL")').filter({ has: page.locator('button') });
        await expect(roleCards.first()).toBeVisible();

        // Hacer clic en "Configurar" o el botón de edición
        const editButton = roleCards.first().getByRole('button').first();
        await editButton.click();

        // Verificar que el Wizard se abre
        await expect(page.getByText(/Generador de Perfiles GPMedical/i)).toBeVisible();
        await expect(page.getByText(/Identidad/i)).toBeVisible();

        // Avanzar a la sección de Privilegios
        await page.getByRole('button', { name: /Siguiente/i }).click();
        await expect(page.getByText(/Arquitectura de Accesos/i)).toBeVisible();

        // Cerrar el wizard
        await page.locator('button:has(svg)').filter({ hasText: '' }).first().click(); // El botón X
        await expect(page.getByText(/Generador de Perfiles/i)).not.toBeVisible();

        console.log('✅ Wizard de Roles verificado');
    });

    test('Company Management Real Integration', async ({ page }) => {
        // Navegar a la gestión de empresas
        await page.goto('/admin/empresas');

        // Verificar que vemos el listado de empresas
        await expect(page.getByText(/Ecosistema Corporativo/i)).toBeVisible();

        // Verificar que hay filas en la tabla (o cards en mobile)
        const empresaItems = page.locator('tr, .empresa-card');
        await expect(empresaItems.first()).toBeVisible({ timeout: 10000 });

        // Intentar abrir el diálogo de nueva empresa
        await page.getByRole('button', { name: /Nueva Empresa/i }).click();
        await expect(page.getByText(/Registrar Nueva Empresa/i)).toBeVisible();

        console.log('✅ Gestión de empresas verificada');
    });
});
