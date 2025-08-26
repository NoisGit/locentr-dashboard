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
import PropertiesForm, { type PropertiesFormSchema } from '@/views/concepts/properties/PropertiesForm/PropertiesForm'
import { apiGetPropertyById, apiUpdateProperty, apiDeleteProperty } from '@/services/PropertiesService'
import type { Property } from '@/views/concepts/properties/PropertiesList/types'

const PropertiesEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useSWR<Property>(
    id ? ['/api/v1/communities/properties/id', id] : null,
    ([, _id]) => apiGetPropertyById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  )

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFormSubmit = async (values: PropertiesFormSchema) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      const payload = {
        community_id: Number(values.community_id),
        property_number: String(values.property_number).trim(),
        floor: Number(values.floor),
      }
      await apiUpdateProperty(id, payload)
      await globalMutate(
        (key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/communities/properties')
      )
      toast.push(<Notification type="success">¡Cambios guardados!</Notification>, { placement: 'top-center' })
      navigate('/concepts/properties/properties-list')
    } catch {
      toast.push(<Notification type="danger">No se pudo guardar la propiedad</Notification>, { placement: 'top-center' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDefaultValues = (): Partial<PropertiesFormSchema> => {
    if (!data) return {}
    const communityId = (data as any).communityId ?? (data as any).community_id ?? 0
    const propertyNumber = (data as any).propertyNumber ?? (data as any).number ?? (data as any).property_number ?? ''
    const floor = (data as any).floor ?? 0
    return {
      community_id: Number(communityId || 0),
      property_number: String(propertyNumber || ''),
      floor: Number(floor || 0),
    }
  }

  const handleConfirmDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await apiDeleteProperty(id)
      await globalMutate(
        (key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/communities/properties')
      )
      toast.push(<Notification type="success">¡Propiedad eliminada!</Notification>, { placement: 'top-center' })
      navigate('/concepts/properties/properties-list')
    } catch {
      toast.push(<Notification type="danger">No se pudo eliminar la propiedad</Notification>, { placement: 'top-center' })
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
          <h3 className="mt-8">¡No se encontró la propiedad!</h3>
        </div>
      )}

      {!isLoading && data && (
        <>
          <PropertiesForm
            defaultValues={getDefaultValues()}
            onFormSubmit={handleFormSubmit}
          >
            <Container>
              <div className="flex items-center justify-between px-8">
                <Button
                  className="ltr:mr-3 rtl:ml-3"
                  type="button"
                  variant="plain"
                  icon={<TbArrowNarrowLeft />}
                  onClick={handleBack}
                >
                  Volver
                </Button>
                <div className="flex items-center">
                  <Button
                    className="ltr:mr-3 rtl:ml-3"
                    type="button"
                    customColorClass={() =>
                      'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                    }
                    icon={<TbTrash />}
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="solid"
                    type="submit"
                    loading={isSubmitting}
                    disabled={isDeleting}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </Container>
          </PropertiesForm>

          <ConfirmDialog
            isOpen={deleteConfirmationOpen}
            type="danger"
            title="Eliminar propiedad"
            onClose={handleCancel}
            onRequestClose={handleCancel}
            onCancel={handleCancel}
            onConfirm={handleConfirmDelete}
          >
            <p>¿Estás segura de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.</p>
          </ConfirmDialog>
        </>
      )}
    </>
  )
}

export default PropertiesEdit
