// src/views/concepts/properties/PropertiesCreate.tsx
import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import PropertiesForm, { type PropertiesFormSchema } from '@/views/concepts/properties/PropertiesForm/PropertiesForm'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { useSWRConfig } from 'swr'
import { apiCreateProperty } from '@/services/PropertiesService'

const PropertiesCreate = () => {
  const navigate = useNavigate()
  const { mutate } = useSWRConfig()
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (values: PropertiesFormSchema) => {
    try {
      setIsSubmitting(true)
      const payload = {
        community_id: Number(values.community_id),
        property_number: String(values.property_number).trim(),
        floor: Number(values.floor),
      }
      await apiCreateProperty(payload)
      await mutate((key) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/communities/properties'))
      toast.push(<Notification type="success">Propiedad creada</Notification>, { placement: 'top-center' })
      navigate('/concepts/properties/properties-list')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'No se pudo crear la propiedad.'
      toast.push(<Notification type="danger">{msg}</Notification>, { placement: 'top-center' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDiscard = () => {
    setDiscardConfirmationOpen(false)
    toast.push(<Notification type="info">Cambios descartados</Notification>, { placement: 'top-center' })
    navigate('/concepts/properties/properties-list')
  }

  const handleDiscard = () => setDiscardConfirmationOpen(true)
  const handleCancel = () => setDiscardConfirmationOpen(false)

  return (
    <>
      <PropertiesForm
        defaultValues={{ community_id: 0, property_number: '', floor: 0 }}
        onFormSubmit={handleFormSubmit}
      >
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
      </PropertiesForm>

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

export default PropertiesCreate
