import { describe, expect, it } from 'vitest'
import { Permission, Role } from '@/utils/rbac/types'
import { createAuthUser, hasPermission, normalizeRole } from '@/utils/rbac/rbacCore'

describe('RBAC', () => {
    it('normalizes backend role aliases', () => {
        expect(normalizeRole('super_administrator')).toBe(Role.SUPERADMIN)
        expect(normalizeRole('operador')).toBe(Role.OPERATOR)
    })

    it('derives permissions from the normalized role', () => {
        const user = createAuthUser({
            id: 7,
            email: 'operador@locentr.com',
            role: 'OPERATOR',
        })

        expect(user?.role).toBe(Role.OPERATOR)
        expect(hasPermission(user, Permission.VIEW_LOCATION_LOGBOOK)).toBe(true)
        expect(hasPermission(user, Permission.CREATE_COMPANY)).toBe(false)
    })
})
