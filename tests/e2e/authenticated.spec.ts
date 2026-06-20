import { expect, test, type Page, type Route } from '@playwright/test'

const adminUser = {
    id: 7,
    username: 'boris.alvial',
    full_name: 'Boris Alvial',
    email: 'admin@cocha.cl',
    role: 'ADMIN',
    company_id: 10,
    is_active: true,
}

const company = {
    id: 10,
    name: 'Cocha Operaciones',
    activity: 'Turismo corporativo',
    id_number: '96501230-1',
    type_document: 'RUT',
    is_active: true,
    parent_company_id: null,
}

const location = {
    id: 44,
    name: 'Edificio Apoquindo',
    address: 'Av. Apoquindo 4501, Las Condes',
    country: 'Chile',
    company_id: 10,
    company_ids: [10],
    is_active: true,
}

function json(route: Route, body: unknown, status = 200) {
    return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
    })
}

async function mockLocentrApi(page: Page) {
    await page.route('**/api/v1/**', async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        const path = url.pathname
        const method = request.method()

        if (path === '/api/v1/auth/login' && method === 'POST') {
            return json(route, {
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token',
                token_type: 'bearer',
                user: adminUser,
            })
        }

        if (path === '/api/v1/auth/me') return json(route, adminUser)
        if (path === '/api/v1/auth/logout' && method === 'POST') return json(route, {})

        if (path === '/api/v1/companies/') {
            return json(route, { items: [company], total: 1 })
        }

        if (path === '/api/v1/locations/') {
            return json(route, { items: [location], total: 1 })
        }

        if (path === '/api/v1/dashboard/location/44') {
            return json(route, {
                kpis: {
                    historical_total: 12,
                    entries_today: 4,
                    currently_inside: 2,
                    whitelist: { total: 3, today: 1 },
                    blacklist: { total: 1 },
                },
                charts: {
                    gender_distribution: { male: 52, female: 48 },
                    entries_by_month: {
                        entries_by_month: [
                            { month: 'Enero', count: 4 },
                            { month: 'Febrero', count: 7 },
                            { month: 'Marzo', count: 12 },
                        ],
                    },
                },
                recent_entries: [
                    {
                        name: 'Francisca Núñez',
                        identifier: '17.111.222-3',
                        destination: 'Torre Norte',
                        timestamp: '2026-06-17T12:30:00',
                    },
                ],
            })
        }

        if (path === '/api/v1/subscriptions/me') {
            return json(route, {
                company_id: 10,
                status: 'TRIALING',
                trial_started_at: '2026-06-17T00:00:00',
                trial_ends_at: '2026-07-01T00:00:00',
                current_period_end: null,
                plan: {
                    code: 'growth',
                    name: 'Growth',
                    description: 'Operación multi-sede',
                    monthly_price_cents: 99000,
                    qty_locations: 10,
                    qty_admins: 3,
                    qty_operators: 30,
                    qty_daily_reads: 1500,
                    qty_storage_bytes: 1073741824,
                    checkout_available: false,
                },
                usage: {
                    locations: 1,
                    admins: 1,
                    operators: 2,
                    daily_reads: 12,
                    storage_bytes: 2048,
                },
            })
        }

        if (path === '/api/v1/subscriptions/plans') {
            return json(route, [
                {
                    code: 'growth',
                    name: 'Growth',
                    description: 'Operación multi-sede',
                    monthly_price_cents: 99000,
                    qty_locations: 10,
                    qty_admins: 3,
                    qty_operators: 30,
                    qty_daily_reads: 1500,
                    qty_storage_bytes: 1073741824,
                    checkout_available: false,
                },
            ])
        }

        if (path === '/api/v1/lifecycle/invoices') {
            return json(route, [])
        }

        if (path === '/api/v1/lifecycle/preferences') {
            return json(route, {
                company_id: 10,
                billing_emails: true,
                product_emails: true,
                updated_at: '2026-06-17T00:00:00',
            })
        }

        if (path === '/api/v1/teams/seats') {
            return json(route, {
                admins_used: 1,
                admins_limit: 3,
                operators_used: 2,
                operators_limit: 30,
                pending_admins: 0,
                pending_operators: 0,
            })
        }

        if (path === '/api/v1/teams/invitations' && method === 'GET') {
            return json(route, [
                {
                    id: 91,
                    company_id: 10,
                    email: 'operador@cocha.cl',
                    full_name: 'Operador Cocha',
                    username: 'operador.cocha',
                    role: 'OPERATOR',
                    status: 'PENDING',
                    expires_at: '2026-06-20T00:00:00',
                    created_at: '2026-06-17T00:00:00',
                },
            ])
        }

        if (path === '/api/v1/teams/invitations' && method === 'POST') {
            return json(route, {
                id: 92,
                company_id: 10,
                email: 'guardia.nuevo@cocha.cl',
                full_name: 'Guardia Nuevo',
                username: 'guardia.nuevo',
                role: 'OPERATOR',
                status: 'PENDING',
                invitation_url: 'https://locentr.example/invitations/test',
                expires_at: '2026-06-20T00:00:00',
                created_at: '2026-06-17T00:00:00',
            })
        }

        if (path === '/api/v1/users/999') {
            return json(route, { detail: 'User not found.' }, 404)
        }

        if (path === '/api/v1/users/') {
            return json(route, {
                items: [
                    adminUser,
                    {
                        id: 8,
                        username: 'operador.cocha',
                        full_name: 'Operador Cocha',
                        email: 'operador@cocha.cl',
                        role: 'OPERATOR',
                        company_id: 10,
                        is_active: true,
                    },
                ],
                total: 2,
            })
        }

        if (path === '/api/v1/documents/me') {
            return json(route, {
                items: [
                    {
                        id: 71,
                        company_id: 10,
                        user_id: 7,
                        name: 'Procedimiento de acceso',
                        file_name: 'procedimiento.pdf',
                        blob_name: 'documents/10/procedimiento.pdf',
                        content_type: 'application/pdf',
                        size_bytes: 2048,
                        created_by: 7,
                        created_at: '2026-06-17T00:00:00',
                    },
                ],
                total: 1,
            })
        }

        if (path === '/api/v1/whitelists/') {
            return json(route, {
                items: [
                    {
                        id: 1,
                        company_id: 10,
                        location_id: 44,
                        id_number: '17.111.222-3',
                        full_name: 'Francisca Núñez',
                        reason: 'Proveedor autorizado',
                    },
                ],
                total: 1,
            })
        }

        if (path === '/api/v1/blacklists/') {
            return json(route, { items: [], total: 0 })
        }

        if (path === '/api/v1/access-logs/dashboard/44') {
            return json(route, {
                items: [
                    {
                        id: 501,
                        location_id: 44,
                        external_people_id: 101,
                        created_by: 8,
                        created_at: '2026-06-17T12:30:00',
                        external_people: {
                            id: 101,
                            name: 'Francisca Núñez',
                            id_number: '17.111.222-3',
                        },
                    },
                ],
                total: 1,
            })
        }

        if (path === '/api/v1/documents/999/download') {
            return json(route, { detail: 'Document not found.' }, 404)
        }

        return json(route, { items: [], total: 0 })
    })
}

