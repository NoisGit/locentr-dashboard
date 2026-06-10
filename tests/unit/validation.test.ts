import { describe, expect, it } from 'vitest'
import {
    emailSchema,
    passwordSchema,
    requiredText,
    usernameSchema,
} from '@/utils/validation/schemas'

describe('shared validation schemas', () => {
    it('trims required text and enforces a maximum length', () => {
        expect(requiredText('El nombre', 10).parse('  Locentr  ')).toBe('Locentr')
        expect(requiredText('El nombre', 3).safeParse('Locentr').success).toBe(false)
    })

    it('validates enterprise login fields consistently', () => {
        expect(emailSchema.safeParse('admin@locentr.com').success).toBe(true)
        expect(emailSchema.safeParse('admin').success).toBe(false)
        expect(passwordSchema.safeParse('segura123').success).toBe(true)
        expect(passwordSchema.safeParse('123').success).toBe(false)
    })

    it('accepts only normalized usernames', () => {
        expect(usernameSchema.safeParse('javita_01').success).toBe(true)
        expect(usernameSchema.safeParse('Javita 01').success).toBe(false)
    })
})
