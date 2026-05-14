import { useState } from 'react'
import { useNavigate } from 'react-router'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import UsersForm, { type UserFormSchema } from '../UsersForm/UsersForm'
import { apiCreateUser } from '@/services/UsersService'

const UsersCreate = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (values: UserFormSchema) => {
    try {
      setIsSubmitting(true)

      await apiCreateUser({
        full_name: values.fullName?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        password: values.password || '',
        role_id: Number(values.roleId),
      })

      toast.push(<Notification type="success">Usuario creado correctamente.</Notification>, {
        placement: 'top-center',
      })
      navigate('/concepts/users/users-list')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string } } }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudo crear el usuario.'

      toast.push(<Notification type="danger">{message}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    toast.push(<Notification type="info">Creación descartada.</Notification>, {
      placement: 'top-center',
    })
    navigate('/concepts/users/users-list')
  }

  return (
    <UsersForm
      mode="create"
      submitting={isSubmitting}
      defaultValues={{ fullName: '', phone: '', email: '', password: '', roleId: '' }}
      onFormSubmit={handleFormSubmit}
      onDiscard={handleDiscard}
    />
  )
}

export default UsersCreate
