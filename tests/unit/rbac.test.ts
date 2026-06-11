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
        expect(hasPermission(user, Permission.VIEW_ACCESS_MANAGEMENT)).toBe(false)
        expect(hasPermission(user, Permission.VIEW_ACCESS_LOGS)).toBe(false)
    })

    it('matches sensitive frontend permissions with backend roles', () => {
        const admin = createAuthUser({
            id: 1,
            email: 'admin@locentr.com',
            role: 'ADMIN',
        })
        const client = createAuthUser({
            id: 2,
            email: 'cliente@locentr.com',
            role: 'CLIENT',
        })

        expect(hasPermission(admin, Permission.DEACTIVATE_LOCATION)).toBe(true)
        expect(hasPermission(admin, Permission.VIEW_AUDIT_LOG)).toBe(false)
        expect(hasPermission(client, Permission.VIEW_ACCESS_LOGS)).toBe(true)
        expect(hasPermission(client, Permission.VIEW_SUPPORT_TICKETS)).toBe(false)
    })
})
