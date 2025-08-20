// src/views/concepts/condos/CondosCreate.tsx
import { useState } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CondosForm, { type CondosFormSchema } from '../CondosForm'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { useSWRConfig } from 'swr'
import { apiCreateCondo } from '@/services/CondosService'

// ✅ ruta correcta: CondosList es HERMANA de CondosCreate
// (puedes usar alias absoluto o relativa; te dejo ambas)
import { useCondosListStore } from '@/views/concepts/condos/CondosList/store/CondosListStore'
// alternativa relativa:
// import { useCondosListStore } from '../CondosList/store/CondosListStore'

const CondosCreate = () => {
  const navigate = useNavigate()
  const { mutate } = useSWRConfig()
  const setTableData = useCondosListStore((s) => s.setTableData)

  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (values: CondosFormSchema) => {
    try {
      setIsSubmitting(true)

      // arma payload sin strings vacíos (el service ya mapea type -> type_id)
      const payload: Record<string, unknown> = {}
      const name = values.name?.trim()
      const address = values.address?.trim()
      const type = values.type?.trim()

      if (name) payload.name = name
      if (address) payload.address = address
      if (type) payload.type = type

      await apiCreateCondo(payload)

      // 1) revalidar TODAS las listas (key del hook es ['/api/communities', {...}])
      await mutate((key) => Array.isArray(key) && key[0] === '/api/communities')

      // 2) resetear tabla: página 1 y orden por id desc (recientes primero)
      setTableData(prev => ({
        ...prev,
        pageIndex: 1,
        sort: { key: 'id', order: 'desc' },
      }))

      toast.push(<Notification type="success">Comunidad creada</Notification>, {
        placement: 'top-center',
      })

      // 3) navegar a la lista
      navigate('/concepts/condos/condos-list')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudo crear la comunidad.'
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
    navigate('/concepts/condos/condos-list')
  }

  const handleDiscard = () => setDiscardConfirmationOpen(true)
  const handleCancel = () => setDiscardConfirmationOpen(false)

  return (
    <>
      <CondosForm
        newCondo
        defaultValues={{ name: '', address: '', type: '' }}
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
      </CondosForm>

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

export default CondosCreate
