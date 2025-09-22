// src/auth/CommunitySelect.tsx
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
  const { communities, selectedId, selectedName, setCommunities, selectCommunity } = useCommunitiesStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>('')
  const fetchedRef = useRef(false)

  // Carga las comunidades del usuario (admin/subadmin)
  useEffect(() => {
    const load = async () => {
      if (fetchedRef.current) return
      fetchedRef.current = true
      setLoading(true)
      setError(null)
      try {
        const list = await apiGetMyCommunities()
        setCommunities(list)

        // Si sólo tiene una: selecciona y redirige de inmediato
        if (list.length === 1) {
          const only = list[0]
          selectCommunity({ id: only.id, name: only.name })
          navigate(DASHBOARDS_PREFIX_PATH, { replace: true })
          return
        }

        // Con varias, no seleccionamos nada por defecto
      } catch {
        setError('No pudimos cargar tus comunidades.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setCommunities, selectCommunity, navigate])

  // Si ya hay una comunidad seleccionada en el store, entra directo
  useEffect(() => {
    if (selectedId !== undefined && selectedId !== null && String(selectedId) !== '') {
      navigate(DASHBOARDS_PREFIX_PATH, { replace: true })
    }
  }, [selectedId, navigate])

  const options = useMemo(
    () => communities.map((c) => ({ id: String(c.id), name: communityLabel(c) })),
    [communities]
  )

  const canContinue = value !== ''

  const handleSubmit = () => {
    const found = options.find((o) => o.id === value)
    if (!found) return
    selectCommunity({ id: found.id, name: found.name })
    navigate(DASHBOARDS_PREFIX_PATH, { replace: true })
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
                  {options.length === 0 && !loading ? (
                    <div className="text-xs text-gray-500 mt-1">No se encontraron comunidades asignadas.</div>
                  ) : null}
                </div>

                <Button variant="solid" className="w-full" onClick={handleSubmit} disabled={!canContinue || loading}>
                  Entrar
                </Button>
              </>
            ) : (
              // Si es 0 (sin comunidades), mensaje simple. Si es 1 ya redirigimos arriba.
              communities.length === 0 && !loading ? (
                <div className="text-sm text-gray-600">No tienes comunidades asignadas todavía.</div>
              ) : null
            )}
          </Loading>
        </div>
      </Card>
    </div>
  )
}

export default CommunitySelect
