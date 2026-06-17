import { afterEach, describe, expect, it, vi } from 'vitest'
import AxiosRequestIntrceptorConfigCallback from '@/services/axios/AxiosRequestIntrceptorConfigCallback'
import AxiosResponseIntrceptorErrorCallback from '@/services/axios/AxiosResponseIntrceptorErrorCallback'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { useSessionUser, useToken } from '@/store/authStore'
import {
    hydrateCompaniesFromStorage,
    isVirtualCompanyId,
    useCompaniesStore,
} from '@/store/companies/CompaniesStore'

afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    useSessionUser.getState().resetAuth()
    useCompaniesStore.getState().reset()
    vi.restoreAllMocks()
})

describe('auth session storage', () => {
    it('clears access and refresh tokens when auth state is reset', () => {
        sessionStorage.setItem(TOKEN_NAME_IN_STORAGE, 'Bearer access-token')
        sessionStorage.setItem('refresh_token', 'refresh-token')
        useSessionUser.getState().setSessionSignedIn(true)

        useSessionUser.getState().resetAuth()

        expect(sessionStorage.getItem(TOKEN_NAME_IN_STORAGE)).toBeNull()
        expect(sessionStorage.getItem('refresh_token')).toBeNull()
        expect(useSessionUser.getState().session.signedIn).toBe(false)
    })

    it('stores, reads and clears token pairs through the auth token helper', () => {
        const tokens = useToken()

        tokens.setToken('Bearer access-token')
        tokens.setRefreshToken('refresh-token')

        expect(useToken().token).toBe('Bearer access-token')
        expect(useToken().refreshToken).toBe('refresh-token')

        useToken().clearToken()

        expect(useToken().token).toBeNull()
        expect(useToken().refreshToken).toBeNull()
    })
})

describe('axios request interceptor', () => {
    it('adds auth, request id and selected company scope to protected requests', () => {
        sessionStorage.setItem(TOKEN_NAME_IN_STORAGE, 'access-token')
        useSessionUser.getState().setUser({
            id: 7,
            email: 'admin@cocha.cl',
            role: 'ADMIN',
            company_id: 10,
        })
        useCompaniesStore.getState().selectCompany({
            id: 10,
            name: 'Cocha Operaciones',
        })

        const config = AxiosRequestIntrceptorConfigCallback({
            url: '/api/v1/dashboard/location/44',
            method: 'get',
            headers: {},
        } as never)

        expect(config.headers.Authorization).toBe('Bearer access-token')
        expect(config.headers['x-request-id']).toBeTruthy()
        expect(config.headers['x-company-id']).toBe('10')
        expect(config.params).toMatchObject({ company_id: 10 })
    })

    it('does not attach company scope to public auth requests', () => {
        useCompaniesStore.getState().selectCompany({
            id: 10,
            name: 'Cocha Operaciones',
        })

        const config = AxiosRequestIntrceptorConfigCallback({
            url: '/api/v1/auth/login',
            method: 'post',
            headers: {},
        } as never)

        expect(config.headers['x-company-id']).toBeUndefined()
    })

    it('does not attach company scope for SUPERADMIN requests', () => {
        useSessionUser.getState().setUser({
            id: 1,
            email: 'owner@locentr.cl',
            role: 'SUPERADMIN',
        })
        useCompaniesStore.getState().selectCompany({
            id: 10,
            name: 'Cocha Operaciones',
        })

        const config = AxiosRequestIntrceptorConfigCallback({
            url: '/api/v1/documents/me',
            method: 'get',
            headers: {},
        } as never)

        expect(config.headers['x-company-id']).toBeUndefined()
        expect(config.params).toBeUndefined()
    })

    it('recovers selected company scope from localStorage for protected GET requests', () => {
        localStorage.setItem(
            'current_company',
            JSON.stringify({ id: 12, name: 'Cocha Viajes' }),
        )

        const config = AxiosRequestIntrceptorConfigCallback({
            url: 'https://api.locentr.test/api/v1/users/',
            method: 'get',
            headers: {},
        } as never)

        expect(config.headers['x-company-id']).toBe('12')
        expect(config.params).toMatchObject({ company_id: 12 })
    })
})

describe('axios response interceptor', () => {
    it('clears stale company selection when a scoped request is forbidden', async () => {
        useCompaniesStore.getState().selectCompany({
            id: 10,
            name: 'Cocha Operaciones',
        })
        const error = {
            response: { status: 403 },
            config: {
                url: '/api/v1/documents/',
                headers: { 'x-company-id': '10' },
            },
        }

        await expect(
            AxiosResponseIntrceptorErrorCallback(error as never, vi.fn() as never),
        ).rejects.toBe(error)

        expect(useCompaniesStore.getState().selectedId).toBeUndefined()
        expect(localStorage.getItem('current_company')).toBeNull()
    })

    it('refreshes an expired access token once and retries the protected request', async () => {
        useToken().setRefreshToken('refresh-token')
        const retried = vi.fn().mockResolvedValue({ data: 'ok' })
        const client = Object.assign(retried, {
            post: vi.fn().mockResolvedValue({
                data: {
                    access_token: 'next-access-token',
                    refresh_token: 'next-refresh-token',
                    token_type: 'bearer',
                },
            }),
        })
        const error = {
            response: { status: 401 },
            config: {
                url: '/api/v1/users/',
                method: 'get',
                headers: {},
            },
        }

        await expect(
            AxiosResponseIntrceptorErrorCallback(error as never, client as never),
        ).resolves.toEqual({ data: 'ok' })

        expect(client.post).toHaveBeenCalledWith(
            '/api/v1/auth/refresh',
            { refresh_token: 'refresh-token' },
            { _skipAuthRefresh: true },
        )
        expect(retried).toHaveBeenCalledWith(
            expect.objectContaining({
                _retry: true,
                headers: expect.objectContaining({
                    Authorization: 'bearer next-access-token',
                }),
            }),
        )
        expect(useToken().refreshToken).toBe('next-refresh-token')
    })
})

describe('company selection store', () => {
    const companies = [
        { id: 10, name: 'Cocha Operaciones' },
        { id: 11, name: 'Cocha Empresas' },
    ]

    it('auto-selects a single company and persists it', () => {
        useCompaniesStore.getState().setCompanies([companies[0]], 'all')

        expect(useCompaniesStore.getState()).toMatchObject({
            selectedId: 10,
            selectedName: 'Cocha Operaciones',
            autoSelected: true,
        })
        expect(localStorage.getItem('current_company')).toContain('Cocha Operaciones')
    })

    it('keeps an existing valid selection and falls back to single-company auto-select', () => {
        useCompaniesStore.getState().selectCompany({ id: 11, name: 'Cocha Empresas' })
        useCompaniesStore.getState().setCompanies(companies, 'all')

        expect(useCompaniesStore.getState().selectedId).toBe(11)

        useCompaniesStore.getState().setCompanies([companies[0]], 'all')

        expect(useCompaniesStore.getState()).toMatchObject({
            selectedId: 10,
            selectedName: 'Cocha Operaciones',
            autoSelected: true,
        })
    })

    it('hydrates a persisted company and detects virtual ids', () => {
        localStorage.setItem(
            'current_company',
            JSON.stringify({ id: 10, name: 'Cocha Operaciones' }),
        )

        hydrateCompaniesFromStorage()

        expect(useCompaniesStore.getState().selectedName).toBe('Cocha Operaciones')
        expect(isVirtualCompanyId('__all__')).toBe(true)
        expect(isVirtualCompanyId(10)).toBe(false)
    })
})
