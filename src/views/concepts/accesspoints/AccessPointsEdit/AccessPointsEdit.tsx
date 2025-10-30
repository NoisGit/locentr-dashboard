// src/views/concepts/accesspoints/AccessPointsEdit/AccessPointsEdit.tsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import useSWR, { mutate as globalMutate } from 'swr'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/shared/Loading'
import Container from '@/components/shared/Container'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import NoUserFound from '@/assets/svg/NoUserFound'

import {
  apiGetAccessPointById,
  apiUpdateAccessPoint,
  type AccessPointRow,
} from '@/services/AccessPointsService'

// Extendemos para tolerar email opcional sin tocar el servicio aún
type AccessPointWithMaybeEmail = AccessPointRow & { email?: string; full_name?: string }

function pickHttpMessage(e: unknown): string | null {
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const r = (e as any).response
    const d = r?.data
    return d?.message || d?.detail || r?.statusText || null
  }
  return null
}

const AccessPointsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useSWR<AccessPointWithMaybeEmail>(
    id ? ['accesspoints:detail', id] : null,
    ([, _id]) => apiGetAccessPointById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      revalidateOnMount: true,
    },
  )

  // único campo editable
  const [name, setName] = useState('')

  // setear nombre cuando llega el dato (prefiere full_name si existe)
  useEffect(() => {
    if (!data) return
    const initial = data.full_name || data.name || ''
    setName(initial)
  }, [data])

  // key para reset visual del form cuando cambia el dato
  const formKey = useMemo(() => {
    if (!data) return 'ap-loading'
    const nm = data.full_name || data.name || ''
    return `ap-${data.id}-${nm}`
  }, [data])

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    if (!name.trim()) {
      toast.push(<Notification type="danger">El nombre no puede estar vacío.</Notification>, {
        placement: 'top-center',
      })
      return
    }

    setSubmitting(true)
    try {
      const updated = await apiUpdateAccessPoint(id, { name: name.trim() })

      // sincroniza caches SWR: detalle + listas
      await globalMutate(['accesspoints:detail', id], updated, false)
      await globalMutate((key: unknown) => {
        return Array.isArray(key) && (key[0] === 'accesspoints:list' || key[0] === 'hardware:list')
      })

      toast.push(<Notification type="success">¡Cambios guardados!</Notification>, {
        placement: 'top-center',
      })

      // volver y avisar a otras vistas
      navigate(-1)
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('accesspoints:changed', {
            detail: { type: 'updated', id: String(id), ts: Date.now() },
          }),
        )
      }, 0)
    } catch (err) {
      const msg = pickHttpMessage(err) || 'No se pudo guardar el dispositivo.'
      toast.push(<Notification type="danger">{msg}</Notification>, { placement: 'top-center' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {!isLoading && (!data || error) && (
        <div className="h-full flex flex-col items-center justify-center">
          <NoUserFound height={240} width={240} />
          <h3 className="mt-6">¡No se encontró el dispositivo!</h3>
        </div>
      )}

      <Loading loading={isLoading}>
        {data && (
          <form key={formKey} onSubmit={handleSubmit}>
            <Card className="mb-6">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-end">
                  <div className="flex items-center gap-3">
                    <Button variant="solid" loading={submitting} disabled={submitting} type="submit">
                      Guardar
                    </Button>
                  </div>
                </div>

                <Container>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Nombre (único editable) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nombre</label>
                      <Input
                        className="rounded-xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre del access point"
                      />
                    </div>

                    {/* Correo (bloqueado) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">Correo</label>
                      <Input
                        className="rounded-xl"
                        value={(data.email ?? '') as string}
                        readOnly
                        disabled
                        placeholder="Sin correo"
                      />
                    </div>

                    {/* Rol (bloqueado) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">Rol</label>
                      <Input
                        className="rounded-xl"
                        value={(data.role ?? '—') as string}
                        readOnly
                        disabled
                      />
                    </div>

                    {/* Comunidad (informativo/bloqueado) */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">Comunidad</label>
                      <Input
                        className="rounded-xl"
                        value={(data.community ?? '—') as string}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </Container>
              </div>
            </Card>
          </form>
        )}
      </Loading>
    </>
  )
}

export default AccessPointsEdit
