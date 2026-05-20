import { useState } from 'react'
import { useNavigate } from 'react-router'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import WorkspacesForm, { type WorkspaceFormSchema } from '../WorkspacesForm/WorkspacesForm'
import { apiCreateLocation } from '@/services/LocationsService'

const WorkspacesCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFormSubmit = async (values: WorkspaceFormSchema) => {
        try {
            setIsSubmitting(true)
            await apiCreateLocation({
                name: values.name.trim(),
                address: values.address.trim(),
                country: values.country?.trim() || null,
                logo: values.logo?.trim() || null,
            })
            toast.push(<Notification type="success">Workspace creado correctamente.</Notification>, {
                placement: 'top-center',
            })
            navigate('/workspaces')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'No se pudo crear el workspace.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/workspaces')
    }

    return (
        <WorkspacesForm
            mode="create"
            submitting={isSubmitting}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default WorkspacesCreate
