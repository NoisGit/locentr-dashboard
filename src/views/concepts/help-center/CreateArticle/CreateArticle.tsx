import { useState } from 'react'
import { useNavigate } from 'react-router'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'
import sleep from '@/utils/sleep'
import ArticleForm from './ArticleForm'
import type { Article } from './types'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const CreateArticle = () => {
  const navigate = useNavigate()
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (values: Article) => {
    setIsSubmitting(true)
    console.log('Submitted:', values)
    await sleep(800)
    toast.push(<Notification type="success">Article created successfully</Notification>, {
      placement: 'top-center',
    })
    setIsSubmitting(false)
    navigate('/concepts/news/manage-article')
  }

  const handleDiscard = () => setDiscardConfirmationOpen(true)

  const handleConfirmDiscard = () => {
    toast.push(<Notification type="success">Changes discarded</Notification>, {
      placement: 'top-center',
    })
    navigate('/concepts/news/manage-article')
  }

  return (
    <>
      <Container>
        <AdaptiveCard>
          <ArticleForm
            defaultValues={{
              title: '',
              content: '',
              authors: '',
              tags: '',
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
          </ArticleForm>
        </AdaptiveCard>
      </Container>

      <ConfirmDialog
        isOpen={discardConfirmationOpen}
        type="danger"
        title="Discard changes?"
        onClose={() => setDiscardConfirmationOpen(false)}
        onRequestClose={() => setDiscardConfirmationOpen(false)}
        onCancel={() => setDiscardConfirmationOpen(false)}
        onConfirm={handleConfirmDiscard}
      >
        <p>Are you sure you want to discard this article? This action cannot be undone.</p>
      </ConfirmDialog>
    </>
  )
}

export default CreateArticle
