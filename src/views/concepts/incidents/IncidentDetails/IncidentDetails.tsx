import { useEffect, useMemo, useRef, useState, FormEvent, KeyboardEvent } from 'react'
import { useParams } from 'react-router'
import useSWR from 'swr'
import isEmpty from 'lodash/isEmpty'

import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'

import ApiService from '@/services/ApiService'
import {
  apiFindIncidentByIdAcrossCommunities,
  type IncidentRow,
} from '@/services/IncidentsService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { useIncidentListStore } from '@/views/concepts/incidents/IncidentList/store/IncidentListStore'

/* ---------------- Utils ---------------- */
const formatDate = (iso?: string): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
const formatTime = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

/* runtime guards (sin any) */
type Dict = Record<string, unknown>
const isObject = (v: unknown): v is Dict => typeof v === 'object' && v !== null
const get = (o: unknown, k: string): unknown => (isObject(o) ? o[k] : undefined)
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const toStr = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : undefined

const pickString = (obj: unknown, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = toStr(get(obj, k))
    if (typeof v === 'string' && v.trim() !== '') return v
  }
  return undefined
}

/* Field con label mejorado (negrita + un poco más grande) */
const FieldCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Card className="w-full">
    <div className="p-3">
      <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </div>
      <div className="text-[16px] leading-relaxed">{children}</div>
    </div>
  </Card>
)

/* Pills fijas */
const StatusPill = ({ value }: { value?: IncidentRow['status'] }) => {
  const { bg, text, label } = useMemo(() => {
    const v = (value ?? '').toString().toUpperCase()
    if (v === 'PENDING' || v === 'OPEN') return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' }
    if (v === 'IN_PROGRESS') return { bg: 'bg-sky-100', text: 'text-sky-700', label: 'En proceso' }
    if (v === 'RESOLVED' || v === 'CLOSED') return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resuelto' }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: value ?? '—' }
  }, [value])
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}>{label}</span>
}

const PriorityPill = ({ value }: { value?: IncidentRow['priority'] }) => {
  const { bg, text, label } = useMemo(() => {
    const v = (value ?? '').toString().toUpperCase()
    if (v === 'HIGH' || v === 'ALTA' || v === 'ALTO') return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Alta' }
    if (v === 'LOW' || v === 'BAJA' || v === 'BAJO') return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Baja' }
    return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Media' }
  }, [value])
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}>{label}</span>
}

/* ---------------- Comentarios ---------------- */
type LocalComment = {
  id: string | number
  author_name: string
  text: string
  created_at?: string
  my_comment?: boolean
}

/* burbuja de comentario */
const CommentItem = ({ c }: { c: LocalComment }) => {
  const isMine = !!c.my_comment
  const timeStr = formatTime(c.created_at)
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'relative max-w-[85%] rounded-2xl px-4 py-2 shadow-sm',
          isMine
            ? 'bg-sky-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-gray-100',
        ].join(' ')}
      >
        <div className={`mb-1 text-xs ${isMine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          {(c.author_name ?? '—')} • {formatDate(c.created_at)}
        </div>
        <div className="text-[15px] leading-6 whitespace-pre-wrap break-words pr-10">
          {c.text}
        </div>
        {timeStr && (
          <span className={`absolute bottom-1 right-2 text-[11px] ${isMine ? 'text-white/80' : 'text-gray-500'}`}>
            {timeStr}
          </span>
        )}
      </div>
    </div>
  )
}

/* fetcher ordenado ASC — así la UI siempre va de arriba a abajo */
async function apiGetUpdatesArray(incidentId: string | number): Promise<LocalComment[]> {
  const body: unknown = await ApiService.fetchDataWithAxios({
    url: `/api/v1/incidents/${encodeURIComponent(String(incidentId))}/updates`,
    method: 'get',
  })
  const rawList = asArray(body)
  const dataList = rawList.length ? rawList : asArray(get(body, 'data'))
  const mapped = dataList.map((x): LocalComment => {
    const o = x as Dict
    return {
      id: (get(o, 'id') as string | number) ?? String(Math.random()),
      author_name: (toStr(get(o, 'user')) ?? toStr(get(o, 'author_name')) ?? '—') as string,
      text: (toStr(get(o, 'comment')) ?? toStr(get(o, 'text')) ?? '') as string,
      my_comment: Boolean(get(o, 'my_comment')),
      created_at: toStr(get(o, 'created_at')),
    }
  })
  return [...mapped].sort((a, b) => Date.parse(a.created_at ?? '') - Date.parse(b.created_at ?? ''))
}

/* POST correcto -> evita 422 */
async function apiPostUpdate(incidentId: string | number, comment: string) {
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/incidents/${encodeURIComponent(String(incidentId))}/updates`,
    method: 'post',
    data: { comment },
  })
}

