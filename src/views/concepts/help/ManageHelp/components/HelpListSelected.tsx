import { useState, useEffect } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useManageHelpStore } from '../store/manageHelpStore'
import useManageHelp from '../hooks/useManageHelp'
import { TbChecks } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import type { HelpTicket } from '../types'

const HelpListSelected = () => {
    const { helpList, mutate, helpTotal } = useManageHelp()

    const selectedTicket = useManageHelpStore((state) => state.selectedTicket)
    const setSelectAllTickets = useManageHelpStore((state) => state.setSelectAllTickets)

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const hasSelectedTicket = selectedTicket.length > 0

    const handleDelete = () => setDeleteConfirmationOpen(true)
    const handleCancel = () => setDeleteConfirmationOpen(false)

    const handleConfirmDelete = () => {
        const newHelpList = helpList.filter(
            (ticket) => !selectedTicket.some((selected) => selected.id === ticket.id)
        )

        setSelectAllTickets([])
        mutate(
            {
                list: newHelpList,
                total: helpTotal - selectedTicket.length,
            },
            false
        )
        setDeleteConfirmationOpen(false)
    }

    useEffect(() => {
        if (hasSelectedTicket) {
            setTimeout(() => {
                window.scrollBy({ top: 20, behavior: 'smooth' })
            }, 100)
        }
    }, [hasSelectedTicket])

    return (
        <>
            <StickyFooter
                className={classNames(
                    'flex items-center justify-between py-4 bg-white dark:bg-gray-800',
                    !hasSelectedTicket && 'hidden'
                )}
                stickyClass="border-t border-gray-200 dark:border-gray-700 px-8 -mx-4 sm:-mx-8"
                defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
            >
                <div className="container mx-auto flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <TbChecks className="text-lg text-primary" />
                        <span className="font-semibold flex items-center gap-1">
                            <span className="heading-text">
                                {selectedTicket.length} Tickets
                            </span>
                            <span>selected</span>
                        </span>
                    </span>
                    <Button
                        size="sm"
                        type="button"
                        className="border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </div>
            </StickyFooter>

            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="Remove tickets"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
            >
                <p>Are you sure you want to remove these tickets? This action can't be undone.</p>
            </ConfirmDialog>
        </>
    )
}

export default HelpListSelected
