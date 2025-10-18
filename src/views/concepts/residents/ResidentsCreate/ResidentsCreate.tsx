// src/views/concepts/residents/ResidentsCreate.tsx
import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ResidentsForm, { type ResidentsFormSchema } from '../ResidentsForm'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { useSWRConfig } from 'swr'
import { apiCreateResident } from '@/services/ResidentsService'
import { useResidentsListStore } from '@/views/concepts/residents/ResidentsList/store/ResidentsListStore'

const ResidentsCreate = () => {
  const navigate = useNavigate()
  const { mutate } = useSWRConfig()
  const setTableData = useResidentsListStore((s) => s.setTableData)

  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (values: ResidentsFormSchema) => {
    try {
      setIsSubmitting(true)

      const endDate = values.endDate && String(values.endDate).trim() !== '' ? values.endDate : null

      await apiCreateResident({
        user_id: values.userId,
        property_id: values.propertyId,
        is_owner: values.isOwner,
        start_date: values.startDate,
        end_date: endDate,
      })

      await mutate((key) => Array.isArray(key) && key[0] === '/api/residents')

      setTableData((prev) => ({
        ...prev,
        pageIndex: 1,
        sort: { key: 'id', order: 'desc' },
      }))

      toast.push(<Notification type="success">Residente creado</Notification>, {
        placement: 'top-center',
      })

      navigate('/concepts/residents/residents-list')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudo crear el residente.'
      toast.push(<Notification type="danger">{msg}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDiscard = () => {
    setDiscardConfirmationOpen(false)
    toast.push(<Notification type="info">Cambios descartados</Notification>, {
      placement: 'top-center',
    })
    navigate('/concepts/residents/residents-list')
  }

  const handleDiscard = () => setDiscardConfirmationOpen(true)
  const handleCancel = () => setDiscardConfirmationOpen(false)

  return (
    <>
      <ResidentsForm onFormSubmit={handleFormSubmit}>
        <Container>
          <div className="flex items-center justify-between px-8">
            <span />
            <div className="flex items-center">
              <Button
                className="ltr:mr-3 rtl:ml-3"
                type="button"
                customColorClass={() =>
                  'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                }
                icon={<TbTrash />}
                onClick={handleDiscard}
              >
                Descartar
              </Button>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Crear
              </Button>
            </div>
          </div>
        </Container>
      </ResidentsForm>

      <ConfirmDialog
        isOpen={discardConfirmationOpen}
        type="danger"
        title="Descartar cambios"
        onClose={handleCancel}
        onRequestClose={handleCancel}
        onCancel={handleCancel}
        onConfirm={handleConfirmDiscard}
      >
        <p>¿Seguro que quieres descartar? Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </>
  )
}

export default ResidentsCreate
