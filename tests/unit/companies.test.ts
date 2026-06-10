import { describe, expect, it } from 'vitest'
import { filterCompaniesForUser } from '@/services/CompaniesService'
import { Role } from '@/utils/rbac/types'

const companies = [
    { id: 1, name: 'Locentr Norte' },
    { id: 2, name: 'Edificio Centro', parent_company_id: 1 },
    { id: 3, name: 'Otra empresa' },
]

describe('company visibility', () => {
    it('shows every company to SUPERADMIN', () => {
        expect(filterCompaniesForUser(companies, Role.SUPERADMIN, null)).toHaveLength(3)
    })

    it('limits ADMIN to its company and direct subcompanies', () => {
        expect(filterCompaniesForUser(companies, Role.ADMIN, 1).map((item) => item.id)).toEqual([
            1, 2,
        ])
    })
})
