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
import useCustomerList from '@/views/concepts/customers/CustomerList/hooks/useCustomerList'
import { apiDeleteCustomer } from '@/services/CustomersService'
import { TbChecks } from 'react-icons/tb'
import type { Customer } from '@/views/concepts/customers/CustomerList/types'

type SelectedUser = Partial<Customer> & {
  avatar?: string
  img?: string
  name?: string
}

const UsersListSelected = () => {
  const { selectedCustomer, mutate, setSelectAllCustomer } = useCustomerList()
  const selectedUsers = selectedCustomer as SelectedUser[]

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false)
  const [sendMessageLoading, setSendMessageLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => setDeleteConfirmationOpen(true)
  const handleCancel = () => setDeleteConfirmationOpen(false)

  const handleConfirmDelete = async () => {
    const ids = selectedUsers
      .map((user) => user.id)
      .filter((v): v is string | number => v !== undefined && v !== null)

    if (ids.length === 0) {
      setDeleteConfirmationOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      const results = await Promise.allSettled(ids.map((id) => apiDeleteCustomer(id)))
      const ok = results.filter((r) => r.status === 'fulfilled').length
      const fail = results.length - ok

      await mutate()
      setSelectAllCustomer([])

      if (ok > 0) {
        toast.push(
          <Notification type="success">
            {ok} usuario{ok > 1 ? 's' : ''} eliminado{ok > 1 ? 's' : ''} permanentemente.
            {fail > 0 ? ` ${fail} no se pudo${fail > 1 ? 'n' : ''} eliminar.` : ''}
          </Notification>,
          { placement: 'top-center' },
        )
      }
      if (fail > 0) {
        toast.push(
          <Notification type="danger">
            No se pudieron eliminar {fail}.
          </Notification>,
          { placement: 'top-center' },
        )
      }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      toast.push(
        <Notification type="danger">
          {err?.response?.data?.message || 'Error al eliminar.'}
        </Notification>,
        { placement: 'top-center' },
      )
    } finally {
      setIsDeleting(false)
      setDeleteConfirmationOpen(false)
    }
  }

  const handleSend = () => {
    setSendMessageLoading(true)
    setTimeout(() => {
      toast.push(<Notification type="success">Mensaje enviado</Notification>, {
        placement: 'top-center',
      })
      setSendMessageLoading(false)
      setSendMessageDialogOpen(false)
      setSelectAllCustomer([])
    }, 500)
  }

  const getAvatarSrc = (user: SelectedUser) => user.avatar || user.img || ''

  return (
    <>
      {selectedUsers.length > 0 && (
        <StickyFooter
          className=" flex items-center justify-between py-4 bg-white dark:bg-gray-800"
          stickyClass="-mx-4 sm:-mx-8 border-t border-gray-200 dark:border-gray-700 px-8"
          defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
        >
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <span>
                <span className="flex items-center gap-2">
                  <span className="text-lg text-primary">
                    <TbChecks />
                  </span>
                  <span className="font-semibold flex items-center gap-1">
                    <span className="heading-text">
                      {selectedUsers.length} usuario{selectedUsers.length > 1 ? 's' : ''}
                    </span>
                    <span>seleccionado{selectedUsers.length > 1 ? 's' : ''}</span>
                  </span>
                </span>
              </span>

              <div className="flex items-center">
                <Button
                  size="sm"
                  className="ltr:mr-3 rtl:ml-3"
                  type="button"
                  customColorClass={() =>
                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                  }
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando…' : 'Eliminar'}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  onClick={() => setSendMessageDialogOpen(true)}
                  disabled={isDeleting}
                >
                  Mensaje
                </Button>
              </div>
            </div>
          </div>
        </StickyFooter>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmationOpen}
        type="danger"
        title="Eliminar permanentemente"
        onClose={handleCancel}
        onRequestClose={handleCancel}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
      >
        <p>
          ¿Seguro que deseas eliminar permanentemente los usuarios seleccionados? Esta acción no se puede deshacer.
        </p>
      </ConfirmDialog>

      <Dialog
        isOpen={sendMessageDialogOpen}
        onRequestClose={() => setSendMessageDialogOpen(false)}
        onClose={() => setSendMessageDialogOpen(false)}
      >
        <h5 className="mb-2">Enviar mensaje</h5>
        <p>Enviar mensaje a los siguientes usuarios</p>
        <Avatar.Group
          chained
          omittedAvatarTooltip
          className="mt-4"
          maxCount={4}
          omittedAvatarProps={{ size: 30 }}
        >
          {selectedUsers.map((user) => (
            <Tooltip key={String(user.id)} title={String(user.name ?? '')}>
              <Avatar size={30} src={getAvatarSrc(user)} alt="" />
            </Tooltip>
          ))}
        </Avatar.Group>
        <div className="my-4">
          <RichTextEditor content={''} />
        </div>
        <div className="ltr:justify-end flex items-center gap-2">
          <Button size="sm" onClick={() => setSendMessageDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="solid"
            loading={sendMessageLoading}
            onClick={handleSend}
          >
            Enviar
          </Button>
        </div>
      </Dialog>
    </>
  )
}

export default UsersListSelected
