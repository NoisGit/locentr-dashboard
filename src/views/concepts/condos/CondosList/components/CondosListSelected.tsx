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

const CondosListSelected = () => {
    const {
        selectedCondo: selectedCondos,
        condosList,
        mutate,
        condosListTotal,
        setSelectAllCondos,
    } = useCondosList()

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false)
    const [sendMessageLoading, setSendMessageLoading] = useState(false)

    const handleDelete = () => setDeleteConfirmationOpen(true)
    const handleCancel = () => setDeleteConfirmationOpen(false)

    const handleConfirmDelete = () => {
        const newCondosList = condosList.filter(
            (condo) => !selectedCondos.some((s) => s.id === condo.id)
        )

        setSelectAllCondos([])
        mutate(
            {
                list: newCondosList,
                total: condosListTotal - selectedCondos.length,
            },
            false
        )
        setDeleteConfirmationOpen(false)
    }

    const handleSend = () => {
        setSendMessageLoading(true)
        setTimeout(() => {
            toast.push(
                <Notification type="success">Mensaje enviado</Notification>,
                { placement: 'top-center' }
            )
            setSendMessageLoading(false)
            setSendMessageDialogOpen(false)
            setSelectAllCondos([])
        }, 500)
    }

    return (
        <>
            {selectedCondos.length > 0 && (
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
                                >
                                    Eliminar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={() => setSendMessageDialogOpen(true)}
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
                title="Eliminar condominios"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
            >
                <p>
                    ¿Estás segura de que quieres eliminar estos condominios? Esta acción no se puede deshacer.
                </p>
            </ConfirmDialog>

            {/* Send Message Dialog */}
            <Dialog
                isOpen={sendMessageDialogOpen}
                onRequestClose={() => setSendMessageDialogOpen(false)}
                onClose={() => setSendMessageDialogOpen(false)}
            >
                <h5 className="mb-2">Enviar mensaje</h5>
                <p>Enviar mensaje a los siguientes condominios</p>
                <Avatar.Group
                    chained
                    omittedAvatarTooltip
                    className="mt-4"
                    maxCount={4}
                    omittedAvatarProps={{ size: 30 }}
                >
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
                    <Button
                        size="sm"
                        onClick={() => setSendMessageDialogOpen(false)}
                    >
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

export default CondosListSelected
