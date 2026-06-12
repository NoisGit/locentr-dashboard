import { useMemo, useState } from 'react'
import useSWR from 'swr'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import Tag from '@/components/ui/Tag'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { Role } from '@/utils/rbac/types'
import { apiGetCompaniesPage } from '@/services/CompaniesService'
import {
    apiCreateInvitation,
    apiGetSeatUsage,
    apiListInvitations,
    apiResendInvitation,
    apiRevokeInvitation,
    type InvitationRole,
    type InvitationStatus,
} from '@/services/TeamsService'
import { getApiErrorMessage } from '@/utils/apiError'
import type { FormEvent } from 'react'

const statusLabel: Record<InvitationStatus, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptada',
    REVOKED: 'Revocada',
    EXPIRED: 'Expirada',
}

const statusClass: Record<InvitationStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    REVOKED: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
}

const roleLabel: Record<InvitationRole, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    CLIENT: 'Cliente',
}

type SeatCardProps = {
    label: string
    used: number
    pending: number
    limit: number
}

const SeatCard = ({ label, used, pending, limit }: SeatCardProps) => {
    const reserved = used + pending
    const available = Math.max(0, limit - reserved)
    const percentage = limit > 0 ? Math.min(100, Math.round((reserved / limit) * 100)) : 0

    return (
        <Card>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-sm text-gray-500">Licencias incluidas en el plan</p>
                </div>
                <Tag className="bg-primary-subtle text-primary">
                    {available} disponible{available === 1 ? '' : 's'}
                </Tag>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                    <p className="text-2xl font-semibold">{used}</p>
                    <p className="text-xs text-gray-500">Activas</p>
                </div>
                <div>
                    <p className="text-2xl font-semibold">{pending}</p>
                    <p className="text-xs text-gray-500">Invitadas</p>
                </div>
                <div>
                    <p className="text-2xl font-semibold">{limit}</p>
                    <p className="text-xs text-gray-500">Total del plan</p>
                </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="mt-2 text-xs text-gray-500">
                {reserved} de {limit} licencias utilizadas o reservadas
            </p>
        </Card>
    )
}

