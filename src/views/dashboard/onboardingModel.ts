import type { CompanySubscription } from '@/services/SubscriptionsService'
import type { SeatUsage } from '@/services/TeamsService'
import { getSubscriptionPresentation, hasConfiguredPlan } from '@/views/billing/subscriptionStatus'

export type OnboardingStep = {
    title: string
    description: string
    done: boolean
    action: string
    requiresAttention?: boolean
}

export type OnboardingSummary = {
    steps: OnboardingStep[]
    completed: number
    isComplete: boolean
    subscriptionLabel: string
    subscriptionDescription: string
    subscriptionNeedsAttention: boolean
}

export function hasConfiguredPeople(seats?: SeatUsage | null) {
    return (
        (seats?.admins_used ?? 0) +
            (seats?.operators_used ?? 0) +
            (seats?.pending_admins ?? 0) +
            (seats?.pending_operators ?? 0) >
        1
    )
}

export function buildOnboardingSummary({
    companyId,
    locationsCount,
    accessRulesCount,
    accessLogsCount,
    seats,
    subscription,
    now,
}: {
    companyId?: string | number
    locationsCount: number
    accessRulesCount: number
    accessLogsCount: number
    seats?: SeatUsage | null
    subscription?: CompanySubscription | null
    now?: Date
}): OnboardingSummary {
    const subscriptionState = getSubscriptionPresentation(subscription, now)
    const steps = [
        {
            title: 'Empresa principal activa',
            description: 'Selecciona o completa la empresa operativa.',
            done: Boolean(companyId),
            action: '/companies',
        },
        {
            title: 'Primer edificio creado',
            description: 'Carga la primera sede real de operación.',
            done: locationsCount > 0,
            action: '/buildings/create',
        },
        {
            title: 'Primer usuario invitado',
            description: 'Suma un administrador u operador al equipo.',
            done: hasConfiguredPeople(seats),
            action: '/settings/team',
        },
        {
            title: 'Accesos configurados',
            description: 'Agrega una autorización o restricción inicial.',
            done: accessRulesCount > 0,
            action: '/access',
        },
        {
            title: 'Primera operación registrada',
            description: 'Confirma que existen movimientos reales.',
            done: accessLogsCount > 0,
            action: '/access',
        },
        {
            title: 'Plan configurado',
            description: subscriptionState.description,
            done: hasConfiguredPlan(subscription),
            action: '/settings/billing',
            requiresAttention: subscriptionState.needsAttention,
        },
    ]
    const completed = steps.filter((step) => step.done).length

    return {
        steps,
        completed,
        isComplete: completed === steps.length,
        subscriptionLabel: subscriptionState.label,
        subscriptionDescription: subscriptionState.description,
        subscriptionNeedsAttention: subscriptionState.needsAttention,
    }
}
