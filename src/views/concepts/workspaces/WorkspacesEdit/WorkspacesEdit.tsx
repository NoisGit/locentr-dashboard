import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import WorkspacesForm, { type WorkspaceFormSchema } from '../WorkspacesForm/WorkspacesForm'
import { apiGetLocationById, apiUpdateLocation } from '@/services/LocationsService'

const WorkspacesEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const workspaceId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    workspaceId ? ['workspaces:detail', workspaceId] : null,
    ([, currentId]) => apiGetLocationById(currentId as string),
    { revalidateOnFocus: false },
  )

  const defaultValues = useMemo((): Partial<WorkspaceFormSchema> => ({
    name: data?.name || '',
    address: data?.address || '',
    country: data?.country || '',
    logo: data?.logo || '',
  }), [data])

  const formKey = useMemo(
    () => `workspace-${workspaceId}-${data?.name ?? 'empty'}`,
    [workspaceId, data?.name],
  )

  const handleFormSubmit = async (values: WorkspaceFormSchema) => {
    if (!workspaceId) return

    try {
      setIsSubmitting(true)
      await apiUpdateLocation(workspaceId, {
        name: values.name.trim(),
        address: values.address.trim(),
        country: values.country?.trim() || null,
        logo: values.logo?.trim() || null,
      })
      toast.push(<Notification type="success">Workspace actualizado correctamente.</Notification>, {
        placement: 'top-center',
      })
      await mutate()
      navigate('/concepts/workspaces/workspaces-list')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string } } }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudo actualizar el workspace.'

      toast.push(<Notification type="danger">{message}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    navigate('/concepts/workspaces/workspaces-list')
  }

  if (!isLoading && !data) return null

  return (
    <WorkspacesForm
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

export default WorkspacesEdit
