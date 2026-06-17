import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import useSWR from 'swr'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import { apiGetSubscription } from '@/services/SubscriptionsService'
import { apiGetSeatUsage } from '@/services/TeamsService'
import {
    getSubscriptionPresentation,
} from '@/views/billing/subscriptionStatus'
import { buildOnboardingSummary } from '../onboardingModel'
import {
    TbCheck,
    TbChecklist,
    TbChevronDown,
    TbChevronUp,
    TbCircle,
    TbCreditCard,
    TbX,
} from 'react-icons/tb'

const DISMISSED_KEY = 'locentr:onboarding-dismissed'

type OnboardingChecklistProps = {
    companyId?: string | number
    locationsCount: number
    accessRulesCount: number
    accessLogsCount: number
}

function readDismissed(companyId?: string | number) {
    if (!companyId) return false

    return localStorage.getItem(`${DISMISSED_KEY}:${companyId}`) === '1'
}

const OnboardingChecklist = ({
    companyId,
    locationsCount,
    accessRulesCount,
    accessLogsCount,
}: OnboardingChecklistProps) => {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(true)
    const [dismissed, setDismissed] = useState(() => readDismissed(companyId))
    const { data: subscription } = useSWR(
        companyId ? ['onboarding:subscription', companyId] : null,
        () => apiGetSubscription(companyId),
        { revalidateOnFocus: false },
    )
    const { data: seats } = useSWR(
        companyId ? ['onboarding:seats', companyId] : null,
        () => apiGetSeatUsage(companyId),
        { revalidateOnFocus: false },
    )
    const summary = useMemo(
        () =>
            buildOnboardingSummary({
                companyId,
                locationsCount,
                accessRulesCount,
                accessLogsCount,
                seats,
                subscription,
            }),
        [
            accessLogsCount,
            accessRulesCount,
            companyId,
            locationsCount,
            seats,
            subscription,
        ],
    )
    const subscriptionState = getSubscriptionPresentation(subscription)

    if (summary.isComplete && dismissed) return null

    const dismiss = () => {
        if (!companyId) return
        localStorage.setItem(`${DISMISSED_KEY}:${companyId}`, '1')
        setDismissed(true)
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        <TbChecklist />
                        Onboarding operativo
                    </div>
                    <h3 className="mb-1">Prepara tu primera operación real</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Estado derivado de datos del backend. No se completa por hacer clic.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Tag className={subscriptionState.className}>
                            {summary.subscriptionLabel}
                        </Tag>
                        {summary.subscriptionNeedsAttention ? (
                            <Button
                                size="xs"
                                variant="plain"
                                onClick={() => navigate('/settings/billing')}
                            >
                                Revisar billing
                            </Button>
                        ) : null}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-subtle px-3 py-1 text-sm font-semibold text-primary">
                        <TbCreditCard />
                        {summary.completed}/{summary.steps.length}
                    </div>
                    {summary.isComplete ? (
                        <Button
                            aria-label="Descartar onboarding completo"
                            icon={<TbX />}
                            size="xs"
                            variant="plain"
                            onClick={dismiss}
                        />
                    ) : null}
                    <Button
                        aria-label={expanded ? 'Colapsar onboarding' : 'Expandir onboarding'}
                        icon={expanded ? <TbChevronUp /> : <TbChevronDown />}
                        size="xs"
                        variant="plain"
                        onClick={() => setExpanded((current) => !current)}
                    />
                </div>
            </div>

            {expanded ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {summary.steps.map((step) => (
                        <button
                            key={step.title}
                            type="button"
                            className="group flex min-h-[112px] items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary/[.03] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-800 dark:hover:bg-white/[.03]"
                            onClick={() => navigate(step.action)}
                        >
                            <span
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                    step.done
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                        : step.requiresAttention
                                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                }`}
                                aria-hidden="true"
                            >
                                {step.done ? <TbCheck /> : <TbCircle />}
                            </span>
                            <span>
                                <span className="block font-semibold text-slate-950 dark:text-slate-100">
                                    {step.title}
                                </span>
                                <span className="mt-1 block text-sm leading-5 text-slate-500 dark:text-slate-400">
                                    {step.description}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    )
}

export default OnboardingChecklist
