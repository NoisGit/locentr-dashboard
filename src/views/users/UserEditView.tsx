import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import UsersForm, { type UserFormSchema } from './UsersForm/UsersForm'
import { apiGetUserById, apiUpdateUser, type CreatableUserRole } from '@/services/UsersService'
import { getApiErrorMessage } from '@/utils/apiError'

const UserEditView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const userId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, error, isLoading, mutate } = useSWR(
        userId ? ['users:detail', userId] : null,
        ([, currentId]) => apiGetUserById(currentId as string),
        { revalidateOnFocus: false },
    )

    const handleSubmit = async (values: UserFormSchema) => {
        if (!userId || !values.role) return

        try {
            setIsSubmitting(true)
            await apiUpdateUser(userId, {
                full_name: values.full_name.trim(),
                email: values.email.trim().toLowerCase(),
                role: values.role as CreatableUserRole,
                status: values.status ?? true,
            })
            await mutate()
            toast.push(
                <Notification type="success">Usuario actualizado correctamente.</Notification>,
                { placement: 'top-center' },
            )
            navigate(`/users/${userId}`)
        } catch (updateError) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(updateError, 'No se pudo actualizar el usuario.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isLoading && error) {
        return (
            <EmptyState
                title="No fue posible cargar el usuario"
                description={getApiErrorMessage(error, 'Revisa la conexión e intenta nuevamente.')}
                actionLabel="Volver a usuarios"
                onAction={() => navigate('/users')}
            />
        )
    }

    if (!isLoading && data?.role === 'SUPERADMIN') {
        return (
            <EmptyState
                title="Cuenta protegida"
                description="Las cuentas superadministradoras se administran fuera del panel."
                actionLabel="Volver al usuario"
                onAction={() => navigate(`/users/${userId}`)}
            />
        )
    }

    return (
        <Loading loading={isLoading}>
            {data ? (
                <UsersForm
                    key={`user-${userId}-${data.email}`}
                    mode="edit"
                    submitting={isSubmitting}
                    defaultValues={{
                        username: data.username || '',
                        full_name: data.full_name || data.name || '',
                        email: data.email || '',
                        role:
                            data.role === 'ADMIN' ||
                            data.role === 'OPERATOR' ||
                            data.role === 'CLIENT'
                                ? data.role
                                : '',
                        status: data.status !== false && data.is_active !== false,
                    }}
                    onFormSubmit={handleSubmit}
                    onDiscard={() => navigate(`/users/${userId}`)}
                />
            ) : null}
        </Loading>
    )
}

export default UserEditView
