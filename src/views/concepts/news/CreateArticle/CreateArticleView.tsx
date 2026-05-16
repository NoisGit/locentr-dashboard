import { useState } from 'react'
import { useNavigate } from 'react-router'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'
import ArticleForm from './ArticleForm'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { apiCreateNews } from '@/services/NewsService'

type ArticlePayload = {
  title: string
  content: string
}

const CreateArticleView = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedId: companyId } = useCompaniesStore()

  const handleFormSubmit = async (values: ArticlePayload) => {
    if (companyId == null || companyId === '') {
      toast.push(<Notification type="warning">Selecciona una empresa.</Notification>, {
        placement: 'top-center',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await apiCreateNews(String(companyId), {
        title: values.title,
        content: values.content,
      })
      toast.push(<Notification type="success">Noticia creada correctamente</Notification>, {
        placement: 'top-center',
      })
      navigate('/concepts/news/manage-article')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string } }; message?: string }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'No se pudo crear la noticia'

      toast.push(<Notification type="danger">{message}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    navigate('/concepts/news/manage-article')
  }

  return (
    <div className="px-6 sm:px-8 lg:px-12">
      <Container>
        <AdaptiveCard>
          <ArticleForm
            defaultValues={{
              title: '',
              content: '',
            }}
            onFormSubmit={handleFormSubmit}
          >
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
          </ArticleForm>
        </AdaptiveCard>
      </Container>
    </div>
  )
}

export default CreateArticleView
