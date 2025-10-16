import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetMyCommunities, type Community } from '@/services/CommunitiesService'
import { useAuth } from '@/auth'
import appConfig from '@/configs/app.config'

const { authenticatedEntryPath } = appConfig

function communityLabel(c: Community): string {
  return (c.name ?? String(c.id)) as string
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function tokensFrom(user: unknown): string[] {
  if (!isRecord(user)) return []
  const cands: unknown[] = [
    (user as Record<string, unknown>)['roles'],
    (user as Record<string, unknown>)['role'],
    (user as Record<string, unknown>)['authorities'],
    (user as Record<string, unknown>)['authority'],
    (user as Record<string, unknown>)['permissions'],
    (user as Record<string, unknown>)['scopes'],
  ]
  const out: string[] = []
  for (const c of cands) {
    if (typeof c === 'string' || typeof c === 'number') out.push(String(c))
    else if (Array.isArray(c)) {
      for (const x of c) {
        if (typeof x === 'string' || typeof x === 'number') out.push(String(x))
        else if (isRecord(x)) {
          const n =
            (x['name'] as unknown) ??
            (x['code'] as unknown) ??
            (x['id'] as unknown) ??
            (x['authority'] as unknown)
          if (typeof n === 'string' || typeof n === 'number') out.push(String(n))
        }
      }
    } else if (isRecord(c)) {
      const n =
        (c['name'] as unknown) ??
        (c['code'] as unknown) ??
        (c['id'] as unknown) ??
        (c['authority'] as unknown)
      if (typeof n === 'string' || typeof n === 'number') out.push(String(n))
    }
  }
  return out.map((s) => s.toLowerCase())
}
function isSuperAdmin(user: unknown): boolean {
  if (isRecord(user)) {
    const direct = (user['isSuperAdmin'] ?? user['superAdmin']) as unknown
    if (direct === true) return true
  }
  const toks = tokensFrom(user)
  if (!toks.length) return false
  const re = /(super)[\s_\-]*admin/i
  if (toks.some((t) => re.test(t))) return true
  if (toks.some((t) => t.includes('owner') || t.includes('root'))) return true
  return false
}

const STORAGE_KEY = 'current_community'

const CommunitySelect = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const superAdmin = isSuperAdmin(user)

  const {
    communities,
    selectedId,
    selectedName,
    setCommunities,
    selectCommunity,
  } = useCommunitiesStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>('')
  const fetchedRef = useRef(false)

  // Evita navegaciones múltiples
  const navigatedRef = useRef(false)

  // SUPERADMIN: setear selección virtual (en español) y navegar una sola vez
  useEffect(() => {
    if (!superAdmin || navigatedRef.current) return
    const missing = selectedId == null || String(selectedId) === ''
    if (missing) {
      const virtual = { id: '__SUPER__', name: 'Comunidades' }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(virtual)) } catch {}
      selectCommunity(virtual)
    }
    navigatedRef.current = true
    requestAnimationFrame(() => {
      navigate(authenticatedEntryPath, { replace: true })
    })
  }, [superAdmin, selectedId, selectCommunity, navigate])

  // Si es superadmin, no renderizar el selector
  if (superAdmin) {
    return null
  }

  useEffect(() => {
    const load = async () => {
      if (fetchedRef.current) return
      fetchedRef.current = true
      setLoading(true)
      setError(null)
      try {
        const list = await apiGetMyCommunities()
        setCommunities(list, 'mine', { autoSelectIfSingle: false })

        if (list.length === 0) {
          return
        }

        if (list.length === 1) {
          const only = list[0]
          selectCommunity({ id: only.id, name: only.name })
          if (!navigatedRef.current) {
            navigatedRef.current = true
            requestAnimationFrame(() => {
              navigate(authenticatedEntryPath, { replace: true })
            })
          }
          return
        }
      } catch {
        setError('No pudimos cargar tus comunidades.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCommunities, selectCommunity, navigate])

  useEffect(() => {
    if (selectedId != null && String(selectedId) !== '' && !navigatedRef.current) {
      navigatedRef.current = true
      requestAnimationFrame(() => {
        navigate(authenticatedEntryPath, { replace: true })
      })
    }
  }, [selectedId, navigate])

  const options = useMemo(
    () => communities.map((c) => ({ id: String(c.id), name: communityLabel(c) })),
    [communities],
  )

  const canContinue = value !== ''

  const handleSubmit = () => {
    const found = options.find((o) => o.id === value)
    if (!found) return
    selectCommunity({ id: found.id, name: found.name })
    if (!navigatedRef.current) {
      navigatedRef.current = true
      requestAnimationFrame(() => {
        navigate(authenticatedEntryPath, { replace: true })
      })
    }
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-[420px]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Selecciona tu comunidad</h2>
          <p className="text-sm text-gray-500 mb-6">
            {selectedName ? `Usando: ${selectedName}` : 'Selecciona la comunidad con la que deseas trabajar.'}
          </p>

          <Loading loading={loading}>
            {error ? <div className="text-red-600 text-sm mb-4">{error}</div> : null}

            {communities.length >= 2 ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Comunidad</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={loading || options.length === 0}
                  >
                    <option value="">Seleccione una comunidad…</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="solid" className="w-full" onClick={handleSubmit} disabled={!canContinue || loading}>
                  Entrar
                </Button>
              </>
            ) : communities.length === 0 && !loading ? (
              <div className="text-sm text-gray-600">No tienes comunidades asignadas todavía.</div>
            ) : null}
          </Loading>
        </div>
      </Card>
    </div>
  )
}

export default CommunitySelect
