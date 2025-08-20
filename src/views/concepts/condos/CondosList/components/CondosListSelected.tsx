// src/views/concepts/condos/CondosList/components/CondosListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import RichTextEditor from '@/components/shared/RichTextEditor'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import useCondosList from '../hooks/useCondosList'
import { TbChecks } from 'react-icons/tb'
import { apiDeleteCondo } from '@/services/CondosService'

const CondosListSelected = () => {
  const {
    selectedCondo: selectedCondos, // alias del store
    condosList,
    condosListTotal,
    mutate,               // SWR-bound mutate (lista)
    setSelectAllCondos,
    // 👇 para manejar underflow de paginación
    tableData,
    setTableData,
  } = useCondosList()

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false)
  const [sendMessageLoading, setSendMessageLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasSelection = (selectedCondos?.length ?? 0) > 0

  const handleDelete = () => setDeleteConfirmationOpen(true)
  const handleCancel = () => { if (!deleteLoading) setDeleteConfirmationOpen(false) }

  const handleConfirmDelete = async () => {
    if (!hasSelection) {
      setDeleteConfirmationOpen(false)
      return
    }

    setDeleteLoading(true)

    // 1) IDs únicos y normalizados
    const idsToDelete = Array.from(new Set(selectedCondos.map(s => String(s.id))))

    // 2) Optimista: quitamos seleccionados de la lista actual
    const newList = condosList.filter(c => !idsToDelete.includes(String(c.id)))
    const newTotal = Math.max(0, (condosListTotal ?? 0) - idsToDelete.length)

    // 2.1) Si la página quedará vacía y hay páginas previas, retrocede una
    if (newList.length === 0 && (tableData.pageIndex as number) > 1) {
      setTableData(prev => ({ ...prev, pageIndex: (prev.pageIndex as number) - 1 }))
    }

    // 2.2) Actualización optimista del cache de esta página
    mutate({ list: newList, total: newTotal }, false)

    // Cerrar modal y limpiar selección para una UI fluida
    setDeleteConfirmationOpen(false)
    setSelectAllCondos([])

    // 3) Delete real contra backend
    const results = await Promise.allSettled(idsToDelete.map(id => apiDeleteCondo(id)))
    const success = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - success

    // 4) Revalidar (trae la página correcta si retrocedimos)
    try {
      await mutate()
    } catch {
      toast.push(
        <Notification type="danger">No se pudo sincronizar la lista con el servidor</Notification>,
        { placement: 'top-center' }
      )
    }

    // 5) Notificación
    if (failed === 0) {
      toast.push(
        <Notification type="success">
          {success === 1 ? 'Condominio eliminado' : 'Condominios eliminados'}
        </Notification>,
        { placement: 'top-center' }
      )
    } else if (success === 0) {
      toast.push(
        <Notification type="danger">
          {failed === 1 ? 'No se pudo eliminar el condominio' : 'No se pudieron eliminar los condominios'}
        </Notification>,
        { placement: 'top-center' }
      )
    } else {
      toast.push(
        <Notification type="warning">
          {`Se eliminaron ${success} y fallaron ${failed} condominios`}
        </Notification>,
        { placement: 'top-center' }
      )
    }

    setDeleteLoading(false)
  }

  const handleSend = () => {
    setSendMessageLoading(true)
    setTimeout(() => {
      toast.push(<Notification type="success">Mensaje enviado</Notification>, { placement: 'top-center' })
      setSendMessageLoading(false)
      setSendMessageDialogOpen(false)
      setSelectAllCondos([])
    }, 500)
  }

  return (
    <>
      {hasSelection && (
        <StickyFooter
          className="flex items-center justify-between py-4 bg-white dark:bg-gray-800"
          stickyClass="-mx-4 sm:-mx-8 border-t border-gray-200 dark:border-gray-700 px-8"
          defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
        >
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TbChecks className="text-lg text-primary" />
                <span className="font-semibold heading-text">
                  {selectedCondos.length} condominios seleccionados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  customColorClass={() =>
                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                  }
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Eliminando…' : 'Eliminar'}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  onClick={() => setSendMessageDialogOpen(true)}
                  disabled={deleteLoading}
                >
                  Mensaje
                </Button>
              </div>
            </div>
          </div>
        </StickyFooter>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmationOpen}
        type="danger"
        title={selectedCondos.length === 1 ? 'Eliminar condominio' : 'Eliminar condominios'}
        onClose={handleCancel}
        onRequestClose={handleCancel}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
      >
        <p className="mb-2">
          {selectedCondos.length === 1
            ? '¿Estás segura de que quieres eliminar este condominio?'
            : `¿Estás segura de que quieres eliminar estos ${selectedCondos.length} condominios?`}
        </p>
        <p>Esta acción no se puede deshacer.</p>
      </ConfirmDialog>

      {/* Send Message Dialog */}
      <Dialog
        isOpen={sendMessageDialogOpen}
        onRequestClose={() => setSendMessageDialogOpen(false)}
        onClose={() => setSendMessageDialogOpen(false)}
      >
        <h5 className="mb-2">Enviar mensaje</h5>
        <p>Enviar mensaje a los siguientes condominios</p>
        <Avatar.Group chained omittedAvatarTooltip className="mt-4" maxCount={4} omittedAvatarProps={{ size: 30 }}>
          {selectedCondos.map((condo) => (
            <Tooltip key={condo.id} title={condo.name}>
              <Avatar size={30} src={condo.img} alt={condo.name} />
            </Tooltip>
          ))}
        </Avatar.Group>
        <div className="my-4">
          <RichTextEditor content="" />
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={() => setSendMessageDialogOpen(false)} disabled={sendMessageLoading}>
            Cancelar
          </Button>
          <Button size="sm" variant="solid" loading={sendMessageLoading} onClick={handleSend}>
            Enviar
          </Button>
        </div>
      </Dialog>
    </>
  )
}

export default CondosListSelected
