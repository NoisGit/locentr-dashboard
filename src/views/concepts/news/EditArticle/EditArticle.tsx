// src/views/concepts/news/EditArticle/EditArticle.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import useSWR, { useSWRConfig } from 'swr'
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
import { apiGetMyCommunities, apiListCommunities, type Community } from '@/services/CommunitiesService'
import { useAuth } from '@/auth'

type EditFormValues = {
  title: string
  content: string
  authors: string
}

type RTEOnChangePayload = { html: string }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function errMsg(e: unknown): string {
  if (typeof e === 'string') return e
  if (isRecord(e)) {
    const r = e as { response?: { data?: { message?: string } }; message?: string }
    return r.response?.data?.message || r.message || 'Ocurrió un error'
  }
  return 'Ocurrió un error'
}

/* -------- permisos -------- */
function readRoleTokens(user: unknown): string[] {
  if (!isRecord(user)) return []
  const u = user as Record<string, unknown>
  const src = (u.roles ?? u.role ?? u.authorities ?? u.authority) as unknown
  if (Array.isArray(src)) return src.map((x) => String(x).toLowerCase())
  if (src != null) return [String(src).toLowerCase()]
  return []
}
function isSuperAdminUser(user: unknown): boolean {
  const tokens = readRoleTokens(user)
  const set = new Set(tokens)
  const hits = ['superadmin', 'super-admin', 'super_admin', 'owner', 'root']
  return hits.some((t) => set.has(t) || tokens.some((x) => x.includes(t)))
}
function getCurrentUserIdFromStorage(): number | string | undefined {
  try {
    const keys = ['access_token', 'token', 'auth', 'session', 'authToken']
    let raw: string | null = null
    for (const k of keys) {
      raw = window.localStorage.getItem(k) || window.sessionStorage.getItem(k)
      if (raw) break
    }
    if (!raw) return undefined
    let token = raw
    if (raw.startsWith('{')) {
      const obj = JSON.parse(raw)
      token =
        (obj.access_token as string | undefined) ||
        (obj.accessToken as string | undefined) ||
        (obj.token as string | undefined) ||
        (obj.jwt as string | undefined) ||
        (obj?.state?.token as string | undefined) ||
        (obj?.user?.token as string | undefined)
    }
    if (!token || typeof token !== 'string' || !token.includes('.')) return undefined
    const base64url = token.split('.')[1]
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(decodeURIComponent(escape(atob(base64))))
    if (isRecord(json)) {
      const j = json as Record<string, unknown>
      const cand = j.user_id ?? j.sub ?? j.id
      if (typeof cand === 'number' || (typeof cand === 'string' && cand.trim() !== '')) {
        return cand as number | string
      }
    }
    return undefined
  } catch {
    return undefined
  }
}
function getUserIdFromAuth(user: unknown): number | string | undefined {
  if (!isRecord(user)) return undefined
  const u = user as Record<string, unknown>
  const id = u.id
  const user_id = u.user_id
  const uid = u.uid
  if (typeof id === 'number' || (typeof id === 'string' && id.trim() !== '')) return id as number | string
  if (typeof user_id === 'number' || (typeof user_id === 'string' && String(user_id).trim() !== '')) return user_id as number | string
  if (typeof uid === 'number' || (typeof uid === 'string' && String(uid).trim() !== '')) return uid as number | string
  return undefined
}

/* -------- fetcher “smart” por ID --------
   - Si hay communityId: usa ese.
   - Si NO hay, lista comunidades del usuario (o todas) y busca la noticia por ID. */
async function getAllCommunityIds(): Promise<Array<string | number>> {
  let list: Community[] = []
  try {
    list = await apiGetMyCommunities<Community[]>()
  } catch {
    /* ignore */
  }
  if (!list.length) {
    try {
      list = await apiListCommunities<Community[]>({ pageIndex: 1, pageSize: 200 })
    } catch {
      /* ignore */
    }
  }
  return Array.from(
    new Set(
      list
        .map((c) => c?.id)
        .filter((id): id is string | number => id !== undefined && id !== null)
        .map((x) => String(x)),
    ),
  ).map((x) => (/^\d+$/.test(x) ? Number(x) : x))
}

