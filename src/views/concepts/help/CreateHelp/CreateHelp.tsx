import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'
import sleep from '@/utils/sleep'
import HelpForm from './HelpForm'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import type { HelpTicket } from '../ManageHelp/types'

const CreateHelp = () => {
    const navigate = useNavigate()
    const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFormSubmit = async (values: HelpTicket) => {
        setIsSubmitting(true)
        console.log('Submitted:', values)
        await sleep(800)
        toast.push(
            <Notification type="success">Support ticket created successfully</Notification>,
            { placement: 'top-center' }
        )
        setIsSubmitting(false)
        navigate('/concepts/help/manage-help')
    }

    const handleDiscard = () => setDiscardConfirmationOpen(true)

    const handleConfirmDiscard = () => {
        toast.push(<Notification type="success">Ticket discarded</Notification>, {
            placement: 'top-center',
        })
        navigate('/concepts/help/manage-help')
    }

    return (
        <>
            <div className="px-6 sm:px-8 lg:px-12">
                <Container>
                    <AdaptiveCard>
                        <HelpForm
                            defaultValues={{
                                email: '',
                                subject: '',
                                message: '',
                                acceptTerms: false,
                            }}
                            onFormSubmit={handleFormSubmit}
                        >
                            <div className="flex justify-end gap-4 mt-8">
                                <Button
                                    type="button"
                                    className="border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent"
                                    icon={<TbTrash />}
                                    onClick={handleDiscard}
                                >
                                    Discard
                                </Button>
                                <Button variant="solid" type="submit" loading={isSubmitting}>
                                    Create
                                </Button>
                            </div>
                        </HelpForm>
                    </AdaptiveCard>
                </Container>
            </div>

            <ConfirmDialog
                isOpen={discardConfirmationOpen}
                type="danger"
                title="Discard changes?"
                onClose={() => setDiscardConfirmationOpen(false)}
                onRequestClose={() => setDiscardConfirmationOpen(false)}
                onCancel={() => setDiscardConfirmationOpen(false)}
                onConfirm={handleConfirmDiscard}
            >
                <p>Are you sure you want to discard this support ticket? This action cannot be undone.</p>
            </ConfirmDialog>
        </>
    )
}

export default CreateHelp
