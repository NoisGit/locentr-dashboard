// src/views/concepts/condos/CondosEdit/CondosEdit.tsx
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
import CondosForm from '../CondosForm'
import {
  apiGetCondoById,
  apiUpdateCondo,
  apiDeleteCondo,
} from '@/services/CondosService'

// 👇 tipos desde tu archivo real
import type { CondosFormSchema, Condo } from '../CondosList/types'

// Extiendo el schema para aceptar también campos propios de comunidad
type ExtendedCondoForm = CondosFormSchema & {
  name?: string
  type?: string
}

const CondosEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Carga real por ID (/api/v1/communities/id/{id})
  const { data, isLoading, error } = useSWR<Condo>(
    id ? ['/api/v1/communities/id', id] : null,
    ([, _id]) => apiGetCondoById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  )

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFormSubmit = async (values: ExtendedCondoForm) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      const computedName = (values.name ?? `${values.firstName ?? ''} ${values.lastName ?? ''}`)?.trim()

      const patch: Record<string, unknown> = {
        ...(computedName ? { name: computedName } : {}),
        ...(values.address ? { address: values.address } : {}),
        ...(values.type ? { type: values.type } : {}),
        // si tu backend acepta img u otros, agrégalos acá
      }

      await apiUpdateCondo(id, patch)

      // Revalida todas las listas que usan key ['/api/communities', {...}]
      await globalMutate(
        (key: any) => Array.isArray(key) && key[0] === '/api/communities'
      )

      toast.push(
        <Notification type="success">¡Cambios guardados!</Notification>,
        { placement: 'top-center' }
      )
      navigate('/concepts/condos/condos-list')
    } catch {
      toast.push(
        <Notification type="danger">No se pudo guardar la comunidad</Notification>,
        { placement: 'top-center' }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDefaultValues = (): Partial<ExtendedCondoForm> => {
    if (!data) return {}

    const typeNorm = (data.type || '').toString().toLowerCase()
    const type =
      typeNorm === 'edificio'
        ? 'Edificio'
        : typeNorm === 'condominio'
        ? 'Condominio'
        : (data.type as any) || ''

    return {
      // Campos propios de comunidad
      name: data.name || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      address: data.address || data.personalInfo?.address || '',
      type,

      // Campos del schema actual (compat)
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      email: data.email ?? '',
      dialCode: data.personalInfo?.dialCode ?? '',
      phoneNumber: data.personalInfo?.phoneNumber ?? '',
      country: data.personalInfo?.country ?? '',
      city: data.personalInfo?.city ?? '',
      postcode: data.personalInfo?.postcode ?? '',
      img: data.img ?? '',
      tags: data.tags ?? [],
      // accountVerified/banAccount si aplican en tu form
    }
  }

  const handleConfirmDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await apiDeleteCondo(id)

      await globalMutate(
        (key: any) => Array.isArray(key) && key[0] === '/api/communities'
      )

      toast.push(
        <Notification type="success">¡Comunidad eliminada!</Notification>,
        { placement: 'top-center' }
      )
      navigate('/concepts/condos/condos-list')
    } catch {
      toast.push(
        <Notification type="danger">No se pudo eliminar la comunidad</Notification>,
        { placement: 'top-center' }
      )
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
          <h3 className="mt-8">¡No se encontró la comunidad!</h3>
        </div>
      )}

      {!isLoading && data && (
        <>
          <CondosForm
            defaultValues={getDefaultValues()}
            newCondo={false}
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
          </CondosForm>

          <ConfirmDialog
            isOpen={deleteConfirmationOpen}
            type="danger"
            title="Eliminar comunidad"
            onClose={handleCancel}
            onRequestClose={handleCancel}
            onCancel={handleCancel}
            onConfirm={handleConfirmDelete}
          >
            <p>
              ¿Estás segura de que quieres eliminar esta comunidad? Esta acción no se puede deshacer.
            </p>
          </ConfirmDialog>
        </>
      )}
    </>
  )
}

export default CondosEdit
