import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import NoUserFound from '@/assets/svg/NoUserFound'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router'
import useSWR, { mutate as globalMutate } from 'swr'
import ResidentsForm, { type ResidentsFormSchema } from '../ResidentsForm'
import { apiGetResidentById, apiUpdateResident, apiDeleteResident } from '@/services/ResidentsService'
import type { ResidentRow } from '@/services/ResidentsService'

const ResidentsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useSWR<ResidentRow>(
    id ? ['/api/residents/id', id] : null,
    ([, _id]) => apiGetResidentById(String(_id)),
    { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false },
  )

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFormSubmit = async (values: ResidentsFormSchema) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      const endDate = values.endDate && String(values.endDate).trim() !== '' ? values.endDate : undefined

      await apiUpdateResident(id, {
        user_id: values.userId,
        property_id: values.propertyId,
        is_owner: values.isOwner,
        start_date: values.startDate,
        end_date: endDate,
        home_role: values.homeRole || '',
      })

      // Revalida todas las listas de residentes y notifica por evento
      await globalMutate((key: unknown) => Array.isArray(key) && key[0] === 'residents:list')
      window.dispatchEvent(new CustomEvent('residents:changed', { detail: { type: 'updated', id } }))

      toast.push(<Notification type="success">¡Cambios guardados!</Notification>, { placement: 'top-center' })
      navigate('/concepts/residents/residents-list')
    } catch {
      toast.push(<Notification type="danger">No se pudo guardar el residente</Notification>, { placement: 'top-center' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDefaultValues = (): Partial<ResidentsFormSchema> => {
    if (!data) return {}
    return {
      propertyId: Number(data.propertyId),
      userId: Number(data.userId),
      isOwner: Boolean(data.isOwner),
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      homeRole: (data as unknown as { homeRole?: string }).homeRole ?? (data as unknown as { home_role?: string })?.home_role ?? '',
    }
  }

  const handleConfirmDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await apiDeleteResident(id)
      await globalMutate((key: unknown) => Array.isArray(key) && key[0] === 'residents:list')
      window.dispatchEvent(new CustomEvent('residents:changed', { detail: { type: 'deleted', id } }))

      toast.push(<Notification type="success">¡Residente eliminado!</Notification>, { placement: 'top-center' })
      navigate('/concepts/residents/residents-list')
    } catch {
      toast.push(<Notification type="danger">No se pudo eliminar el residente</Notification>, { placement: 'top-center' })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmationOpen(false)
    }
  }

  const handleDelete = () => setDeleteConfirmationOpen(true)
  const handleCancel = () => setDeleteConfirmationOpen(false)
  const handleBack = () => navigate(-1)

  return (
    <>
      {!isLoading && (!data || error) && (
        <div className="h-full flex flex-col items-center justify-center">
          <NoUserFound height={280} width={280} />
          <h3 className="mt-8">¡No se encontró el residente!</h3>
        </div>
      )}

      {!isLoading && data && (
        <>
          <ResidentsForm defaultValues={getDefaultValues()} newResident={false} onFormSubmit={handleFormSubmit}>
            <Container>
              <div className="flex items-center justify-between px-8">
                <Button className="ltr:mr-3 rtl:ml-3" type="button" variant="plain" icon={<TbArrowNarrowLeft />} onClick={handleBack}>
                  Volver
                </Button>
                <div className="flex items-center">
                  <Button
                    className="ltr:mr-3 rtl:ml-3"
                    customColorClass={() =>
                      'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                    }
                    disabled={isDeleting}
                    icon={<TbTrash />}
                    type="button"
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                  <Button variant="solid" disabled={isDeleting} loading={isSubmitting} type="submit">
                    Guardar
                  </Button>
                </div>
              </div>
            </Container>
          </ResidentsForm>

          <ConfirmDialog
            isOpen={deleteConfirmationOpen}
            title="Eliminar residente"
            type="danger"
            onCancel={handleCancel}
            onConfirm={handleConfirmDelete}
            onClose={handleCancel}
            onRequestClose={handleCancel}
          >
            <p>¿Estás segura de que quieres eliminar este residente? Esta acción no se puede deshacer.</p>
          </ConfirmDialog>
        </>
      )}
    </>
  )
}

export default ResidentsEdit