async function smartGetNewsById(
  newsId: string | number,
  communityId?: string | number
): Promise<NewsDetail> {
  if (communityId !== undefined && String(communityId) !== '') {
    return apiGetNewsById(String(communityId), String(newsId))
  }
  const ids = await getAllCommunityIds()
  for (const cid of ids) {
    try {
      const detail = await apiGetNewsById(String(cid), String(newsId))
      // si no lanza error, la encontramos
      return detail
    } catch {
      // probar siguiente comunidad
    }
  }
  // si no se encontró en ninguna, forzamos un error legible
  throw new Error('No se encontró la noticia en tus comunidades.')
}

/* ====================== Component ====================== */
const EditArticle = () => {
  const { id: idParam } = useParams()
  const id = idParam ?? ''
  const navigate = useNavigate()
  const { selectedId: communityId } = useCommunitiesStore()
  const { user } = useAuth()
  const { mutate: mutateGlobal } = useSWRConfig()

  // clave estable: depende del id y del communityId (aunque esté vacío)
  const swrKey =
    id ? (['news:detail-smart', String(id), String(communityId ?? '')] as const) : null

  const { data, isLoading } = useSWR<NewsDetail>(
    swrKey,
    ([, nid, cid]) => smartGetNewsById(nid, cid || undefined),
    { revalidateOnFocus: false, revalidateIfStale: true, revalidateOnMount: true }
  )

  const defaults: EditFormValues = useMemo(
    () => ({
      title: data?.title ?? '',
      content: data?.content ?? '',
      authors: (data as any)?.created_by ?? '',
    }),
    [data]
  )

  const { register, handleSubmit, setValue, formState: { errors }, reset } =
    useForm<EditFormValues>({ defaultValues: defaults })

  const [liveHtml, setLiveHtml] = useState<string>('')

  useEffect(() => {
    reset(defaults)
    setLiveHtml(defaults.content)
    setValue('content', defaults.content, { shouldDirty: false })
  }, [defaults, reset, setValue])

  const currentUserId = getUserIdFromAuth(user) ?? getCurrentUserIdFromStorage()
  const creatorId: number | string | undefined = useMemo(() => {
    if (!data) return undefined
    const r = data as unknown as Record<string, unknown>
    const flat = r.created_by_user_id ?? r.created_by_id ?? r.author_id
    if (typeof flat === 'number' || (typeof flat === 'string' && String(flat).trim() !== '')) {
      return flat as number | string
    }
    const author = r.author
    if (isRecord(author) && (typeof author.id === 'number' || (typeof author.id === 'string' && String(author.id).trim() !== ''))) {
      return author.id as number | string
    }
    const created_by = r.created_by
    if (isRecord(created_by) && (typeof created_by.id === 'number' || (typeof created_by.id === 'string' && String(created_by.id).trim() !== ''))) {
      return created_by.id as number | string
    }
    return undefined
  }, [data])

  const superAdmin = isSuperAdminUser(user)
  const canEdit =
    superAdmin ||
    (creatorId != null && currentUserId != null && String(creatorId) === String(currentUserId))

  useEffect(() => {
    if (isLoading) return
    if (data && !canEdit) {
      toast.push(
        <Notification type="warning">No tienes permiso para editar esta noticia.</Notification>,
        { placement: 'top-center' }
      )
      navigate('/concepts/news/manage-article', { replace: true })
    }
  }, [isLoading, data, canEdit, navigate])

  const [saving, setSaving] = useState(false)

  const onSubmit = async (values: EditFormValues) => {
    if (!id) return
    // si no hay communityId (vista “todas”), intentamos detectar la comunidad correcta
    let targetCommunityId: string | number | undefined = communityId ?? undefined
    if (!targetCommunityId) {
      try {
        const ids = await getAllCommunityIds()
        for (const cid of ids) {
          try {
            await apiGetNewsById(String(cid), String(id))
            targetCommunityId = cid
            break
          } catch { /* probar siguiente */ }
        }
      } catch { /* noop */ }
    }
    if (!targetCommunityId) {
      toast.push(<Notification type="danger">No se pudo determinar la comunidad de la noticia.</Notification>, { placement: 'top-center' })
      return
    }
    if (!canEdit) {
      toast.push(<Notification type="warning">No tienes permiso para editar esta noticia.</Notification>, {
        placement: 'top-center',
      })
      return
    }
    setSaving(true)
    try {
      await apiUpdateNews(String(targetCommunityId), String(id), {
        title: values.title,
        content: liveHtml,
        ...(currentUserId != null ? { created_by_user_id: currentUserId } : {}),
      })
      await mutateGlobal(
        (key) =>
          Array.isArray(key) &&
          key[0] === 'news:list' &&
          String(key[1]) === String(targetCommunityId)
      )
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

  const editorShellRef = useRef<HTMLDivElement | null>(null)
  const focusInnerEditor = () => {
    const root = editorShellRef.current
    if (!root) return
    const ce = root.querySelector('[contenteditable="true"]') as HTMLElement | null
    if (ce) {
      ce.focus()
      try {
        const sel = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(ce)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      } catch { /* noop */ }
    }
  }

  const editorKey = useMemo(() => {
    const sig = (data?.updated_at && String(data.updated_at)) || String((defaults.content || '').length)
    return `${String(id || 'new')}:${sig}`
  }, [id, data?.updated_at, defaults.content])

  return (
    <div className="px-6 sm:px-8 lg:px-12">
      <Container>
        <AdaptiveCard>
          {isLoading ? (
            <div className="p-6 text-sm text-gray-500">Cargando…</div>
          ) : (
            <Form className="w-full" onSubmit={handleSubmit(onSubmit)}>
              <div className="max-w-[1400px] mx-auto px-6 space-y-6">
                <h2 className="text-xl font-semibold">Editar noticia</h2>

                <FormItem label="Título" invalid={!!errors.title} errorMessage={errors.title?.message}>
                  <Input
                    className="rounded-xl"
                    readOnly={!canEdit}
                    {...register('title', { required: 'El título es obligatorio' })}
                  />
                </FormItem>

                <FormItem label="Contenido">
                  <div
                    ref={editorShellRef}
                    className={canEdit ? 'cursor-text' : 'pointer-events-none opacity-70'}
                    onMouseDown={(e) => {
                      if (!canEdit) return
                      const target = e.target as HTMLElement
                      if (!target.closest('[contenteditable="true"]')) {
                        e.preventDefault()
                        focusInnerEditor()
                      }
                    }}
                  >
                    <RichTextEditor
                      key={editorKey}
                      content={defaults.content}
                      editorContentClass="min-h=[320px] px-3 py-3"
                      placeholder="Escribe el contenido aquí…"
                      onChange={({ html }: RTEOnChangePayload) => {
                        setLiveHtml(html)
                        setValue('content', html, { shouldDirty: true })
                      }}
                    />
                  </div>
                </FormItem>

                <div className="space-y-1">
                  <div className="text-[13px] text-gray-600 dark:text-gray-400">Autor</div>
                  <p className="text-sm leading-relaxed select-text">
                    <strong>{defaults.authors || '—'}</strong>
                    {!canEdit && !isSuperAdminUser(user) ? (
                      <span className="ml-2 text-xs text-gray-500">(solo el autor puede editar)</span>
                    ) : null}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => navigate('/concepts/news/manage-article')}>
                    Cancelar
                  </Button>
                  <Button disabled={!canEdit} loading={saving} type="submit" variant="solid">
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
