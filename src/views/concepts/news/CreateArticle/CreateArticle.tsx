// src/views/concepts/news/ManageArticle/CreateArticle.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'
import ArticleForm from './ArticleForm'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiCreateNews } from '@/services/NewsService'

const CreateArticle = () => {
  const navigate = useNavigate()
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedId: communityId } = useCommunitiesStore()

  const handleFormSubmit = async (values: Article) => {
    if (communityId == null || communityId === '') {
      toast.push(<Notification type="warning">Selecciona una comunidad en el encabezado.</Notification>, {
        placement: 'top-center',
      })
      return
    }
    setIsSubmitting(true)
    try {
      await apiCreateNews(String(communityId), {
        title: values.title,
        content: values.content,
        authors: values.authors,
        tags: values.tags,
      })
      toast.push(<Notification type="success">Noticia creada correctamente</Notification>, {
        placement: 'top-center',
      })
      navigate('/concepts/news/manage-article')
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        'No se pudo crear la noticia'
      toast.push(<Notification type="danger">{msg}</Notification>, { placement: 'top-center' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => setDiscardConfirmationOpen(true)

  const handleConfirmDiscard = () => {
    toast.push(<Notification type="success">Cambios descartados</Notification>, {
      placement: 'top-center',
    })
    navigate('/concepts/news/manage-article')
  }

  return (
    <>
      <div className="px-6 sm:px-8 lg:px-12">
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
                  Descartar
                </Button>
                <Button variant="solid" type="submit" loading={isSubmitting}>
                  Crear
                </Button>
              </div>
            </ArticleForm>
          </AdaptiveCard>
        </Container>
      </div>

      <ConfirmDialog
        isOpen={discardConfirmationOpen}
        type="danger"
        title="¿Descartar cambios?"
        onClose={() => setDiscardConfirmationOpen(false)}
        onRequestClose={() => setDiscardConfirmationOpen(false)}
        onCancel={() => setDiscardConfirmationOpen(false)}
        onConfirm={handleConfirmDiscard}
      >
        <p>¿Seguro que quieres descartar esta noticia? Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </>
  )
}

export default CreateArticle
