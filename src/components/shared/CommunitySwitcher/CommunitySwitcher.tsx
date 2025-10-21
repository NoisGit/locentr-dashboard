// CommunitySwitcher.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetMyCommunities, apiListCommunities, type Community } from '@/services/CommunitiesService'

type Props = { className?: string; onChange?: (community: { id: string | number; name: string }) => void }

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null }
function tokensFrom(user: unknown): string[] {
  if (!isRecord(user)) return []
  const cands: unknown[] = [(user as any)['roles'], (user as any)['role'], (user as any)['authorities'], (user as any)['authority'], (user as any)['permissions'], (user as any)['scopes']]
  const out: string[] = []
  for (const c of cands) {
    if (typeof c === 'string' || typeof c === 'number') out.push(String(c))
    else if (Array.isArray(c)) {
      for (const x of c) {
        if (typeof x === 'string' || typeof x === 'number') out.push(String(x))
        else if (isRecord(x)) {
          const n = (x['name'] ?? x['code'] ?? x['id'] ?? x['authority']) as unknown
          if (typeof n === 'string' || typeof n === 'number') out.push(String(n))
        }
      }
    } else if (isRecord(c)) {
      const n = (c['name'] ?? c['code'] ?? c['id'] ?? c['authority']) as unknown
      if (typeof n === 'string' || typeof n === 'number') out.push(String(n))
    }
  }
  return out.map((s) => s.toLowerCase())
}
function isSuperAdminUser(user: unknown): boolean {
  if (isRecord(user)) {
    const direct = (user as any)['isSuperAdmin'] ?? (user as any)['superAdmin']
    if (direct === true) return true
  }
  const toks = tokensFrom(user)
  if (!toks.length) return false
  const re = /(super)[\s_\-]*admin/i
  if (toks.some((t) => re.test(t))) return true
  if (toks.some((t) => t.includes('owner') || t.includes('root'))) return true
  return false
}
function labelOf(c: Community): string {
  const r = c as unknown as { name?: string; full_name?: string; title?: string; community_name?: string; label?: string }
  return r.name || r.full_name || r.title || r.community_name || r.label || String(c.id)
}
function uniqById(list: Community[]): Community[] {
  const seen = new Set<string>()
  const out: Community[] = []
  for (const c of list) { const k = String(c.id); if (!seen.has(k)) { seen.add(k); out.push(c) } }
  return out
}

const CommunitySwitcher = ({ className, onChange }: Props) => {
  const { user } = useAuth()
  const superAdmin = isSuperAdminUser(user)
  const userId = (isRecord(user) && ((user as any)['id'] ?? (user as any)['user_id'] ?? (user as any)['_id'] ?? (user as any)['uid'])) || ''
  const { pathname } = useLocation()
  const onAuth = pathname.startsWith('/auth/')

  const { communities, selectedId, selectedName, setCommunities, selectCommunity } = useCommunitiesStore()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)

  const inflightRef = useRef(false)
  const primedRef = useRef<string>('')

  async function fetchCommunities(mode: 'lazy' | 'eager') {
    if (inflightRef.current) return
    inflightRef.current = true
    setLoading(true)
    setError(null)
    try {
      let list: Community[] = []
      if (superAdmin) list = await apiListCommunities<Community[]>({ pageIndex: 1, pageSize: 200 })
      else list = await apiGetMyCommunities<Community[]>()
      list = uniqById(list)
      setCommunities(list, superAdmin ? 'all' : 'mine', { autoSelectIfSingle: mode === 'eager' })
    } catch { setError('No se pudo cargar comunidades') }
    finally { setLoading(false); inflightRef.current = false }
  }

  useEffect(() => {
    if (!userId || onAuth) return
    const key = `${String(userId)}|${superAdmin ? 'all' : 'mine'}`
    if (primedRef.current === key) return
    primedRef.current = key
    if (!superAdmin && communities.length === 0) void fetchCommunities('eager')
  }, [userId, superAdmin, onAuth, communities.length])

  useEffect(() => {
    if (!open) return
    const onDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onClick = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onDown)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onDown); document.removeEventListener('mousedown', onClick) }
  }, [open])

  useEffect(() => {
    if (superAdmin && open && communities.length === 0 && !loading) void fetchCommunities('lazy')
  }, [superAdmin, open, communities.length, loading])

  const options = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = communities.map((c) => ({ id: c.id, name: labelOf(c), imageUrl: (c as Record<string, unknown>)['imageUrl'] as string | undefined }))
    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base
  }, [communities, search])

  const currentLabel =
    selectedName ||
    (selectedId != null ? options.find((o) => String(o.id) === String(selectedId))?.name : undefined) ||
    'Seleccionar comunidad'

  const handlePick = (id: string | number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const found = options.find((o) => String(o.id) === String(id))
    if (!found) return
    selectCommunity({ id: found.id, name: found.name })
    setOpen(false)
    setSearch('')
    onChange?.({ id: found.id, name: found.name })
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSearch('')
    setOpen((v) => !v)
  }

  return (
    <div className={className} ref={rootRef}>
      <button
        type="button"
        onClick={handleToggle}
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar comunidad..." className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {loading ? (
            <div className="px-3 py-6 text-center text-sm text-gray-500">Cargando…</div>
          ) : error ? (
            <div className="px-3 py-6 text-center text-sm text-red-500">{error}</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-500">No hay comunidades.</div>
          ) : (
            <ul className="max-h-80 overflow-auto px-1">
              {options.map((opt) => (
                <li key={String(opt.id)} className="p-1">
                  <button
                    type="button"
                    onClick={(e) => handlePick(opt.id, e)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${String(selectedId) === String(opt.id) ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                  >
                    {opt.imageUrl ? <img src={opt.imageUrl} alt="" className="h-7 w-7 rounded-md object-cover" /> : <div className="h-7 w-7 rounded-md bg-gray-200 dark:bg-gray-600" />}
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
