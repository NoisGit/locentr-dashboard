// src/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbChecks } from 'react-icons/tb'
import useCollaboratorsList from '../hooks/useCollaboratorsList'
import { apiDeleteCollaborator } from '@/services/CollaboratorsService'

const CollaboratorsListSelected = () => {
  const {
    selectedCollaborator: selectedCollaborators,
    list,
    total,
    mutate,
    setSelectAllCollaborators,
    tableData,
    setTableData,
  } = useCollaboratorsList()

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasSelection = (selectedCollaborators?.length ?? 0) > 0

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
      new Set(selectedCollaborators.map((s) => String(s.id)))
    )

    const currentList = list ?? []
    const currentTotal = typeof total === 'number' ? total : currentList.length

    // Optimistic UI
    const newList = currentList.filter(
      (r) => !idsToDelete.includes(String(r.id))
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
    setSelectAllCollaborators([])

    // Deletes reales en paralelo
    const results = await Promise.allSettled(
      idsToDelete.map((id) => apiDeleteCollaborator(id))
    )
    const success = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - success

    // Revalidar contra backend
    try {
      await mutate()
    } catch {
      toast.push(
        <Notification type="danger">
          No se pudo sincronizar la lista con el servidor
        </Notification>,
        { placement: 'top-center' }
      )
    }

    // Feedback
    if (failed === 0) {
      toast.push(
        <Notification type="success">
          {success === 1 ? 'Colaborador eliminado' : 'Colaboradores eliminados'}
        </Notification>,
        { placement: 'top-center' }
      )
    } else if (success === 0) {
      toast.push(
        <Notification type="danger">
          {failed === 1
            ? 'No se pudo eliminar el colaborador'
            : 'No se pudieron eliminar los colaboradores'}
        </Notification>,
        { placement: 'top-center' }
      )
    } else {
      toast.push(
        <Notification type="warning">
          {`Se eliminaron ${success} y fallaron ${failed} colaboradores`}
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
                  {selectedCollaborators.length} colaboradores seleccionados
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
          selectedCollaborators.length === 1
            ? 'Eliminar colaborador'
            : 'Eliminar colaboradores'
        }
        onCancel={handleCancel}
        onClose={handleCancel}
        onConfirm={handleConfirmDelete}
        onRequestClose={handleCancel}
      >
        <p className="mb-2">
          {selectedCollaborators.length === 1
            ? '¿Estás segura de que quieres eliminar este colaborador?'
            : `¿Estás segura de que quieres eliminar estos ${selectedCollaborators.length} colaboradores?`}
        </p>
        <p>Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </>
  )
}

export default CollaboratorsListSelected
