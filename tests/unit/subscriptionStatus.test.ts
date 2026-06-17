import { describe, expect, it } from 'vitest'
import {
    getSubscriptionPresentation,
    getTrialDaysRemaining,
    hasConfiguredPlan,
    isTrialExpired,
} from '@/views/billing/subscriptionStatus'
import type { CompanySubscription } from '@/services/SubscriptionsService'

const baseSubscription: CompanySubscription = {
    company_id: 10,
    status: 'TRIALING',
    trial_started_at: '2026-06-01T00:00:00.000Z',
    trial_ends_at: '2026-06-20T00:00:00.000Z',
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

function subscription(
    patch: Partial<CompanySubscription>,
): CompanySubscription {
    return {
        ...baseSubscription,
        ...patch,
    }
}

describe('subscription presentation', () => {
    it.each([
        ['TRIALING', 'trial_active', 'Prueba activa', false],
        ['ACTIVE', 'plan_active', 'Plan activo', false],
        ['PAST_DUE', 'payment_pending', 'Pago pendiente', true],
        ['CANCELED', 'subscription_canceled', 'Suscripción cancelada', true],
    ] as const)('maps %s status to product copy', (status, key, label, attention) => {
        const presentation = getSubscriptionPresentation(
            subscription({ status }),
            new Date('2026-06-10T00:00:00.000Z'),
        )

        expect(presentation.key).toBe(key)
        expect(presentation.label).toBe(label)
        expect(presentation.needsAttention).toBe(attention)
    })

    it('detects an expired trial independently from the backend status', () => {
        const expired = subscription({
            status: 'TRIALING',
            trial_ends_at: '2026-06-01T00:00:00.000Z',
        })

        expect(isTrialExpired(expired, new Date('2026-06-02T00:00:00.000Z'))).toBe(true)
        expect(
            getSubscriptionPresentation(expired, new Date('2026-06-02T00:00:00.000Z')),
        ).toMatchObject({
            key: 'trial_ended',
            label: 'Prueba finalizada',
            needsAttention: true,
        })
    })

    it('requires a concrete plan to be considered configured', () => {
        expect(hasConfiguredPlan(baseSubscription)).toBe(true)
        expect(
            hasConfiguredPlan(
                subscription({
                    plan: {
                        ...baseSubscription.plan,
                        code: '',
                    },
                }),
            ),
        ).toBe(false)
        expect(getSubscriptionPresentation(null).key).toBe('missing')
    })

    it('calculates remaining trial days with a zero floor', () => {
        expect(
            getTrialDaysRemaining(baseSubscription, new Date('2026-06-17T00:00:00.000Z')),
        ).toBe(3)
        expect(
            getTrialDaysRemaining(baseSubscription, new Date('2026-06-25T00:00:00.000Z')),
        ).toBe(0)
    })
})