const Team = () => {
    const user = useSessionUser((state) => state.user)
    const isSuperAdmin = user.role === Role.SUPERADMIN
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const selectCompany = useCompaniesStore((state) => state.selectCompany)
    const companyId = isSuperAdmin ? String(selectedCompanyId || '') : String(user.company_id || '')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        email: '',
        fullName: '',
        username: '',
        role: 'OPERATOR' as InvitationRole,
    })
    const enabled = !isSuperAdmin || Boolean(companyId)

    const { data: companiesPage } = useSWR(isSuperAdmin ? 'team:companies' : null, () =>
        apiGetCompaniesPage({ pageIndex: 1, pageSize: 200 }),
    )
    const { data: invitations = [], mutate: mutateInvitations } = useSWR(
        enabled ? ['team:invitations', companyId || user.company_id] : null,
        () => apiListInvitations(companyId || user.company_id),
    )
    const { data: seats, mutate: mutateSeats } = useSWR(
        enabled ? ['team:seats', companyId || user.company_id] : null,
        () => apiGetSeatUsage(companyId || user.company_id),
    )

    const companyOptions = useMemo(
        () => (companiesPage?.items ?? []).filter((company) => !company.parent_company_id),
        [companiesPage],
    )

    const notify = (message: string, type: 'success' | 'danger' = 'success') => {
        toast.push(<Notification type={type}>{message}</Notification>, {
            placement: 'top-center',
        })
    }

    const copyLink = async (url: string) => {
        await navigator.clipboard.writeText(url)
        notify('Enlace de invitación copiado.')
    }

    const refresh = async () => {
        await Promise.all([mutateInvitations(), mutateSeats()])
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)
        try {
            const invitation = await apiCreateInvitation({
                company_id: companyId ? Number(companyId) : undefined,
                email: form.email,
                full_name: form.fullName,
                username: form.username,
                role: form.role,
            })
            await copyLink(invitation.invitation_url)
            setForm({
                email: '',
                fullName: '',
                username: '',
                role: 'OPERATOR',
            })
            await refresh()
        } catch (error) {
            notify(getApiErrorMessage(error, 'No se pudo crear la invitación.'), 'danger')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resend = async (invitationId: number) => {
        try {
            const invitation = await apiResendInvitation(invitationId)
            await copyLink(invitation.invitation_url)
            await refresh()
        } catch (error) {
            notify(getApiErrorMessage(error, 'No se pudo reenviar la invitación.'), 'danger')
        }
    }

    const revoke = async (invitationId: number) => {
        try {
            await apiRevokeInvitation(invitationId)
            notify('Invitación revocada.')
            await refresh()
        } catch (error) {
            notify(getApiErrorMessage(error, 'No se pudo revocar la invitación.'), 'danger')
        }
    }

    return (
        <Container>
            <div className="space-y-5">
                <div>
                    <p className="text-sm font-semibold text-primary">Personas y permisos</p>
                    <h3 className="mt-1">Equipo y licencias</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Administra quién puede ingresar a Locentr y cuántas licencias quedan
                        disponibles.
                    </p>
                </div>

                {isSuperAdmin ? (
                    <AdaptiveCard>
                        <label className="flex max-w-md flex-col gap-2 text-sm">
                            Empresa administrada
                            <select
                                className="rounded-xl border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-600"
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

                {seats ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <SeatCard
                            label="Administradores"
                            limit={seats.admins_limit}
                            pending={seats.pending_admins}
                            used={seats.admins_used}
                        />
                        <SeatCard
                            label="Operadores"
                            limit={seats.operators_limit}
                            pending={seats.pending_operators}
                            used={seats.operators_used}
                        />
                    </div>
                ) : null}

                {enabled ? (
                    <AdaptiveCard>
                        <div className="mb-5">
                            <h4>Invitar a una persona</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                La invitación reserva una licencia hasta que sea aceptada, revocada
                                o expire.
                            </p>
                        </div>
                        <form className="grid gap-4 lg:grid-cols-5" onSubmit={handleSubmit}>
                            <label className="flex flex-col gap-2 text-sm">
                                Nombre completo
                                <Input
                                    required
                                    placeholder="Ej. Francisca Núñez"
                                    value={form.fullName}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            fullName: event.target.value,
                                        }))
                                    }
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm">
                                Correo corporativo
                                <Input
                                    required
                                    type="email"
                                    placeholder="nombre@empresa.cl"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm">
                                Nombre de usuario
                                <Input
                                    required
                                    placeholder="francisca.nunez"
                                    value={form.username}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            username: event.target.value,
                                        }))
                                    }
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm">
                                Rol y nivel de acceso
                                <select
                                    className="h-11 rounded-xl border border-gray-300 bg-transparent px-3 dark:border-gray-600"
                                    value={form.role}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            role: event.target.value as InvitationRole,
                                        }))
                                    }
                                >
                                    {isSuperAdmin ? (
                                        <option value="ADMIN">Administrador</option>
                                    ) : null}
                                    <option value="OPERATOR">Operador</option>
                                    <option value="CLIENT">Cliente</option>
                                </select>
                            </label>
                            <Button
                                className="self-end"
                                type="submit"
                                variant="solid"
                                loading={isSubmitting}
                            >
                                Enviar invitación
                            </Button>
                        </form>
                    </AdaptiveCard>
                ) : null}

                <AdaptiveCard>
                    <div className="mb-4 flex items-center justify-between">
                        <h4>Invitaciones</h4>
                        <Button size="sm" onClick={() => refresh()}>
                            Actualizar
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700">
                                <tr>
                                    <th className="px-3 py-3">Persona</th>
                                    <th className="px-3 py-3">Rol</th>
                                    <th className="px-3 py-3">Estado</th>
                                    <th className="px-3 py-3">Expira</th>
                                    <th className="px-3 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map((invitation) => (
                                    <tr
                                        key={invitation.id}
                                        className="border-b border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-3 py-4">
                                            <p className="font-semibold">{invitation.full_name}</p>
                                            <p className="text-xs text-gray-500">
                                                {invitation.email}
                                            </p>
                                        </td>
                                        <td className="px-3 py-4">
                                            {roleLabel[invitation.role]}
                                        </td>
                                        <td className="px-3 py-4">
                                            <Tag className={statusClass[invitation.status]}>
                                                {statusLabel[invitation.status]}
                                            </Tag>
                                        </td>
                                        <td className="px-3 py-4">
                                            {new Intl.DateTimeFormat('es-CL', {
                                                dateStyle: 'medium',
                                            }).format(new Date(invitation.expires_at))}
                                        </td>
                                        <td className="px-3 py-4">
                                            {invitation.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="xs"
                                                        onClick={() => resend(invitation.id)}
                                                    >
                                                        Reenviar
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        onClick={() => revoke(invitation.id)}
                                                    >
                                                        Revocar
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!invitations.length ? (
                            <p className="py-10 text-center text-sm text-gray-500">
                                No hay invitaciones para esta empresa.
                            </p>
                        ) : null}
                    </div>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default Team
