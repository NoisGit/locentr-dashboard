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
import useEntryList from '../hooks/useEntryList'
import { TbChecks } from 'react-icons/tb'

const EntryListSelected = () => {
    const {
        selectedEntry,
        entryList,
        mutate,
        entryListTotal,
        setSelectAllEntry,
    } = useEntryList()

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false)
    const [sendMessageLoading, setSendMessageLoading] = useState(false)

    const handleDelete = () => setDeleteConfirmationOpen(true)
    const handleCancel = () => setDeleteConfirmationOpen(false)

    const handleConfirmDelete = () => {
        const newEntryList = entryList.filter(
            (entry) => !selectedEntry.some((s) => s.id === entry.id)
        )

        setSelectAllEntry([])
        mutate(
            {
                list: newEntryList,
                total: entryListTotal - selectedEntry.length,
            },
            false
        )
        setDeleteConfirmationOpen(false)
    }

    const handleSend = () => {
        setSendMessageLoading(true)
        setTimeout(() => {
            toast.push(
                <Notification type="success">Message sent</Notification>,
                { placement: 'top-center' }
            )
            setSendMessageLoading(false)
            setSendMessageDialogOpen(false)
            setSelectAllEntry([])
        }, 500)
    }

    return (
        <>
            {selectedEntry.length > 0 && (
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
                                    {selectedEntry.length} entries selected
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
                                    Delete
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={() => setSendMessageDialogOpen(true)}
                                >
                                    Message
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
                title="Delete entries"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
            >
                <p>
                    Are you sure you want to delete these entries? This action cannot be undone.
                </p>
            </ConfirmDialog>

            {/* Send Message Dialog */}
            <Dialog
                isOpen={sendMessageDialogOpen}
                onRequestClose={() => setSendMessageDialogOpen(false)}
                onClose={() => setSendMessageDialogOpen(false)}
            >
                <h5 className="mb-2">Send message</h5>
                <p>Send a message to the selected entries</p>
                <Avatar.Group
                    chained
                    omittedAvatarTooltip
                    className="mt-4"
                    maxCount={4}
                    omittedAvatarProps={{ size: 30 }}
                >
                    {selectedEntry.map((entry) => (
                        <Tooltip key={entry.id} title={entry.name}>
                            <Avatar size={30} src={entry.img} alt={entry.name} />
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
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        loading={sendMessageLoading}
                        onClick={handleSend}
                    >
                        Send
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default EntryListSelected
