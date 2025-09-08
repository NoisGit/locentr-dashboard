import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetMyCommunities, type Community } from '@/services/CommunitiesService'

function communityLabel(c: Community): string {
  return (c.name ?? String(c.id)) as string
}

const CommunitySelect = () => {
  const navigate = useNavigate()
  const { communities, setCommunities, selectCommunity } = useCommunitiesStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>('')
  const fetchedRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      if (fetchedRef.current) return
      fetchedRef.current = true
      setLoading(true)
      setError(null)
      try {
        const list = await apiGetMyCommunities()
        setCommunities(list)
        if (list.length === 1) setValue(String(list[0].id))
      } catch {
        setError('No pudimos cargar tus comunidades.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setCommunities])

  const options = useMemo(
    () => communities.map((c) => ({ id: String(c.id), name: communityLabel(c) })),
    [communities]
  )

  const canContinue = value !== ''

  const handleSubmit = () => {
    const found = options.find((o) => o.id === value)
    if (!found) return
    selectCommunity({ id: found.id, name: found.name })
    navigate(DASHBOARDS_PREFIX_PATH)
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-[420px]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Escoja su comunidad</h2>
          <p className="text-sm text-gray-500 mb-6">Selecciona la comunidad con la que deseas trabajar.</p>

          <Loading loading={loading}>
            {error ? <div className="text-red-600 text-sm mb-4">{error}</div> : null}

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
              {options.length === 0 && !loading ? (
                <div className="text-xs text-gray-500 mt-1">No se encontraron comunidades asignadas.</div>
              ) : null}
            </div>

            <Button variant="solid" className="w-full" onClick={handleSubmit} disabled={!canContinue || loading}>
              Entrar
            </Button>
          </Loading>
        </div>
      </Card>
    </div>
  )
}

export default CommunitySelect