async function signInAsAdmin(page: Page) {
    await page.goto('/auth/sign-in')
    await page.getByPlaceholder('nombre@empresa.com').fill('admin@cocha.cl')
    await page.getByPlaceholder('Ingresa tu contraseña').fill('clave-segura')
    await page.getByRole('button', { name: 'Ingresar' }).click()
    await expect(page.getByRole('heading', { name: /Hola, Boris Alvial/i })).toBeVisible()
}

async function seedAuthenticatedSession(page: Page) {
    await page.addInitScript(
        ({ user, currentCompany }) => {
            sessionStorage.setItem('token', 'Bearer test-access-token')
            sessionStorage.setItem('refresh_token', 'test-refresh-token')
            sessionStorage.setItem(
                'sessionUser',
                JSON.stringify({
                    state: {
                        session: { signedIn: true },
                        user: {
                            ...user,
                            avatar: '',
                            userName: user.username,
                            permissions: [],
                        },
                    },
                    version: 0,
                }),
            )
            localStorage.setItem('current_company', JSON.stringify(currentCompany))
        },
        {
            user: adminUser,
            currentCompany: { id: company.id, name: company.name },
        },
    )
}

async function expectNoHorizontalPageOverflow(page: Page) {
    const overflow = await page.evaluate(() => {
        const root = document.documentElement
        return Math.ceil(root.scrollWidth - root.clientWidth)
    })

    expect(overflow).toBeLessThanOrEqual(2)
}