/* busca el incidente dentro de la comunidad seleccionada (trae description) */
type CommunityIncident = { id?: string | number; description?: string; title?: string }
async function apiFindIncidentInCommunity(
  communityId: string | number,
  incidentId: string | number,
): Promise<CommunityIncident | undefined> {
  const body: unknown = await ApiService.fetchDataWithAxios({
    url: `/api/v1/incidents/community/${encodeURIComponent(String(communityId))}`,
    method: 'get',
    params: { pageIndex: 1, pageSize: 1000 },
  })
  const list1 = asArray(get(get(body, 'data'), 'data'))
  const list2 = list1.length ? list1 : asArray(get(body, 'data'))
  const items = list2.length ? list2 : asArray(body)
  return items
    .map((it) => ({
      id: (get(it, 'id') as string | number | undefined) ?? toStr(get(it, 'incident_id')),
      description: toStr(get(it, 'description')),
      title: toStr(get(it, 'title')),
    }))
    .find((x) => String(x.id ?? '') === String(incidentId))
}

/* Sonido doble-pop estilo WhatsApp/IG, discreto */
const playSendSound = () => {
  try {
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx = new AC()
    const now = ctx.currentTime
    const pop = (t: number, f1: number, f2: number, dur = 0.085, gain = 0.08) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(f1, now + t)
      o.frequency.exponentialRampToValueAtTime(f2, now + t + dur)
      g.gain.setValueAtTime(gain, now + t)
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur)
      o.connect(g).connect(ctx.destination)
      o.start(now + t)
      o.stop(now + t + dur + 0.01)
    }
    pop(0.00, 420, 330, 0.09, 0.08)
    pop(0.07, 800, 600, 0.08, 0.06)
    setTimeout(() => { void ctx.close() }, 220)
  } catch { /* noop */ }
}

