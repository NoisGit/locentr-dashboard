// src/views/concepts/incidents/IncidentDetails/index.tsx
import { useMemo, useState, FormEvent } from 'react'
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
  apiGetIncidentUpdates,
  type IncidentRow,
  type IncidentUpdateRow,
} from '@/services/IncidentsService'

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

const FieldCard = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <Card className="w-full">
    <div className="p-4">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-base leading-relaxed">{children}</div>
    </div>
  </Card>
)

/* Pills con clases fijas (evita tw purge dinámico) */
const StatusPill = ({ value }: { value?: IncidentRow['status'] }) => {
  const { bg, text, label } = useMemo(() => {
    const v = (value ?? '').toUpperCase()
    if (v === 'PENDING' || v === 'OPEN') {
      return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' }
    }
    if (v === 'IN_PROGRESS') {
      return { bg: 'bg-sky-100', text: 'text-sky-700', label: 'En proceso' }
    }
    if (v === 'RESOLVED' || v === 'CLOSED') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resuelto' }
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: value ?? '—' }
  }, [value])

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  )
}

const PriorityPill = ({ value }: { value?: IncidentRow['priority'] }) => {
  const { bg, text, label } = useMemo(() => {
    const v = (value ?? '').toUpperCase()
    if (v === 'HIGH' || v === 'ALTA' || v === 'ALTO') {
      return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Alta' }
    }
    if (v === 'LOW' || v === 'BAJA' || v === 'BAJO') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Baja' }
    }
    return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Media' }
  }, [value])

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  )
}

/* ---------------- Comentarios ---------------- */
const CommentItem = ({ c }: { c: IncidentUpdateRow }) => (
  <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
    <div className="mb-1 text-sm text-gray-500">
      {(c.author_name ?? 'Portería SpA')} • {formatDate(c.created_at)}
    </div>
    <div className="text-[15px] leading-6">{c.text}</div>
  </div>
)

/* POST de comentario (se usa ApiService directo) */
async function apiCreateIncidentUpdate(incidentId: string | number, payload: { text: string }) {
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/incidents/${encodeURIComponent(String(incidentId))}/updates`,
    method: 'post',
    data: payload,
  })
}

/* Helper seguro para leer descripción si viniera en el objeto */
const getDescription = (row?: IncidentRow | null): string => {
  if (!row) return ''
  const maybe: unknown = row as unknown
  if (typeof maybe === 'object' && maybe !== null && 'description' in maybe) {
    const v = (maybe as { description?: unknown }).description
    return typeof v === 'string' ? v : ''
  }
  return ''
}

/* ---------------- Component ---------------- */
const IncidentDetails = () => {
  // tu ruta es: /concepts/incidents/:incidentId
  const { id, incidentId } = useParams() as { id?: string; incidentId?: string }
  const effectiveId = incidentId ?? id

  // Datos del incidente (como no existe GET /incidents/{id}, buscamos en comunidades)
  const {
    data: incident,
    isLoading,
    error,
  } = useSWR<IncidentRow | null>(
    effectiveId ? ['/api/v1/incidents/find-by-id', effectiveId] : null,
    ([, _id]) => apiFindIncidentByIdAcrossCommunities(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    },
  )

  // Actualizaciones / comentarios
  const {
    data: updates,
    isLoading: isLoadingUpdates,
    mutate: mutateUpdates,
  } = useSWR<IncidentUpdateRow[]>(
    effectiveId ? ['/api/v1/incidents/updates', effectiveId] : null,
    ([, _id]) => apiGetIncidentUpdates(String(_id)).then((res) => res.list),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    },
  )

  const isReady = !!incident && !isEmpty(incident) && !error

  const title = incident?.title ?? 'Detalle del Reporte'
  const propertyCode = incident?.property_code !== undefined ? String(incident.property_code) : '—'
  const dateStr = formatDate(incident?.created_at)
  const description = getDescription(incident)

  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!effectiveId || !comment.trim()) return
    try {
      setSending(true)
      await apiCreateIncidentUpdate(effectiveId, { text: comment.trim() })
      setComment('')
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
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">Detalle del Reporte</h2>
          </div>

          {/* Encabezado con comunidad / título y prioridad visible */}
          <Card className="mb-6 w-full">
            <div className="flex items-start gap-4 p-6">
              <div className="flex-1">
                <div className="text-sm text-gray-500">{incident?.community_name ?? 'Porteria Residencial'}</div>
                <div className="mt-1 text-lg font-semibold">{title}</div>
              </div>
              <PriorityPill value={incident?.priority} />
            </div>
          </Card>

          {/* Grid principal como el mock, con ESTADO incluido */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldCard label="Prioridad">
              <PriorityPill value={incident?.priority} />
            </FieldCard>

            <FieldCard label="Estado">
              <StatusPill value={incident?.status} />
            </FieldCard>

            <FieldCard label="Fecha">{dateStr}</FieldCard>

            <FieldCard label="Título">{title}</FieldCard>

            <FieldCard label="Propiedad">{propertyCode}</FieldCard>

            <div className="md:col-span-2">
              <FieldCard label="Descripción">
                {description && description.trim().length > 0 ? description : '—'}
              </FieldCard>
            </div>
          </div>

          {/* Comentarios */}
          <div className="mb-3 text-lg font-semibold">Comentarios</div>
          <div className="mb-6 flex flex-col gap-4">
            {(updates ?? []).length === 0 ? (
              <div className="text-gray-500">Aún no hay comentarios.</div>
            ) : (
              (updates ?? []).map((c) => <CommentItem key={String(c.id)} c={c} />)
            )}
          </div>

          {/* Form para agregar comentario */}
          <Card className="w-full">
            <form className="flex flex-col gap-3 p-4" onSubmit={onSubmit}>
              <Textarea
                value={comment}
                placeholder="Escribe un comentario…"
                rows={3}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button disabled={sending || comment.trim().length === 0} loading={sending} variant="solid">
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
