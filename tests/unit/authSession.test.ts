import { afterEach, describe, expect, it, vi } from 'vitest'
import AxiosRequestIntrceptorConfigCallback from '@/services/axios/AxiosRequestIntrceptorConfigCallback'
import AxiosResponseIntrceptorErrorCallback from '@/services/axios/AxiosResponseIntrceptorErrorCallback'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { useSessionUser } from '@/store/authStore'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'

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
})
