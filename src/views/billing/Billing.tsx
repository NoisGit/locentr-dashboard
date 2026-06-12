import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'react-router-dom'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'
import { apiGetCompaniesPage } from '@/services/CompaniesService'
import {
    apiCreateBillingPortal,
    apiCreateCheckout,
    apiGetSubscription,
    apiListPlans,
} from '@/services/SubscriptionsService'
import { getApiErrorMessage } from '@/utils/apiError'

const Billing = () => {
    const user = useSessionUser((state) => state.user)
    const isSuperAdmin = user.role === Role.SUPERADMIN
    const [searchParams] = useSearchParams()
    const [companyId, setCompanyId] = useState(
        isSuperAdmin ? '' : String(user.company_id || ''),
    )
    const [redirecting, setRedirecting] = useState(false)
    const { data: companiesPage } = useSWR(
        isSuperAdmin ? 'billing:companies' : null,
        () => apiGetCompaniesPage({ pageIndex: 1, pageSize: 200 }),
    )
    const { data: plans = [] } = useSWR('billing:plans', apiListPlans)
    const { data: subscription, mutate } = useSWR(
        !isSuperAdmin || companyId
            ? ['billing:subscription', companyId || user.company_id]
            : null,
        () => apiGetSubscription(companyId || user.company_id),
    )

    const daysRemaining = useMemo(() => {
        if (!subscription) return 0
        const difference =
            new Date(subscription.trial_ends_at).getTime() - Date.now()
        return Math.max(0, Math.ceil(difference / 86_400_000))
    }, [subscription])

    const notifyError = (error: unknown, fallback: string) => {
        toast.push(
            <Notification type="danger">
                {getApiErrorMessage(error, fallback)}
            </Notification>,
            { placement: 'top-center' },
        )
    }

    const redirectToCheckout = async (planCode: string) => {
        setRedirecting(true)
        try {
            const response = await apiCreateCheckout(
                planCode,
                companyId || user.company_id,
            )
            window.location.assign(response.url)
        } catch (error) {
            notifyError(error, 'No se pudo iniciar el checkout.')
            setRedirecting(false)
        }
    }

    const openPortal = async () => {
        setRedirecting(true)
        try {
            const response = await apiCreateBillingPortal(
                companyId || user.company_id,
            )
            window.location.assign(response.url)
        } catch (error) {
            notifyError(error, 'No se pudo abrir el portal de facturación.')
            setRedirecting(false)
        }
    }

    const usageItems = subscription
        ? [
              {
                  label: 'Ubicaciones',
                  value: subscription.usage.locations,
                  limit: subscription.plan.qty_locations,
              },
              {
                  label: 'Administradores',
                  value: subscription.usage.admins,
                  limit: subscription.plan.qty_admins,
              },
              {
                  label: 'Operadores',
                  value: subscription.usage.operators,
                  limit: subscription.plan.qty_operators,
              },
              {
                  label: 'Accesos de hoy',
                  value: subscription.usage.daily_reads,
                  limit: subscription.plan.qty_daily_reads,
              },
          ]
        : []

    return (
        <Container>
            <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h3>Plan y facturación</h3>
                        <p className="text-sm text-gray-500">
                            Trial, límites de uso y administración de Stripe.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => mutate()}>Actualizar</Button>
                        {subscription?.status === 'ACTIVE' ? (
                            <Button
                                disabled={redirecting}
                                onClick={openPortal}
                            >
                                Gestionar facturación
                            </Button>
                        ) : null}
                    </div>
                </div>

                {searchParams.get('checkout') ? (
                    <Notification
                        type={
                            searchParams.get('checkout') === 'success'
                                ? 'success'
                                : 'warning'
                        }
                    >
                        {searchParams.get('checkout') === 'success'
                            ? 'Checkout completado. Actualizando el estado por webhook.'
                            : 'Checkout cancelado; tu plan actual no cambió.'}
                    </Notification>
                ) : null}

                {isSuperAdmin ? (
                    <AdaptiveCard>
                        <label className="flex max-w-md flex-col gap-2 text-sm">
                            Empresa raíz
                            <select
                                className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-600"
                                value={companyId}
                                onChange={(event) =>
                                    setCompanyId(event.target.value)
                                }
                            >
                                <option value="">Seleccionar empresa</option>
                                {(companiesPage?.items ?? [])
                                    .filter(
                                        (company) =>
                                            !company.parent_company_id,
                                    )
                                    .map((company) => (
                                        <option
                                            key={company.id}
                                            value={company.id}
                                        >
                                            {company.name}
                                        </option>
                                    ))}
                            </select>
                        </label>
                    </AdaptiveCard>
                ) : null}

                {subscription ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <p className="text-sm text-gray-500">Estado</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {subscription.status}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-gray-500">Plan</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {subscription.plan.name}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-gray-500">
                                    Días de prueba restantes
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {daysRemaining}
                                </p>
                            </Card>
                        </div>

                        <AdaptiveCard>
                            <h4 className="mb-4">Uso actual</h4>
                            <div className="grid gap-5 md:grid-cols-2">
                                {usageItems.map((item) => {
                                    const percent = Math.min(
                                        100,
                                        Math.round(
                                            (item.value / item.limit) * 100,
                                        ),
                                    )
                                    return (
                                        <div key={item.label}>
                                            <div className="mb-2 flex justify-between text-sm">
                                                <span>{item.label}</span>
                                                <span>
                                                    {item.value} / {item.limit}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${percent}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </AdaptiveCard>
                    </>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card key={plan.code}>
                            <h4>{plan.name}</h4>
                            <p className="mt-2 text-sm text-gray-500">
                                {plan.description}
                            </p>
                            <p className="mt-4 text-2xl font-semibold">
                                USD {plan.monthly_price_cents / 100}/mes
                            </p>
                            <Button
                                className="mt-5 w-full"
                                disabled={
                                    redirecting ||
                                    !plan.checkout_available ||
                                    !subscription
                                }
                                title={
                                    plan.checkout_available
                                        ? undefined
                                        : 'Configura la clave y el Price ID de Stripe para habilitar checkout.'
                                }
                                onClick={() =>
                                    redirectToCheckout(plan.code)
                                }
                            >
                                {subscription?.plan.code === plan.code
                                    ? 'Plan actual'
                                    : 'Elegir plan'}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </Container>
    )
}

export default Billing
