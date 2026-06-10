import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { useAuth } from '@/auth'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { RBAC, Permission } from '@/utils/rbac'
import useLocationDashboard from './hooks/useLocationDashboard'
import {
    TbArrowRight,
    TbBuildingCommunity,
    TbBuildingSkyscraper,
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

type OperationalArea = {
    title: string
    description: string
    path: string
    permission: Permission
    icon: ReactNode
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

const Dashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const selectedCompany = useCompaniesStore((state) => state.selectedName)
    const { data, error, isLoading, locationId, mutate } =
        useLocationDashboard()

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

    return (
        <Container>
            <div className="flex flex-col gap-8">
                <section className="relative overflow-hidden rounded-[22px] bg-[#0b4f48] px-5 py-7 text-white shadow-[0_18px_45px_rgba(11,79,72,0.16)] sm:px-8 sm:py-8">
                    <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/5" />
                    <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9be4d7]">
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
                                className="border-white bg-white text-[#0b4f48] hover:bg-[#edf8f5]"
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
                        </div>
                    </div>
                </section>

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
                        <div className="flex flex-col gap-8 border-y border-gray-200 py-6 dark:border-gray-800 lg:flex-row">
                            {genderTotal > 0 ? (
                                <div className="flex-1 lg:border-r lg:border-gray-200 lg:pr-8 dark:lg:border-gray-800">
                                    <div className="mb-4 flex items-end justify-between gap-3">
                                        <div>
                                            <h5>Distribución registrada</h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Sobre {genderTotal} ingresos con dato informado.
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
                                            className="bg-[#8bb8b1]"
                                            style={{
                                                width: `${((genderDistribution?.male ?? 0) / genderTotal) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                        <span>
                                            <strong>{genderDistribution?.female ?? 0}</strong>{' '}
                                            mujeres
                                        </span>
                                        <span>
                                            <strong>{genderDistribution?.male ?? 0}</strong>{' '}
                                            hombres
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            {monthlyEntries.length > 0 ? (
                                <div className="min-w-0 flex-1">
                                    <h5>Ingresos por mes</h5>
                                    <div className="mt-4 flex flex-col gap-3">
                                        {monthlyEntries.slice(-6).map((item) => (
                                            <div
                                                key={item.month}
                                                className="grid grid-cols-[72px_1fr_40px] items-center gap-3 text-sm"
                                            >
                                                <span className="truncate text-gray-500 dark:text-gray-400">
                                                    {item.month}
                                                </span>
                                                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                                    <div
                                                        className="h-full rounded-full bg-primary"
                                                        style={{
                                                            width: `${(item.count / maxMonthlyEntries) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <strong className="text-right">
                                                    {item.count}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
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
