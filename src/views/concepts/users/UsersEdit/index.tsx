import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import UsersForm, { type UserFormSchema } from '../UsersForm/UsersForm'
import { apiGetUserById, apiUpdateUser } from '@/services/UsersService'

type ApiUser = Record<string, any>

const UsersEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])

  const { data, isLoading, mutate } = useSWR(
    userId ? ['users:detail', userId] : null,
    ([, currentId]) => apiGetUserById(currentId as string),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues = useMemo((): Partial<UserFormSchema> => {
    const user = (data || {}) as ApiUser
    const fullName =
      user.full_name ||
      user.name ||
      [user.first_name, user.last_name].filter(Boolean).join(' ')

    return {
      fullName: fullName || '',
      phone: user.phone || user.phone_number || '',
      email: user.email || '',
      roleId: (user.role_id ?? user.role?.id) ?? '',
      newPassword: '',
    }
  }, [data])

  const formKey = useMemo(
    () => `edit-${userId}-${(data as ApiUser)?.id ?? 'none'}-${(data as ApiUser)?.email ?? ''}`,
    [userId, data],
  )

  const handleFormSubmit = async (values: UserFormSchema) => {
    if (!userId) return

    try {
      setIsSubmitting(true)

      const patch: Record<string, unknown> = {
        full_name: values.fullName?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        role_id: values.roleId ? Number(values.roleId) : undefined,
      }

      if (values.newPassword && values.newPassword.trim().length >= 6) {
        patch.password = values.newPassword
      }

      Object.keys(patch).forEach((key) => {
        if (patch[key] === '' || patch[key] === undefined) delete patch[key]
      })

      await apiUpdateUser(userId, patch)
      toast.push(<Notification type="success">Cambios guardados correctamente.</Notification>, {
        placement: 'top-center',
      })
      await mutate()
      navigate('/concepts/users/users-list')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string } } }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudieron guardar los cambios.'

      toast.push(<Notification type="danger">{message}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    toast.push(<Notification type="info">Cambios descartados.</Notification>, {
      placement: 'top-center',
    })
    navigate('/concepts/users/users-list')
  }

  if (!isLoading && !data) return null

  return (
    <UsersForm
      key={formKey}
      mode="edit"
      submitLabel="Guardar cambios"
      submitting={isSubmitting}
      defaultValues={defaultValues}
      onFormSubmit={handleFormSubmit}
      onDiscard={handleDiscard}
    />
  )
}

export default UsersEdit
