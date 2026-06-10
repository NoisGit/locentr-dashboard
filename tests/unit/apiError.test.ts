import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '@/utils/apiError'

describe('getApiErrorMessage', () => {
    it('prefers the API detail message', () => {
        const error = {
            message: 'Network error',
            response: { data: { detail: 'Acceso denegado' } },
        }

        expect(getApiErrorMessage(error, 'Error')).toBe('Acceso denegado')
    })

    it('uses a safe fallback for unknown values', () => {
        expect(getApiErrorMessage(null, 'No disponible')).toBe('No disponible')
    })
})
