import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'react-router-dom'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Notification from '@/components/ui/Notification'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { Role } from '@/utils/rbac/types'
import { apiGetCompaniesPage } from '@/services/CompaniesService'
import {
    apiCreateBillingPortal,
    apiCreateCheckout,
    apiGetSubscription,
    apiListPlans,
} from '@/services/SubscriptionsService'
import {
    apiGetCommunicationPreferences,
    apiListInvoices,
    apiUpdateCommunicationPreferences,
} from '@/services/LifecycleService'
import { getApiErrorMessage } from '@/utils/apiError'
import useAutoSelectRootCompany from '@/utils/hooks/useAutoSelectRootCompany'
import {
    getSubscriptionPresentation,
    getTrialDaysRemaining,
} from './subscriptionStatus'

const formatMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100)

const Billing = () => {
    const user = useSessionUser((state) => state.user)
    const isSuperAdmin = user.role === Role.SUPERADMIN
    const [searchParams] = useSearchParams()
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const selectCompany = useCompaniesStore((state) => state.selectCompany)
    const companyId = isSuperAdmin ? String(selectedCompanyId || '') : String(user.company_id || '')
    const [redirecting, setRedirecting] = useState(false)
    const [savingPreferences, setSavingPreferences] = useState(false)
    const { data: companiesPage } = useSWR(isSuperAdmin ? 'billing:companies' : null, () =>
        apiGetCompaniesPage({ pageIndex: 1, pageSize: 200 }),
    )
    const { data: plans = [] } = useSWR('billing:plans', apiListPlans)
    const { data: subscription, mutate } = useSWR(
        !isSuperAdmin || companyId ? ['billing:subscription', companyId || user.company_id] : null,
        () => apiGetSubscription(companyId || user.company_id),
    )
    const lifecycleKey = !isSuperAdmin || companyId ? companyId || user.company_id : null
    const { data: invoices = [], mutate: mutateInvoices } = useSWR(
        lifecycleKey ? ['billing:invoices', lifecycleKey] : null,
        () => apiListInvoices(lifecycleKey),
    )
    const { data: preferences, mutate: mutatePreferences } = useSWR(
        lifecycleKey ? ['billing:preferences', lifecycleKey] : null,
        () => apiGetCommunicationPreferences(lifecycleKey),
    )
    const companyOptions = useMemo(
        () => (companiesPage?.items ?? []).filter((company) => !company.parent_company_id),
        [companiesPage],
    )
    useAutoSelectRootCompany(companyOptions, isSuperAdmin)

    const subscriptionState = getSubscriptionPresentation(subscription)
    const daysRemaining = useMemo(
        () => getTrialDaysRemaining(subscription),
        [subscription],
    )

    const notifyError = (error: unknown, fallback: string) => {
        toast.push(
            <Notification type="danger">{getApiErrorMessage(error, fallback)}</Notification>,
            { placement: 'top-center' },
        )
    }

    const redirectToCheckout = async (planCode: string) => {
        setRedirecting(true)
        try {
            const response = await apiCreateCheckout(planCode, companyId || user.company_id)
            window.location.assign(response.url)
        } catch (error) {
            notifyError(error, 'No se pudo iniciar el checkout.')
            setRedirecting(false)
        }
    }

    const openPortal = async () => {
        setRedirecting(true)
        try {
            const response = await apiCreateBillingPortal(companyId || user.company_id)
            window.location.assign(response.url)
        } catch (error) {
            notifyError(error, 'No se pudo abrir el portal de facturación.')
            setRedirecting(false)
        }
    }

    const updatePreferences = async (
        field: 'billing_emails' | 'product_emails',
        checked: boolean,
    ) => {
        if (!preferences) return
        setSavingPreferences(true)
        try {
            const updated = await apiUpdateCommunicationPreferences(
                {
                    billing_emails:
                        field === 'billing_emails' ? checked : preferences.billing_emails,
                    product_emails:
                        field === 'product_emails' ? checked : preferences.product_emails,
                },
                lifecycleKey,
            )
            await mutatePreferences(updated, { revalidate: false })
            toast.push(<Notification type="success">Preferencias actualizadas.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            notifyError(error, 'No se pudieron guardar las preferencias.')
        } finally {
            setSavingPreferences(false)
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
                            <Button disabled={redirecting} onClick={openPortal}>
                                Gestionar facturación
                            </Button>
                        ) : null}
                    </div>
                </div>

                {searchParams.get('checkout') ? (
                    <Notification
                        type={searchParams.get('checkout') === 'success' ? 'success' : 'warning'}
                    >
                        {searchParams.get('checkout') === 'success'
                            ? 'Checkout completado. Actualizando el estado por webhook.'
                            : 'Checkout cancelado; tu plan actual no cambió.'}
                    </Notification>
                ) : null}

                {subscriptionState.key === 'payment_pending' ? (
                    <Notification type="warning">
                        Hay un pago pendiente. Actualiza el medio de pago para evitar la suspensión
                        de la operación.
                    </Notification>
                ) : null}

                {subscriptionState.key === 'subscription_canceled' ? (
                    <Notification type="danger">
                        La suscripción está cancelada. Los datos se conservan, pero debes elegir un
                        plan para reactivar el servicio.
                    </Notification>
                ) : null}

                {subscriptionState.key === 'trial_ended' ? (
                    <Notification type="warning">
                        La prueba gratuita finalizó. Elige un plan o abre el portal de facturación
                        para reactivar la operación.
                    </Notification>
                ) : null}

                {isSuperAdmin ? (
                    <AdaptiveCard>
                        <label className="flex max-w-md flex-col gap-2 text-sm">
                            Empresa raíz
                            <select
                                className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-600"
                                value={companyId}
                                onChange={(event) => {
                                    const selected = companyOptions.find(
                                        (company) => String(company.id) === event.target.value,
                                    )
                                    if (selected) {
                                        selectCompany({
                                            id: selected.id,
                                            name: selected.name,
                                        })
                                    }
                                }}
                            >
                                <option value="">Seleccionar empresa</option>
                                {companyOptions.map((company) => (
                                    <option key={company.id} value={company.id}>
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
                                <Tag className={`mt-3 ${subscriptionState.className}`}>
                                    {subscriptionState.label}
                                </Tag>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    {subscriptionState.description}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-gray-500">Plan</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {subscription.plan.name}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-gray-500">Días de prueba restantes</p>
                                <p className="mt-2 text-2xl font-semibold">{daysRemaining}</p>
                            </Card>
                        </div>

                        <AdaptiveCard>
                            <h4 className="mb-4">Uso actual</h4>
                            <div className="grid gap-5 md:grid-cols-2">
                                {usageItems.map((item) => {
                                    const percent = Math.min(
                                        100,
                                        Math.round((item.value / item.limit) * 100),
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

                        <div className="grid gap-4 lg:grid-cols-2">
                            <AdaptiveCard>
                                <h4>Preferencias de comunicación</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Decide qué mensajes recibe la administración de esta empresa.
                                </p>
                                <div className="mt-5 space-y-5">
                                    <label className="flex items-center justify-between gap-4">
                                        <span>
                                            <span className="block font-semibold">
                                                Facturación y pagos
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Facturas, pagos fallidos y cancelaciones.
                                            </span>
                                        </span>
                                        <Switcher
                                            checked={preferences?.billing_emails ?? true}
                                            disabled={!preferences || savingPreferences}
                                            onChange={(checked) =>
                                                updatePreferences('billing_emails', checked)
                                            }
                                        />
                                    </label>
                                    <label className="flex items-center justify-between gap-4">
                                        <span>
                                            <span className="block font-semibold">Producto</span>
                                            <span className="text-xs text-gray-500">
                                                Novedades y recomendaciones de uso.
                                            </span>
                                        </span>
                                        <Switcher
                                            checked={preferences?.product_emails ?? true}
                                            disabled={!preferences || savingPreferences}
                                            onChange={(checked) =>
                                                updatePreferences('product_emails', checked)
                                            }
                                        />
                                    </label>
                                </div>
                            </AdaptiveCard>

                            <AdaptiveCard>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4>Facturas</h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Historial sincronizado con Stripe.
                                        </p>
                                    </div>
                                    <Button size="sm" onClick={() => mutateInvoices()}>
                                        Actualizar
                                    </Button>
                                </div>
                                <div className="mt-5 space-y-3">
                                    {invoices.slice(0, 5).map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {formatMoney(
                                                        invoice.amount_due,
                                                        invoice.currency,
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Intl.DateTimeFormat('es-CL', {
                                                        dateStyle: 'medium',
                                                    }).format(new Date(invoice.created_at))}{' '}
                                                    · {invoice.status}
                                                </p>
                                            </div>
                                            {invoice.invoice_pdf || invoice.hosted_invoice_url ? (
                                                <a
                                                    href={
                                                        invoice.invoice_pdf ||
                                                        invoice.hosted_invoice_url ||
                                                        '#'
                                                    }
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    <Button size="xs">Ver</Button>
                                                </a>
                                            ) : null}
                                        </div>
                                    ))}
                                    {!invoices.length ? (
                                        <p className="py-8 text-center text-sm text-gray-500">
                                            Aún no hay facturas emitidas.
                                        </p>
                                    ) : null}
                                </div>
                            </AdaptiveCard>
                        </div>
                    </>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card key={plan.code}>
                            <h4>{plan.name}</h4>
                            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                            <p className="mt-4 text-2xl font-semibold">
                                USD {plan.monthly_price_cents / 100}/mes
                            </p>
                            <Button
                                className="mt-5 w-full"
                                disabled={redirecting || !plan.checkout_available || !subscription}
                                title={
                                    plan.checkout_available
                                        ? undefined
                                        : 'Configura la clave y el Price ID de Stripe para habilitar checkout.'
                                }
                                onClick={() => redirectToCheckout(plan.code)}
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
