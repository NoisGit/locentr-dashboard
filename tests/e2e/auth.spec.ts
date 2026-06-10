import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in')
})

test('login renders the Locentr identity and recovery link', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bienvenido a Locentr' })).toBeVisible()
    await expect(page.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toHaveAttribute(
        'href',
        '/auth/forgot-password',
    )
})

test('password reset without a token is blocked clearly', async ({ page }) => {
    await page.goto('/auth/reset-password')

    await expect(
        page.getByText('Solicita un nuevo enlace de recuperación para continuar.'),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar contraseña' })).toBeDisabled()
})

test('mobile login does not overflow horizontally', async ({ page }) => {
    const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
    }))

    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
})
