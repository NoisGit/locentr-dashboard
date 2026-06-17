import { describe, expect, it } from 'vitest'
import { buildOnboardingSummary, hasConfiguredPeople } from '@/views/dashboard/onboardingModel'
import type { CompanySubscription } from '@/services/SubscriptionsService'

const subscription: CompanySubscription = {
    company_id: 10,
    status: 'ACTIVE',
    trial_started_at: '2026-06-01T00:00:00.000Z',
    trial_ends_at: '2026-06-15T00:00:00.000Z',
    current_period_end: '2026-07-15T00:00:00.000Z',
    plan: {
        code: 'growth',
        name: 'Growth',
        description: 'Operación multi-sede',
        monthly_price_cents: 99000,
        qty_locations: 10,
        qty_admins: 3,
        qty_operators: 30,
        qty_daily_reads: 1500,
        qty_storage_bytes: 1024,
        checkout_available: true,
    },
    usage: {
        locations: 1,
        admins: 1,
        operators: 2,
        daily_reads: 20,
        storage_bytes: 100,
    },
}

describe('onboarding model', () => {
    it('considers people configured when there is more than the first admin', () => {
        expect(hasConfiguredPeople({ admins_used: 1, operators_used: 0, pending_admins: 0, pending_operators: 0, admins_limit: 3, operators_limit: 30 })).toBe(false)
        expect(hasConfiguredPeople({ admins_used: 1, operators_used: 1, pending_admins: 0, pending_operators: 0, admins_limit: 3, operators_limit: 30 })).toBe(true)
    })

    it('marks onboarding complete only when all backend-derived steps are present', () => {
        const summary = buildOnboardingSummary({
            companyId: 10,
            locationsCount: 1,
            accessRulesCount: 1,
            accessLogsCount: 1,
            seats: {
                admins_used: 1,
                admins_limit: 3,
                operators_used: 1,
                operators_limit: 30,
                pending_admins: 0,
                pending_operators: 0,
            },
            subscription,
        })

        expect(summary.completed).toBe(6)
        expect(summary.isComplete).toBe(true)
        expect(summary.steps.at(-1)).toMatchObject({
            title: 'Plan configurado',
            done: true,
        })
        expect(summary.subscriptionLabel).toBe('Plan activo')
    })

    it('routes attention states to billing without pretending the plan is missing', () => {
        const summary = buildOnboardingSummary({
            companyId: 10,
            locationsCount: 1,
            accessRulesCount: 1,
            accessLogsCount: 1,
            seats: {
                admins_used: 1,
                admins_limit: 3,
                operators_used: 1,
                operators_limit: 30,
                pending_admins: 0,
                pending_operators: 0,
            },
            subscription: { ...subscription, status: 'PAST_DUE' },
        })

        const planStep = summary.steps.at(-1)
        expect(planStep).toMatchObject({
            title: 'Plan configurado',
            done: true,
            action: '/settings/billing',
            requiresAttention: true,
        })
        expect(summary.subscriptionLabel).toBe('Pago pendiente')
    })
})
