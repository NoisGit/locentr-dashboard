// src/views/concepts/properties/PropertiesList/components/PropertiesListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import usePropertiesList from '../hooks/usePropertiesList'
import { TbChecks } from 'react-icons/tb'
import { apiDeleteProperty } from '@/services/PropertiesService'

const PropertiesListSelected = () => {
  const {
    selectedProperty: selectedProperties,
    propertiesList,
    propertiesListTotal,
    mutate,
    setSelectAllProperties,
    tableData,
    setTableData,
  } = usePropertiesList()

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasSelection = (selectedProperties?.length ?? 0) > 0

  const handleDelete = () => setDeleteConfirmationOpen(true)
  const handleCancel = () => { if (!deleteLoading) setDeleteConfirmationOpen(false) }

  const handleConfirmDelete = async () => {
    // ✅ ÚNICA validación simple
    if (!hasSelection) {
      setDeleteConfirmationOpen(false)
      return
    }

    setDeleteLoading(true)

    const idsToDelete = Array.from(new Set(selectedProperties.map(s => String(s.id))))
    const newList = propertiesList.filter(c => !idsToDelete.includes(String(c.id)))
    const newTotal = Math.max(0, (propertiesListTotal ?? 0) - idsToDelete.length)

    if (newList.length === 0 && (tableData.pageIndex as number) > 1) {
      setTableData(prev => ({ ...prev, pageIndex: (prev.pageIndex as number) - 1 }))
    }

    // Optimista
    mutate({ list: newList, total: newTotal }, false)

    setDeleteConfirmationOpen(false)
    setSelectAllProperties([])

    const results = await Promise.allSettled(idsToDelete.map(id => apiDeleteProperty(id)))
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

    // 🔔 Notificar a otras vistas (tabs, etc.) para refrescar sin F5
    try {
      window.dispatchEvent(
        new CustomEvent('properties:changed', {
          detail: { action: 'delete', ids: idsToDelete }
        })
      )
    } catch {
      /* no-op */
    }

    if (failed === 0) {
      toast.push(
        <Notification type="success">
          {success === 1 ? 'Propiedad eliminada' : 'Propiedades eliminadas'}
        </Notification>,
        { placement: 'top-center' }
      )
    } else if (success === 0) {
      toast.push(
        <Notification type="danger">
          {failed === 1 ? 'No se pudo eliminar la propiedad' : 'No se pudieron eliminar las propiedades'}
        </Notification>,
        { placement: 'top-center' }
      )
    } else {
      toast.push(
        <Notification type="warning">
          {`Se eliminaron ${success} y fallaron ${failed} propiedades`}
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
                  {selectedProperties.length} propiedades seleccionadas
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
        title={selectedProperties.length === 1 ? 'Eliminar propiedad' : 'Eliminar propiedades'}
        onClose={handleCancel}
        onRequestClose={handleCancel}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
      >
        <p className="mb-2">
          {selectedProperties.length === 1
            ? '¿Estás segura de que quieres eliminar esta propiedad?'
            : `¿Estás segura de que quieres eliminar estas ${selectedProperties.length} propiedades?`}
        </p>
        <p>Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </>
  )
}

export default PropertiesListSelected
