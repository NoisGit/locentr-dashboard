import { lazy, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router'
import useSWR from 'swr'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { useAuth } from '@/auth'
import {
    isVirtualCompanyId,
    useCompaniesStore,
} from '@/store/companies/CompaniesStore'
import { RBAC, Permission } from '@/utils/rbac'
import { Role } from '@/utils/rbac/types'
import { apiGetSubscription } from '@/services/SubscriptionsService'
import { apiGetSeatUsage } from '@/services/TeamsService'
import useLocationDashboard from './hooks/useLocationDashboard'
import {
    TbArrowRight,
    TbBuildingCommunity,
    TbBuildingSkyscraper,
    TbCheck,
    TbChecklist,
    TbCircle,
    TbCreditCard,
    TbFileDescription,
    TbHelpCircle,
    TbHistory,
    TbMapPin,
    TbNotebook,
    TbShieldCheck,
    TbShieldLock,
    TbUsersGroup,
} from 'react-icons/tb'
import type { ReactNode } from 'react'

const Chart = lazy(() => import('@/components/shared/Chart'))

type OperationalArea = {
    title: string
    description: string
    path: string
    permission: Permission
    icon: ReactNode
}

type OnboardingChecklistProps = {
    companyId?: string | number
    locationsCount: number
    accessRulesCount: number
    accessLogsCount: number
}

const operationalAreas: OperationalArea[] = [
    {
        title: 'Edificios',
        description: 'Sedes, operadores y configuración operativa.',
        path: '/buildings',
        permission: Permission.VIEW_LOCATIONS,
        icon: <TbMapPin />,
    },
    {
        title: 'Control de accesos',
        description: 'Autorizaciones, restricciones y movimientos.',
        path: '/access',
        permission: Permission.VIEW_ACCESS_MANAGEMENT,
        icon: <TbShieldLock />,
    },
    {
        title: 'Documentos',
        description: 'Archivos vinculados a empresas y ubicaciones.',
        path: '/documents',
        permission: Permission.VIEW_DOCUMENTS,
        icon: <TbFileDescription />,
    },
    {
        title: 'Tickets de soporte',
        description: 'Solicitudes e incidencias de la operación.',
        path: '/tickets',
        permission: Permission.VIEW_SUPPORT_TICKETS,
        icon: <TbHelpCircle />,
    },
    {
        title: 'Empresas',
        description: 'Estructura de empresas y subempresas.',
        path: '/companies',
        permission: Permission.VIEW_COMPANIES,
        icon: <TbBuildingSkyscraper />,
    },
    {
        title: 'Auditoría',
        description: 'Trazabilidad de acciones relevantes del sistema.',
        path: '/audit',
        permission: Permission.VIEW_AUDIT_LOG,
        icon: <TbHistory />,
    },
    {
        title: 'Libro de novedades',
        description: 'Hechos relevantes registrados por edificio.',
        path: '/logbook',
        permission: Permission.VIEW_LOCATION_LOGBOOK,
        icon: <TbNotebook />,
    },
]

const OnboardingChecklist = ({
    companyId,
    locationsCount,
    accessRulesCount,
    accessLogsCount,
}: OnboardingChecklistProps) => {
    const navigate = useNavigate()
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
    const peopleConfigured =
        (seats?.admins_used ?? 0) +
            (seats?.operators_used ?? 0) +
            (seats?.pending_admins ?? 0) +
            (seats?.pending_operators ?? 0) >
        1
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
            done: peopleConfigured,
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
            title: 'Plan y trial revisados',
            description: 'Verifica estado comercial y límites del plan.',
            done: Boolean(subscription?.status),
            action: '/settings/billing',
        },
    ]
    const completed = steps.filter((step) => step.done).length

    return (
        <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm dark:border-violet-900/40 dark:bg-gray-900">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        <TbChecklist />
                        Onboarding operativo
                    </div>
                    <h3 className="mb-1">Prepara tu primera operación real</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estado derivado de datos del backend. No se completa por hacer clic.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-subtle px-3 py-1 text-sm font-semibold text-primary">
                    <TbCreditCard />
                    {completed}/{steps.length}
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {steps.map((step) => (
                    <button
                        key={step.title}
                        type="button"
                        className="group flex min-h-[112px] items-start gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary/[.03] focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-800 dark:hover:bg-white/[.03]"
                        onClick={() => navigate(step.action)}
                    >
                        <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                step.done
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                            }`}
                            aria-hidden="true"
                        >
                            {step.done ? <TbCheck /> : <TbCircle />}
                        </span>
                        <span>
                            <span className="block font-semibold text-gray-900 dark:text-gray-100">
                                {step.title}
                            </span>
                            <span className="mt-1 block text-sm leading-5 text-gray-500 dark:text-gray-400">
                                {step.description}
                            </span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    )
}

const Dashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const selectedCompany = useCompaniesStore((state) => state.selectedName)
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const { data, error, isLoading, locationId, locations, mutate } =
        useLocationDashboard()
    const companyId =
        selectedCompanyId !== undefined &&
        selectedCompanyId !== null &&
        !isVirtualCompanyId(selectedCompanyId)
            ? selectedCompanyId
            : (user.company_id ?? undefined)
    const canSeeOnboarding = RBAC.hasAnyRole(user, [Role.SUPERADMIN, Role.ADMIN])

    const visibleAreas = useMemo(
        () =>
            operationalAreas.filter((area) =>
                RBAC.hasPermission(user, area.permission),
            ),
        [user],
    )

    const displayName =
        user.full_name || user.userName || user.email?.split('@')[0] || 'equipo'
    const kpis = data?.kpis
    const genderDistribution = data?.charts?.gender_distribution
    const genderTotal =
        (genderDistribution?.male ?? 0) + (genderDistribution?.female ?? 0)
    const monthlyEntries = data?.charts?.entries_by_month?.entries_by_month ?? []
    const maxMonthlyEntries = Math.max(
        1,
        ...monthlyEntries.map((item) => item.count),
    )
    const recentEntries = data?.recent_entries ?? []
    const accessRulesCount =
        (kpis?.whitelist?.total ?? 0) + (kpis?.blacklist?.total ?? 0)
    const activeLocation = locations.find(
        (location) => String(location.id) === String(locationId),
    )

    return (
        <Container>
            <div className="flex flex-col gap-8">
                <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#312e81] px-5 py-7 text-white shadow-[0_18px_45px_rgba(76,29,149,0.22)] sm:px-8 sm:py-8">
                    <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/5" />
                    <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
                                <TbBuildingCommunity className="text-base" />
                                Centro de operaciones
                            </div>
                            <h1 className="mb-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Hola, {displayName}
                            </h1>
                            <p className="max-w-2xl text-sm font-normal leading-6 text-white/75 sm:text-base sm:leading-7">
                                Supervisa la actividad de tus edificios y accede a cada módulo según tus permisos.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                className="border-white bg-white text-violet-900 hover:bg-violet-50"
                                variant="solid"
                                onClick={() => navigate('/buildings')}
                            >
                                Ver edificios
                            </Button>
                            {selectedCompany && (
                                <span className="text-sm text-white/75">
                                    Empresa: <strong className="text-white">{selectedCompany}</strong>
                                </span>
                            )}
                            {activeLocation?.name ? (
                                <span className="text-sm text-white/75">
                                    Edificio activo:{' '}
                                    <strong className="text-white">{activeLocation.name}</strong>
                                </span>
                            ) : null}
                        </div>
                    </div>
                </section>

                {canSeeOnboarding ? (
                    <OnboardingChecklist
                        companyId={companyId}
                        locationsCount={locations.length}
                        accessRulesCount={accessRulesCount}
                        accessLogsCount={kpis?.historical_total ?? 0}
                    />
                ) : null}

                {locationId ? (
                    <section>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h3 className="mb-1">Actividad de la ubicación</h3>
                                <p className="font-normal text-gray-500 dark:text-gray-400">
                                    Datos entregados por el dashboard operativo de la API.
                                </p>
                            </div>
                            {error ? (
                                <Button size="sm" onClick={() => mutate()}>
                                    Reintentar
                                </Button>
                            ) : null}
                        </div>
                        <Loading loading={isLoading}>
                            {kpis ? (
                                <div className="grid grid-cols-2 border-y border-gray-200 dark:border-gray-800 lg:grid-cols-4">
                                    {[
                                        ['Accesos históricos', kpis.historical_total, <TbHistory key="history" />],
                                        ['Entradas hoy', kpis.entries_today, <TbUsersGroup key="entries" />],
                                        ['Personas dentro', kpis.currently_inside, <TbBuildingCommunity key="inside" />],
                                        ['Autorizaciones', kpis.whitelist.total, <TbShieldCheck key="allowed" />],
                                    ].map(([label, value, icon], index) => (
                                        <div
                                            key={String(label)}
                                            className={`py-5 ${
                                                index % 2 === 0 ? 'pr-4' : 'pl-4'
                                            } ${
                                                index < 2 ? 'border-b lg:border-b-0' : ''
                                            } border-gray-200 dark:border-gray-800 lg:border-r lg:px-6 first:lg:pl-0 last:lg:border-r-0`}
                                        >
                                            <div className="mb-3 text-xl text-primary">
                                                {icon}
                                            </div>
                                            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {String(value)}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="border-y border-gray-200 py-5 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    {error
                                        ? 'No fue posible cargar la actividad de esta ubicación.'
                                        : 'La API no entregó métricas para esta ubicación.'}
                                </p>
                            )}
                        </Loading>
                    </section>
                ) : null}

                {locationId && (genderTotal > 0 || monthlyEntries.length > 0) ? (
                    <section>
                        <div className="mb-4">
                            <h3 className="mb-1">Métricas de ocupación</h3>
                            <p className="font-normal text-gray-500 dark:text-gray-400">
                                Información agregada de accesos, sin exponer identificadores personales.
                            </p>
                        </div>
                        <div className="grid gap-6 border-y border-gray-200 py-6 dark:border-gray-800 lg:grid-cols-[0.7fr_1.3fr]">
                            {genderTotal > 0 ? (
                                <div className="lg:border-r lg:border-gray-200 lg:pr-8 dark:lg:border-gray-800">
                                    <div className="mb-4 flex items-end justify-between gap-3">
                                        <div>
                                            <h5>Distribución registrada</h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {genderTotal.toLocaleString('es-CL')}% de registros
                                                con dato informado.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                        <div
                                            className="bg-primary"
                                            style={{
                                                width: `${((genderDistribution?.female ?? 0) / genderTotal) * 100}%`,
                                            }}
                                        />
                                        <div
                                            className="bg-indigo-300 dark:bg-indigo-500"
                                            style={{
                                                width: `${((genderDistribution?.male ?? 0) / genderTotal) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                        <span>
                                            <strong>{genderDistribution?.female ?? 0}%</strong>{' '}
                                            mujeres
                                        </span>
                                        <span>
                                            <strong>{genderDistribution?.male ?? 0}%</strong>{' '}
                                            hombres
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            {monthlyEntries.length > 0 ? (
                                <div className="min-w-0">
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <h5>Tendencia de accesos</h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Volumen mensual del año en curso.
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary">
                                            Máximo {maxMonthlyEntries}
                                        </span>
                                    </div>
                                    <Suspense
                                        fallback={
                                            <div className="mt-4 h-[245px] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                                        }
                                    >
                                        <Chart
                                            className="mt-2"
                                            height={245}
                                            type="area"
                                            xAxis={monthlyEntries
                                                .slice(-6)
                                                .map((item) => item.month)}
                                            series={[
                                                {
                                                    name: 'Accesos',
                                                    data: monthlyEntries
                                                        .slice(-6)
                                                        .map((item) => item.count),
                                                },
                                            ]}
                                            customOptions={{
                                                chart: {
                                                    toolbar: { show: false },
                                                    zoom: { enabled: false },
                                                },
                                                colors: ['#7C3AED'],
                                                dataLabels: { enabled: false },
                                                fill: {
                                                    type: 'gradient',
                                                    gradient: {
                                                        opacityFrom: 0.42,
                                                        opacityTo: 0.04,
                                                        stops: [0, 90, 100],
                                                    },
                                                },
                                                grid: {
                                                    borderColor: 'rgba(148, 163, 184, 0.16)',
                                                    strokeDashArray: 4,
                                                },
                                                stroke: { curve: 'smooth', width: 3 },
                                                tooltip: { theme: 'dark' },
                                                yaxis: {
                                                    min: 0,
                                                    forceNiceScale: true,
                                                },
                                            }}
                                        />
                                    </Suspense>
                                </div>
                            ) : null}
                        </div>
                    </section>
                ) : null}

                {locationId && recentEntries.length > 0 ? (
                    <section>
                        <div className="mb-3">
                            <h3 className="mb-1">Actividad reciente</h3>
                            <p className="font-normal text-gray-500 dark:text-gray-400">
                                Últimos movimientos informados por el edificio.
                            </p>
                        </div>
                        <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                            {recentEntries.slice(0, 6).map((entry, index) => (
                                <div
                                    key={`${entry.timestamp}-${index}`}
                                    className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <div className="font-semibold">
                                            {entry.name || 'Persona registrada'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {entry.destination || 'Destino no informado'}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {entry.timestamp || 'Sin fecha'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <section>
                    <div className="mb-3">
                        <h3 className="mb-1">Áreas de trabajo</h3>
                        <p className="font-normal text-gray-500 dark:text-gray-400">
                            Accesos disponibles según tu rol y permisos.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 border-t border-gray-200 dark:border-gray-800 md:grid-cols-2">
                        {visibleAreas.map((area, index) => (
                            <button
                                key={area.path}
                                type="button"
                                className={`group flex items-center gap-4 border-b border-gray-200 py-5 text-left transition-colors hover:bg-primary/[.035] dark:border-gray-800 dark:hover:bg-white/[.025] ${
                                    index % 2 === 0
                                        ? 'md:border-r md:pr-6'
                                        : 'md:pl-6'
                                }`}
                                onClick={() => navigate(area.path)}
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-xl text-primary">
                                    {area.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h5 className="mb-1">{area.title}</h5>
                                    <p className="font-normal leading-5 text-gray-500 dark:text-gray-400">
                                        {area.description}
                                    </p>
                                </div>
                                <TbArrowRight className="shrink-0 text-lg text-gray-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </Container>
    )
}

export default Dashboard