/* ---------------- Component ---------------- */
const IncidentDetails = () => {
  const { id, incidentId } = useParams() as { id?: string; incidentId?: string }
  const effectiveId = incidentId ?? id

  const selectedCommunityId = useCommunitiesStore((s) => s.selectedId)

  // De la lista en memoria (fallback de description)
  const activeRows = useIncidentListStore((s) => s.activeTable.data)
  const resolvedRows = useIncidentListStore((s) => s.resolvedTable.data)

  /* Datos base del incidente */
  const {
    data: incident,
    isLoading,
    error,
  } = useSWR<IncidentRow | null>(
    effectiveId ? ['/api/v1/incidents/find-by-id', effectiveId] : null,
    ([, _id]) => apiFindIncidentByIdAcrossCommunities(String(_id)),
    { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false },
  )

  /* fallback para description con el endpoint de comunidad */
  const communityIdForFallback =
    selectedCommunityId ?? (incident as unknown as Dict)?.['community_id']

  const { data: incidentFromCommunity } = useSWR<CommunityIncident | undefined>(
    effectiveId && communityIdForFallback
      ? ['/api/v1/incidents/community/find-one', communityIdForFallback, effectiveId]
      : null,
    ([, communityId, incId]) => apiFindIncidentInCommunity(String(communityId), String(incId)),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  )

  /* Comentarios de la API (ASC) */
  const {
    data: updatesApi,
    isLoading: isLoadingUpdates,
    mutate: mutateUpdates,
  } = useSWR<LocalComment[]>(
    effectiveId ? ['/api/v1/incidents/updates', effectiveId] : null,
    ([, _id]) => apiGetUpdatesArray(String(_id)),
    { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false },
  )

  /* ---- Lista mostrada (evita el “salto”: control local + append inmediato) ---- */
  const [displayUpdates, setDisplayUpdates] = useState<LocalComment[]>([])
  useEffect(() => {
    if (updatesApi) setDisplayUpdates(updatesApi)
  }, [updatesApi])

  const commentsWrapRef = useRef<HTMLDivElement | null>(null)
  const scrollToBottom = (instant = false) => {
    const el = commentsWrapRef.current
    if (!el) return
    const behavior: ScrollBehavior = instant ? 'auto' : 'smooth'
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior }))
  }

  /* ---- Header / fields ---- */
  const isReady = !!incident && !isEmpty(incident) && !error
  const title = incident?.title ?? 'Detalle del Reporte'
  const propertyCode =
    (incident as unknown as Dict)?.['property_number']
      ? String((incident as unknown as Dict)['property_number'])
      : incident?.property_code !== undefined
      ? String(incident.property_code)
      : '—'
  const dateStr = formatDate(incident?.created_at)

  // 3 fuentes para descripción: detalle → comunidad → lista en memoria
  const descriptionFromStore = useMemo(() => {
    const all = [...(activeRows ?? []), ...(resolvedRows ?? [])] as Array<Dict>
    const found = all.find((r) => String(r['id']) === String(effectiveId))
    return pickString(found, ['description', 'desc', 'details', 'detail'])
  }, [activeRows, resolvedRows, effectiveId])

  const description =
    pickString(incident as unknown as Dict, ['description']) ??
    (incidentFromCommunity?.description ?? undefined) ??
    descriptionFromStore ??
    '—'

  /* ---- input ---- */
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [comment])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = (e.currentTarget as HTMLTextAreaElement).closest('form')
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = comment.trim()
    if (!effectiveId || !text) return

    const optimistic: LocalComment = {
      id: `tmp-${Date.now()}`,
      author_name: 'Tú',
      text,
      my_comment: true,
      created_at: new Date().toISOString(),
    }
    setDisplayUpdates((prev) => [...prev, optimistic])
    setComment('')
    playSendSound()
    scrollToBottom(true)

    try {
      setSending(true)
      await apiPostUpdate(effectiveId, text)
      await mutateUpdates()
    } finally {
      setSending(false)
    }
  }

  return (
    <Loading loading={isLoading || isLoadingUpdates}>
      {isReady ? (
        <div className="mx-auto w-full max-w-6xl">
          {/* Título principal */}
          <Card className="mb-5 w-full">
            <div className="flex items-start gap-4 p-5">
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-700">Título</div>
                <div className="mt-1 text-lg font-semibold">{title}</div>
              </div>
              {/* se quita la pill de prioridad aquí */}
            </div>
          </Card>

          {/* Grid principal 4 columnas en el orden solicitado */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <FieldCard label="Prioridad">
              <PriorityPill value={incident?.priority} />
            </FieldCard>

            <FieldCard label="Estado">
              <StatusPill value={incident?.status} />
            </FieldCard>

            <FieldCard label="Propiedad">{propertyCode}</FieldCard>

            <FieldCard label="Fecha de creación">{dateStr}</FieldCard>

            <div className="md:col-span-4">
              <FieldCard label="Descripción">
                {description && description.trim().length > 0 ? description : '—'}
              </FieldCard>
            </div>
          </div>

          {/* Comentarios dentro de una Card */}
          <Card className="mb-6 w-full">
            <div className="p-4">
              <div className="mb-3 text-xl font-bold">Comentarios</div>
              <div
                ref={commentsWrapRef}
                className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1"
              >
                {displayUpdates.length === 0 ? (
                  <div className="text-gray-500">Aún no hay comentarios.</div>
                ) : (
                  displayUpdates.map((c) => <CommentItem key={String(c.id)} c={c} />)
                )}
              </div>
            </div>
          </Card>

          {/* Form comentario */}
          <Card className="w-full">
            <form className="flex flex-col gap-3 p-4" onSubmit={onSubmit}>
              <Textarea
                ref={taRef as unknown as React.RefObject<HTMLTextAreaElement>}
                value={comment}
                placeholder="Escribe un comentario…"
                rows={1}
                className="resize-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-sky-300 overflow-hidden"
                style={{ overflowY: 'hidden' }}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex justify-end">
                <Button variant="solid" disabled={sending || comment.trim().length === 0} loading={sending}>
                  Publicar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No se pudo cargar la información del reporte.</div>
      )}
    </Loading>
  )
}

export default IncidentDetails
