// src/views/concepts/collaborators/CollaboratorsEdit/CollaboratorsEdit.tsx
import { useLayoutEffect, useState, useMemo } from 'react'
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
  apiGetCollaboratorById,
  apiUpdateCollaborator,
  type CollaboratorRow,
} from '@/services/CollaboratorsService'

function pickHttpMessage(e: unknown): string | null {
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const r = (e as any).response
    const d = r?.data
    return d?.message || d?.detail || r?.statusText || null
  }
  return null
}

const CollaboratorsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useSWR<CollaboratorRow>(
    id ? ['/api/users/id', id] : null,
    ([, _id]) => apiGetCollaboratorById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      revalidateOnMount: true,
    },
  )

  // Campos editables
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // Solo lectura
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('')

  useLayoutEffect(() => {
    if (!data) return
    setName(data.name ?? '')
    setPhone(data.phone ?? '')
    setEmail(data.email ?? '')
    setRole(data.role ?? '')
  }, [data])

  const formKey = useMemo(() => {
    if (!data) return 'collab-loading'
    return `collab-${data.id}-${data.email ?? ''}-${data.name ?? ''}`
  }, [data])

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    if (!name.trim()) {
      toast.push(<Notification type="danger">El nombre no puede estar vacío.</Notification>, { placement: 'top-center' })
      return
    }

    setSubmitting(true)
    try {
      const updated = await apiUpdateCollaborator(id, {
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim() ? password.trim() : undefined,
      })

      // Sincroniza caches SWR
      await globalMutate(['/api/users/id', id], updated, false)
      await globalMutate((key: unknown) => Array.isArray(key) && key[0] === 'collaborators:list')

      toast.push(<Notification type="success">¡Cambios guardados!</Notification>, { placement: 'top-center' })

      // Volvemos a la lista y, ya montada, disparamos el evento para que haga re-fetch inmediato
      navigate(-1)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('collaborators:changed', {
          detail: { type: 'updated', id: String(id), ts: Date.now() },
        }))
      }, 0)
    } catch (err) {
      const msg = pickHttpMessage(err) || 'No se pudo guardar el colaborador.'
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
          <h3 className="mt-6">¡No se encontró el colaborador!</h3>
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
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nombre</label>
                      <Input
                        className="rounded-xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Teléfono</label>
                      <Input
                        className="rounded-xl"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+56 9 ..."
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Contraseña (opcional)</label>
                      <Input
                        type="password"
                        className="rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Dejar en blanco para no cambiar"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Correo</label>
                      <Input className="rounded-xl" value={email} disabled readOnly />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Rol</label>
                      <Input className="rounded-xl" value={role || '—'} disabled readOnly />
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

export default CollaboratorsEdit
