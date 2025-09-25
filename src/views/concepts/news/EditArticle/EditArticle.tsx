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

/** Fallback: lee user_id desde el JWT en storage (access_token / token / auth JSON) */
function getCurrentUserIdFromStorage(): number | string | undefined {
  try {
    const keys = ['access_token', 'token', 'auth', 'session', 'authToken']
    let raw: string | null = null
    for (const k of keys) {
      raw = window.localStorage.getItem(k) || window.sessionStorage.getItem(k)
      if (raw) break
    }
    if (!raw) return undefined

    // Si viene en JSON, intenta extraer la propiedad token
    let token = raw
    if (raw.startsWith('{')) {
      const obj = JSON.parse(raw)
      token =
        obj.access_token ||
        obj.accessToken ||
        obj.token ||
        obj.jwt ||
        obj?.state?.token ||
        obj?.user?.token
    }
    if (!token || typeof token !== 'string' || !token.includes('.')) return undefined

    const base64url = token.split('.')[1]
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(decodeURIComponent(escape(atob(base64))))
    // Claims comunes: user_id, sub, id
    return json.user_id ?? json.sub ?? json.id ?? undefined
  } catch {
    return undefined
  }
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
  } = useForm<EditFormValues>({ defaultValues: defaults })

  // Contenido en estado local para setearlo instantáneo en el editor
  const [editorContent, setEditorContent] = useState<string>('')

  useEffect(() => {
    reset(defaults)
    setEditorContent(defaults.content) // carga inmediata al editor
    setValue('content', defaults.content, { shouldDirty: false })
  }, [defaults, reset, setValue])

  // Id de autor para el backend: del detalle o del JWT como fallback
  const authorIdForBackend = useMemo(() => {
    const anyData = data as unknown as Record<string, any> | undefined
    return (
      anyData?.created_by_user_id ??
      anyData?.created_by_id ??
      anyData?.author_id ??
      anyData?.author?.id ??
      getCurrentUserIdFromStorage()
    )
  }, [data])

  const [saving, setSaving] = useState(false)

  const onSubmit = async (values: EditFormValues) => {
    if (!communityId || !id) return
    setSaving(true)
    try {
      await apiUpdateNews(communityId, id, {
        title: values.title,
        content: editorContent, // manda lo que ves en el editor
        ...(authorIdForBackend != null ? { created_by_user_id: authorIdForBackend } : {}),
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

                {/* Título EDITABLE */}
                <FormItem label="Título" invalid={!!errors.title} errorMessage={errors.title?.message}>
                  <Input
                    className="rounded-xl"
                    {...register('title', { required: 'El título es obligatorio' })}
                  />
                </FormItem>

                {/* Contenido EDITABLE: caja completa clickeable */}
                <FormItem label="Contenido">
                  <div className="cursor-text">
                    <RichTextEditor
                      key={`${String(id ?? 'new')}:${(defaults.content || '').length}`}
                      content={editorContent}
                      onChange={({ html }) => {
                        setEditorContent(html)
                        setValue('content', html, { shouldDirty: true })
                      }}
                      editorContentClass="min-h-[300px] px-3 py-3 cursor-text"
                    />
                  </div>
                </FormItem>

                {/* Autor como texto plano (no input) al final */}
                <div className="space-y-1">
                  <div className="text-[13px] text-gray-600 dark:text-gray-400">Autor</div>
                  <p className="text-sm leading-relaxed select-text">
                    <strong>{defaults.authors || '—'}</strong>
                  </p>
                </div>

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
