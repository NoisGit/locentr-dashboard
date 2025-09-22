// src/views/concepts/condos/CondosList/components/CondosListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import useCondosList from '../hooks/useCondosList'
import { TbChecks } from 'react-icons/tb'
import { apiDeleteCondo } from '@/services/CondosService'

const CondosListSelected = () => {
  const {
    selectedCondo: selectedCondos,
    condosList,
    condosListTotal,
    mutate,
    setSelectAllCondos,
    tableData,
    setTableData,
  } = useCondosList()

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
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

    const idsToDelete = Array.from(new Set(selectedCondos.map(s => String(s.id))))
    const newList = condosList.filter(c => !idsToDelete.includes(String(c.id)))
    const newTotal = Math.max(0, (condosListTotal ?? 0) - idsToDelete.length)

    if (newList.length === 0 && (tableData.pageIndex as number) > 1) {
      setTableData(prev => ({ ...prev, pageIndex: (prev.pageIndex as number) - 1 }))
    }

    mutate({ list: newList, total: newTotal }, false)

    setDeleteConfirmationOpen(false)
    setSelectAllCondos([])

    const results = await Promise.allSettled(idsToDelete.map(id => apiDeleteCondo(id)))
    const success = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - success

    try {
      await mutate()
    } catch {
      toast.push(
        <Notification type="danger">No se pudo sincronizar la lista con el servidor</Notification>,
        { placement: 'top-center' }
      )
    }

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
              </div>
            </div>
          </div>
        </StickyFooter>
      )}

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
    </>
  )
}

export default CondosListSelected
