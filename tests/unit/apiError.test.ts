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

    it('translates known backend messages', () => {
        const error = {
            response: {
                status: 409,
                data: { detail: 'Email is already in use.' },
            },
        }

        expect(getApiErrorMessage(error, 'Error')).toBe('El correo ya está en uso.')
    })

    it('does not expose unknown English server messages', () => {
        const error = {
            response: {
                status: 500,
                data: { detail: 'Internal query execution failed' },
            },
        }

        expect(getApiErrorMessage(error, 'Error')).toBe(
            'El servicio no pudo completar la operación.',
        )
    })
})
