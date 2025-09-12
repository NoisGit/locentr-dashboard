import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import {
  apiGetMyCommunities,
  apiListCommunities,
  type Community,
} from '@/services/CommunitiesService'

type Props = {
  className?: string
  onChange?: (community: { id: string | number; name: string }) => void
}

/* ───────── helpers sin any ───────── */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function readTokens(user: unknown): string[] {
  if (!isRecord(user)) return []
  const cands: Array<unknown> = [
    (user as Record<string, unknown>)['roles'],
    (user as Record<string, unknown>)['role'],
    (user as Record<string, unknown>)['authorities'],
    (user as Record<string, unknown>)['authority'],
    (user as Record<string, unknown>)['permissions'],
    (user as Record<string, unknown>)['scopes'],
  ]

  for (const c of cands) {
    if (Array.isArray(c)) {
      return c
        .flatMap((x) => {
          if (typeof x === 'string') return [x]
          if (isRecord(x)) {
            const n = (x['name'] ?? x['code'] ?? x['id']) as unknown
            return typeof n === 'string' || typeof n === 'number' ? [String(n)] : []
          }
          return []
        })
        .map((t) => t.toLowerCase())
    }
    if (typeof c === 'string' || typeof c === 'number') return [String(c).toLowerCase()]
  }
  return []
}

function isSuperAdminUser(user: unknown): boolean {
  // flags directos
  if (isRecord(user)) {
    const direct = (user['isSuperAdmin'] ?? user['superAdmin']) as unknown
    if (direct === true) return true
  }
  // por tokens
  const tokens = readTokens(user)
  if (tokens.length === 0) return false
  const wanted = ['superadmin', 'super-admin', 'super_admin', 'owner', 'root']
  const set = new Set(tokens)
  return wanted.some((w) => set.has(w) || tokens.some((t) => t.includes(w)))
}

function labelOf(c: Community): string {
  return c.name || String(c.id)
}

/* ───────── componente ───────── */

const CommunitySwitcher = ({ className, onChange }: Props) => {
  const { user } = useAuth()
  const superAdmin = isSuperAdminUser(user)

  const {
    communities,
    selectedId,
    selectedName,
    setCommunities,
    selectCommunity,
  } = useCommunitiesStore()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inflightRef = useRef(false) // evita llamadas duplicadas

  async function fetchCommunities() {
    if (inflightRef.current) return
    inflightRef.current = true
    setLoading(true)
    try {
      // 1) ruta principal según rol
      let list: Community[] = []
      try {
        list = superAdmin
          ? await apiListCommunities()
          : await apiGetMyCommunities()
      } catch {
        list = []
      }

      // 2) fallback inteligente si vino vacío
      if (list.length === 0) {
        try {
          const alt = superAdmin ? await apiGetMyCommunities() : await apiListCommunities()
          if (alt.length > 0) list = alt
        } catch { /* ignore */ }
      }

      setCommunities(list)
    } finally {
      setLoading(false)
      inflightRef.current = false
    }
  }

  // Carga inicial (si el store viene vacío)
  useEffect(() => {
    if (communities.length === 0) {
      void fetchCommunities()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [superAdmin])

  // Carga también al abrir si aún no tenemos lista
  useEffect(() => {
    if (open && communities.length === 0 && !loading) {
      void fetchCommunities()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Cerrar con ESC / click afuera
  useEffect(() => {
    if (!open) return
    const onDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onDown)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onDown)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const options = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = communities.map((c) => ({
      id: c.id,
      name: labelOf(c),
      imageUrl: (c as Record<string, unknown>)['imageUrl'] as string | undefined,
    }))
    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base
  }, [communities, search])

  const currentLabel =
    selectedName ||
    (selectedId != null
      ? options.find((o) => String(o.id) === String(selectedId))?.name
      : undefined) ||
    'Seleccionar comunidad'

  const handlePick = (id: string | number) => {
    const found = options.find((o) => String(o.id) === String(id))
    if (!found) return
    selectCommunity({ id: found.id, name: found.name })
    setOpen(false)
    onChange?.({ id: found.id, name: found.name })
  }

  return (
    <div className={className} ref={rootRef}>
      <button
        type="button"
        onClick={() => { setSearch(''); setOpen((v) => !v) }}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={currentLabel}
      >
        <span className="truncate max-w-[22ch]">{currentLabel}</span>
        <svg className={`h-4 w-4 ${open ? 'rotate-180' : ''} transition-transform`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[60] mt-2 w-[24rem] rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 p-2">
          <div className="px-2 pb-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar comunidad..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {loading ? (
            <div className="px-3 py-6 text-center text-sm text-gray-500">Cargando…</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-500">No hay comunidades.</div>
          ) : (
            <ul className="max-h-80 overflow-auto px-1">
              {options.map((opt) => (
                <li key={String(opt.id)} className="p-1">
                  <button
                    type="button"
                    onClick={() => handlePick(opt.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      String(selectedId) === String(opt.id) ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    {opt.imageUrl ? (
                      <img src={opt.imageUrl} alt="" className="h-7 w-7 rounded-md object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-md bg-gray-200 dark:bg-gray-600" />
                    )}
                    <span className="truncate">{opt.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default CommunitySwitcher
