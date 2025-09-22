// src/views/concepts/news/EditArticle/EditArticle.tsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import useSWR from 'swr'
import { useForm } from 'react-hook-form'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import RichTextEditor from '@/components/shared/RichTextEditor'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetNewsById, apiUpdateNews, type NewsDetail } from '@/services/NewsService'

type EditFormValues = {
  title: string
  content: string
  authors: string
}

function errMsg(e: unknown): string {
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const obj = e as { response?: { data?: { message?: string } }; message?: string }
    return obj.response?.data?.message || obj.message || 'Ocurrió un error'
  }
  return 'Ocurrió un error'
}

const EditArticle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedId: communityId } = useCommunitiesStore()

  const swrKey =
    id && communityId != null && String(communityId) !== ''
      ? (['news:detail', String(communityId), String(id)] as const)
      : null

  const { data, isLoading } = useSWR<NewsDetail>(
    swrKey,
    ([, cid, nid]) => apiGetNewsById<NewsDetail>(cid, nid),
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  const defaults: EditFormValues = useMemo(
    () => ({
      title: data?.title ?? '',
      content: data?.content ?? '',
      authors: data?.created_by ?? '',
    }),
    [data]
  )

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditFormValues>({ defaultValues: defaults })

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  const [saving, setSaving] = useState(false)

  const onSubmit = async (values: EditFormValues) => {
    if (!communityId || !id) return
    setSaving(true)
    try {
      await apiUpdateNews(communityId, id, {
        title: values.title,
        content: values.content,
      })
      toast.push(<Notification type="success">Noticia actualizada</Notification>, {
        placement: 'top-center',
      })
      navigate('/concepts/news/manage-article')
    } catch (e) {
      toast.push(<Notification type="danger">{errMsg(e)}</Notification>, {
        placement: 'top-center',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-6 sm:px-8 lg:px-12">
      <Container>
        <AdaptiveCard>
          {isLoading ? (
            <div className="p-6 text-sm text-gray-500">Cargando…</div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="max-w-[1400px] mx-auto px-6 space-y-6">
                <h2 className="text-xl font-semibold">Editar noticia</h2>

                <FormItem label="Título" invalid={!!errors.title} errorMessage={errors.title?.message}>
                  <Input className="rounded-xl" readOnly {...register('title', { required: true })} />
                </FormItem>

                <FormItem label="Contenido">
                  <RichTextEditor
                    key={data?.id ?? 'editor'}
                    content={watch('content')}
                    onChange={({ html }) => setValue('content', html)}
                    editorContentClass="min-h-[220px]"
                  />
                </FormItem>

                <FormItem label="Autor" invalid={!!errors.authors} errorMessage={errors.authors?.message}>
                  <Input className="rounded-xl" {...register('authors')} readOnly />
                </FormItem>

                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => navigate('/concepts/news/manage-article')}>
                    Cancelar
                  </Button>
                  <Button variant="solid" type="submit" loading={saving}>
                    Guardar
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </AdaptiveCard>
      </Container>
    </div>
  )
}

export default EditArticle
