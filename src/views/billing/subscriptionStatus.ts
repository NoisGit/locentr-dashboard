import type { CompanySubscription } from '@/services/SubscriptionsService'

export type SubscriptionPresentationKey =
    | 'trial_active'
    | 'plan_active'
    | 'payment_pending'
    | 'subscription_canceled'
    | 'trial_ended'
    | 'missing'

export type SubscriptionPresentation = {
    key: SubscriptionPresentationKey
    label: string
    description: string
    className: string
    needsAttention: boolean
}

export function hasConfiguredPlan(subscription?: CompanySubscription | null) {
    return Boolean(subscription?.plan?.code && subscription.plan.name)
}

export function isTrialExpired(
    subscription?: CompanySubscription | null,
    now = new Date(),
) {
    if (!subscription || subscription.status !== 'TRIALING') return false

    return new Date(subscription.trial_ends_at).getTime() <= now.getTime()
}

export function getTrialDaysRemaining(
    subscription?: CompanySubscription | null,
    now = new Date(),
) {
    if (!subscription?.trial_ends_at) return 0

    const difference = new Date(subscription.trial_ends_at).getTime() - now.getTime()
    return Math.max(0, Math.ceil(difference / 86_400_000))
}

export function getSubscriptionPresentation(
    subscription?: CompanySubscription | null,
    now = new Date(),
): SubscriptionPresentation {
    if (!subscription || !hasConfiguredPlan(subscription)) {
        return {
            key: 'missing',
            label: 'Plan sin configurar',
            description: 'El tenant todavía no tiene una suscripción y plan reales.',
            className:
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
            needsAttention: true,
        }
    }

    if (isTrialExpired(subscription, now)) {
        return {
            key: 'trial_ended',
            label: 'Prueba finalizada',
            description: 'La prueba gratuita terminó. Activa un plan para continuar.',
            className:
                'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
            needsAttention: true,
        }
    }

    if (subscription.status === 'TRIALING') {
        return {
            key: 'trial_active',
            label: 'Prueba activa',
            description: 'La empresa está operando dentro del periodo de prueba.',
            className:
                'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
            needsAttention: false,
        }
    }

    if (subscription.status === 'ACTIVE') {
        return {
            key: 'plan_active',
            label: 'Plan activo',
            description: 'La suscripción está activa y los límites del plan aplican.',
            className:
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
            needsAttention: false,
        }
    }

    if (subscription.status === 'PAST_DUE') {
        return {
            key: 'payment_pending',
            label: 'Pago pendiente',
            description: 'Actualiza el medio de pago para evitar suspensión.',
            className:
                'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
            needsAttention: true,
        }
    }

    return {
        key: 'subscription_canceled',
        label: 'Suscripción cancelada',
        description: 'El tenant conserva sus datos, pero necesita reactivar un plan.',
        className: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
        needsAttention: true,
    }
}
