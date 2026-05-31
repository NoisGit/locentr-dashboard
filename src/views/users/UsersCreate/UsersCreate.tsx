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
                username: values.username.trim(),
                full_name: values.full_name.trim(),
                email: values.email.trim(),
                password: values.password?.trim() || '',
                role: values.role,
                status: values.status ?? true,
            })
            toast.push(<Notification type="success">Usuario creado correctamente.</Notification>, {
                placement: 'top-center',
            })
            navigate('/users')
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

    return (
        <UsersForm
            mode="create"
            submitting={isSubmitting}
            onFormSubmit={handleFormSubmit}
            onDiscard={() => navigate('/users')}
        />
    )
}

export default UsersCreate
