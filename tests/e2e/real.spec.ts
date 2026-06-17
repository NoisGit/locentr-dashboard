import { expect, test } from '@playwright/test'

test.skip(process.env.REAL_E2E !== '1', 'real E2E requires local API and PostgreSQL')
test.describe.configure({ mode: 'serial' })

const email = process.env.LOCENTR_REAL_E2E_EMAIL || 'camila.rojas@cocha.com'
const password = process.env.LOCENTR_REAL_E2E_PASSWORD || 'LocentrDemo2026!'
const unique = Date.now()

test('real API SaaS flow with seed data, mutation, 403/404 and logout', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.getByPlaceholder('nombre@empresa.com').fill(email)
    await page.getByPlaceholder('Ingresa tu contraseña').fill(password)
    await page.getByRole('button', { name: 'Ingresar' }).click()

    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { name: /Hola, Camila Rojas/i })).toBeVisible()
    await expect(main.getByText('Plan activo')).toBeVisible()
    await expect(main.getByText(/Casa Matriz Providencia|Sucursal Parque Arauco/)).toBeVisible()

    await page.goto('/companies')
    await expect(main.getByRole('heading', { name: 'Empresas' })).toBeVisible()
    await expect(main.getByText('Viajes Cocha S.A.')).toBeVisible()

    await page.goto('/users')
    await expect(main.getByRole('heading', { name: 'Usuarios' })).toBeVisible()
    await expect(main.getByText('Matías Soto')).toBeVisible()

    await page.goto('/users/999999')
    await expect(main.getByText('No fue posible cargar el usuario')).toBeVisible()

    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: '¡Acceso Denegado!' })).toBeVisible()

    await page.goto('/buildings')
    await expect(main.getByRole('heading', { name: 'Edificios' })).toBeVisible()
    await expect(main.getByText('Casa Matriz Providencia')).toBeVisible()

    await page.goto('/access')
    await expect(main.getByRole('heading', { name: 'Control de accesos' })).toBeVisible()
    await expect(main.getByText('Sofía Martínez')).toBeVisible()

    await page.goto('/documents')
    await expect(main.getByRole('heading', { name: 'Documentos' })).toBeVisible()
    await expect(main.getByText('Protocolo de evacuación')).toBeVisible()

    await page.goto('/settings/billing')
    await expect(main.getByRole('heading', { name: 'Plan y facturación' })).toBeVisible()
    await expect(main.getByText('Plan activo')).toBeVisible()

    await page.goto('/settings/team')
    await expect(main.getByRole('heading', { name: 'Equipo y licencias' })).toBeVisible()
    await page.getByLabel('Nombre completo').fill(`Guardia QA ${unique}`)
    await page.getByLabel('Correo corporativo').fill(`guardia.qa.${unique}@cocha.cl`)
    await page.getByLabel('Nombre de usuario').fill(`guardiaqa${unique}`)
    await page.getByLabel('Rol y nivel de acceso').selectOption('OPERATOR')
    await page.getByRole('button', { name: 'Enviar invitación' }).click()
    await expect(page.getByText(/Invitación creada/)).toBeVisible()

    await page.locator('.header-action-end .cursor-pointer').last().click()
    await page.getByText('Cerrar sesión').click()
    await expect(page).toHaveURL(/\/auth\/sign-in$/)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/sign-in/)
})
