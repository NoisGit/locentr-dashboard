import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import LogbookForm from '../LogbookForm'
import NoProductFound from '@/assets/svg/NoProductFound'
import sleep from '@/utils/sleep'
import { TbTrash, TbArrowNarrowLeft } from 'react-icons/tb'
import { useParams, useNavigate } from 'react-router'
import type { LogbookFormSchema, LogbookItem } from '../types'
import { logbookData } from '@/mock/data/logbookData'

const LogbookEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // Find the item locally
    const [data, setData] = useState<LogbookItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const found = logbookData.find((item) => item.id === id)
        setData(found || null)
        setIsLoading(false)
    }, [id])

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Default values with logbook fields
    const getDefaultValues = (): LogbookFormSchema | {} => {
        if (data) {
            const {
                title,
                description,
                date,
                responsible,
                tags,
                files,
            } = data
            return {
                title,
                description,
                date,
                responsible,
                tags: tags?.length
                    ? tags.map((t) => ({ label: t, value: t }))
                    : [],
                files: files || [],
            }
        }
        return {}
    }

    const handleFormSubmit = async (values: LogbookFormSchema) => {
        // Simulate "save"
        console.log('Submitted values', values)
        setIsSubmitting(true)
        await sleep(800)
        setIsSubmitting(false)
        toast.push(<Notification type="success">Changes saved!</Notification>, {
            placement: 'top-center',
        })
        navigate('/concepts/logbook/logbook-list')
    }

    const handleDelete = () => setDeleteConfirmationOpen(true)
    const handleCancel = () => setDeleteConfirmationOpen(false)
    const handleBack = () => navigate('/concepts/logbook/logbook-list')

    const handleConfirmDelete = () => {
        setDeleteConfirmationOpen(false)
        toast.push(
            <Notification type="success">Logbook item deleted!</Notification>,
            { placement: 'top-center' }
        )
        navigate('/concepts/logbook/logbook-list')
    }

    return (
        <>
            {!isLoading && !data && (
                <div className="h-full flex flex-col items-center justify-center">
                    <NoProductFound height={280} width={280} />
                    <h3 className="mt-8">No logbook item found!</h3>
                </div>
            )}
            {!isLoading && data && (
                <>
                    <LogbookForm
                        defaultValues={getDefaultValues() as LogbookFormSchema}
                        newLogbook={false}
                        onFormSubmit={handleFormSubmit}
                    >
                        <Container>
                            <div className="flex items-center justify-between px-8">
                                <Button
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    variant="plain"
                                    icon={<TbArrowNarrowLeft />}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                <div className="flex items-center">
                                    <Button
                                        className="ltr:mr-3 rtl:ml-3"
                                        type="button"
                                        customColorClass={() =>
                                            'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                        }
                                        icon={<TbTrash />}
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmitting}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </LogbookForm>
                    <ConfirmDialog
                        isOpen={deleteConfirmationOpen}
                        type="danger"
                        title="Remove logbook item"
                        onClose={handleCancel}
                        onRequestClose={handleCancel}
                        onCancel={handleCancel}
                        onConfirm={handleConfirmDelete}
                    >
                        <p>
                            Are you sure you want to remove this item? This action can't be undone.
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </>
    )
}

export default LogbookEdit
