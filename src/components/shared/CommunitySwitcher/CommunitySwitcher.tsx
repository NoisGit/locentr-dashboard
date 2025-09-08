import { useEffect, useMemo, useState } from 'react'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetMyCommunities, type Community } from '@/services/CommunitiesService'

type Props = {
  className?: string
  scope?: 'all' | 'mine' // hoy no cambia nada, por ahora usamos el mismo endpoint
  onChange?: (community: { id: string | number; name: string }) => void
}

type UnknownObj = Record<string, unknown>
type SomeId = string | number

function pick(obj: UnknownObj, keys: readonly string[]): unknown {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k]
  }
  return undefined
}

function pickId(o: UnknownObj): SomeId | '' {
  const v = pick(o, ['id', 'uuid', 'communityId']) as unknown
  if (typeof v === 'string' || typeof v === 'number') return v
  return ''
}

function communityLabel(c: Community): string {
  const o = c as unknown as UnknownObj
  const n =
    (pick(o, ['name', 'title', 'displayName', 'communityName']) as unknown) ?? ''
  if (typeof n === 'string' && n.trim()) return n
  const id = pickId(o)
  return id !== '' ? String(id) : ''
}

const CommunitySwitcher = ({ className, scope = 'mine', onChange }: Props) => {
  const {
    communities,
    selectedId,
    selectedName,
    setCommunities,
    selectCommunity,
  } = useCommunitiesStore()

  const [loading, setLoading] = useState(false)

  // Cargar lista si viene vacía
  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (communities.length > 0) return
      setLoading(true)
      try {
        // hoy da igual 'scope'; luego, cuando tengas endpoint global, cambiamos aquí
        const list = await apiGetMyCommunities()
        if (!ignore) setCommunities(list)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [communities.length, setCommunities, scope])

  const options = useMemo(
    () =>
      communities.map((c) => {
        const rc = c as unknown as UnknownObj
        return {
          id: pickId(rc),
          name: communityLabel(c),
        }
      }),
    [communities]
  )

  const handleChange = (idStr: string) => {
    const found = options.find((o) => String(o.id) === idStr)
    if (!found) return
    selectCommunity({ id: found.id, name: found.name ?? selectedName ?? '' })
    onChange?.({ id: found.id, name: found.name ?? '' })
  }

  return (
    <div className={className}>
      <select
        className="border rounded-md px-2 py-1 text-sm"
        disabled={loading || options.length === 0}
        value={selectedId ? String(selectedId) : ''}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Seleccionar comunidad"
        title={selectedName || 'Seleccionar comunidad'}
      >
        <option value="">{selectedName || 'Seleccionar comunidad'}</option>
        {options.map((opt) => (
          <option key={String(opt.id)} value={String(opt.id)}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CommunitySwitcher
