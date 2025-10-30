// src/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbChecks } from 'react-icons/tb'
import useAccessPointsList from '../hooks/useAccessPointsList'
import { apiDeleteAccessPoint } from '@/services/AccessPointsService'

const AccessPointsListSelected = () => {
  const {
    selectedAccessPoints,
    list,
    total,
    mutate,
    setSelectAllAccessPoints,
    tableData,
    setTableData,
  } = useAccessPointsList()

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasSelection = (selectedAccessPoints?.length ?? 0) > 0

  const handleDelete = () => setDeleteConfirmationOpen(true)
  const handleCancel = () => {
    if (!deleteLoading) setDeleteConfirmationOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!hasSelection) {
      setDeleteConfirmationOpen(false)
      return
    }

    setDeleteLoading(true)

    const idsToDelete = Array.from(
      new Set(selectedAccessPoints.map((s) => String(s.id))),
    )

    const currentList = list ?? []
    const currentTotal = typeof total === 'number' ? total : currentList.length

    // Optimistic UI
    const newList = currentList.filter(
      (r) => !idsToDelete.includes(String(r.id)),
    )
    const newTotal = Math.max(0, currentTotal - idsToDelete.length)

    // Retroceder página si quedó vacía
    if (newList.length === 0 && (tableData.pageIndex as number) > 1) {
      setTableData((prev) => ({
        ...prev,
        pageIndex: (prev.pageIndex as number) - 1,
      }))
    }

    // Mutación optimista (sin revalidar aún)
    mutate({ list: newList, total: newTotal }, false)

    setDeleteConfirmationOpen(false)
    setSelectAllAccessPoints([])

    // Deletes reales en paralelo
    const results = await Promise.allSettled(
      idsToDelete.map((id) => apiDeleteAccessPoint(id)),
    )
    const success = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - success

    // Revalidar contra backend
    try {
      await mutate()
      // Notifica a otras vistas/tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('accesspoints:changed', {
            detail: { type: 'deleted', ids: idsToDelete, ts: Date.now() },
          }),
        )
      }
    } catch {
      toast.push(
        <Notification type="danger">
          No se pudo sincronizar la lista con el servidor
        </Notification>,
        { placement: 'top-center' },
      )
    }

    // Feedback
    if (failed === 0) {
      toast.push(
        <Notification type="success">
          {success === 1 ? 'Access point eliminado' : 'Access points eliminados'}
        </Notification>,
        { placement: 'top-center' },
      )
    } else if (success === 0) {
      toast.push(
        <Notification type="danger">
          {failed === 1
            ? 'No se pudo eliminar el access point'
            : 'No se pudieron eliminar los access points'}
        </Notification>,
        { placement: 'top-center' },
      )
    } else {
      toast.push(
        <Notification type="warning">
          {`Se eliminaron ${success} y fallaron ${failed} access points`}
        </Notification>,
        { placement: 'top-center' },
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
                  {selectedAccessPoints.length} access points seleccionados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  customColorClass={() =>
                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                  }
                  disabled={deleteLoading}
                  onClick={handleDelete}
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
        title={
          selectedAccessPoints.length === 1
            ? 'Eliminar access point'
            : 'Eliminar access points'
        }
        onCancel={handleCancel}
        onClose={handleCancel}
        onConfirm={handleConfirmDelete}
        onRequestClose={handleCancel}
      >
        <p className="mb-2">
          {selectedAccessPoints.length === 1
            ? '¿Estás segura de que quieres eliminar este access point?'
            : `¿Estás segura de que quieres eliminar estos ${selectedAccessPoints.length} access points?`}
        </p>
        <p>Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </>
  )
}

export default AccessPointsListSelected