async function gotoResponsiveView(
    page: Page,
    path: string,
    heading: string | RegExp,
) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}(?:$|[?#])`))
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expectNoHorizontalPageOverflow(page)
}

test('authenticated SaaS navigation, mutation and logout protection', async ({ page }) => {
    await mockLocentrApi(page)
    await signInAsAdmin(page)

    const main = page.getByRole('main')
    await expect(main.getByText('Onboarding operativo')).toBeVisible()
    await expect(main.getByText('Cocha Operaciones')).toBeVisible()
    await expect(main.getByText('Edificio Apoquindo')).toBeVisible()

    await page.goto('/companies')
    await expect(main.getByRole('heading', { name: 'Empresas' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Cocha Operaciones' })).toBeVisible()

    await page.goto('/users')
    await expect(main.getByRole('heading', { name: 'Usuarios' })).toBeVisible()
    await expect(main.getByText('Operador Cocha')).toBeVisible()

    await page.goto('/users/999')
    await expect(main.getByText('No fue posible cargar el usuario')).toBeVisible()

    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: '¡Acceso Denegado!' })).toBeVisible()

    await page.goto('/buildings')
    await expect(main.getByRole('heading', { name: 'Edificios' })).toBeVisible()
    await expect(main.getByText('Edificio Apoquindo')).toBeVisible()

    await page.goto('/access')
    await expect(main.getByRole('heading', { name: 'Control de accesos' })).toBeVisible()
    await expect(main.getByText('Francisca Núñez')).toBeVisible()

    await page.goto('/documents')
    await expect(main.getByRole('heading', { name: 'Documentos' })).toBeVisible()
    await expect(main.getByText('Procedimiento de acceso')).toBeVisible()

    await page.goto('/settings/team')
    await expect(main.getByRole('heading', { name: 'Equipo y licencias' })).toBeVisible()
    await page.getByLabel('Nombre completo').fill('Guardia Nuevo')
    await page.getByLabel('Correo corporativo').fill('guardia.nuevo@cocha.cl')
    await page.getByLabel('Nombre de usuario').fill('guardia.nuevo')
    await page.getByLabel('Rol y nivel de acceso').selectOption('OPERATOR')
    await page.getByRole('button', { name: 'Enviar invitación' }).click()
    await expect(page.getByText('Invitación creada.')).toBeVisible()

    await page.locator('.header-action-end .cursor-pointer').last().click()
    await page.getByText('Cerrar sesión').click()
    await expect(page).toHaveURL(/\/auth\/sign-in$/)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/sign-in/)
})

test.describe('authenticated responsive matrix', () => {
    test.skip(({ isMobile }) => isMobile, 'covered by the explicit viewport matrix')

    const viewports = [
        { name: 'mobile', width: 390, height: 844 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'laptop', width: 1366, height: 768 },
        { name: 'desktop', width: 1920, height: 1080 },
    ]
    const views = [
        { path: '/dashboard', heading: /Hola, Boris Alvial/i },
        { path: '/companies', heading: 'Empresas' },
        { path: '/users', heading: 'Usuarios' },
        { path: '/buildings', heading: 'Edificios' },
        { path: '/access', heading: 'Control de accesos' },
        { path: '/documents', heading: 'Documentos' },
        { path: '/settings/team', heading: 'Equipo y licencias' },
        { path: '/settings/billing', heading: 'Plan y facturación' },
        { path: '/users/create', heading: 'Crear usuario' },
        { path: '/buildings/create', heading: 'Crear edificio' },
    ]

    for (const view of views) {
        test(`${view.path} avoids horizontal page overflow`, async ({ page }) => {
            await mockLocentrApi(page)
            await seedAuthenticatedSession(page)

            for (const viewport of viewports) {
                await test.step(`${viewport.name} ${viewport.width}x${viewport.height}`, async () => {
                    await page.setViewportSize(viewport)
                    await gotoResponsiveView(page, view.path, view.heading)
                })
            }
        })
    }
})
