// src/views/concepts/condos/CondosDetails/index.tsx
import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { apiGetCondoById } from '@/services/CondosService'
import ApiService from '@/services/ApiService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { Condo } from '../CondosList/types'

type RoleKey = 'ADMIN' | 'SUB_ADMIN' | 'CONCIERGE' | 'GUARD' | 'RESIDENT'
type RoleRecord = { id: string | number; name: string }

function ModalBase({
  open,
  title,
  onClose,
  children,
  onConfirm,
  confirmText = 'Guardar',
  cancelText = 'Cancelar',
  disabled = false,
}: {
  open: boolean
  title: string
  children?: React.ReactNode
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  disabled?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-3">{title}</h3>
          <div className="mb-6">{children}</div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="plain"
              className="rounded-xl border border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300"
              onClick={onClose}
              disabled={disabled}
            >
              {cancelText}
            </Button>
            <Button
              variant="solid"
              className="rounded-xl"
              onClick={onConfirm ?? onClose}
              disabled={disabled}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

const roleTitle: Record<RoleKey, string> = {
  ADMIN: 'Crear admin',
  SUB_ADMIN: 'Crear sub-admin',
  CONCIERGE: 'Crear conserje',
  GUARD: 'Crear guardia',
  RESIDENT: 'Crear residente',
}

const rolePretty: Record<RoleKey, string> = {
  ADMIN: 'Administrador',
  SUB_ADMIN: 'Sub-Administrador',
  CONCIERGE: 'Conserje',
  GUARD: 'Guardia',
  RESIDENT: 'Residente',
}

function normalizeRoleName(s: string) {
  return s.trim().toUpperCase().replace(/[\s\-]+/g, '_')
}

function matchRoleId(roles: RoleRecord[], key: RoleKey): string | number | undefined {
  const wanted = normalizeRoleName(key)
  const byNormalized = roles.find(r => normalizeRoleName(r.name) === wanted)
  if (byNormalized) return byNormalized.id
  const fallbackMap: Record<RoleKey, Array<string>> = {
    ADMIN: ['ADMIN', 'ADMINISTRADOR'],
    SUB_ADMIN: ['SUB_ADMIN', 'SUBADMIN', 'SUB-ADMIN', 'SUB ADMIN'],
    CONCIERGE: ['CONCIERGE', 'CONSERJE'],
    GUARD: ['GUARD', 'GUARDIA', 'SECURITY'],
    RESIDENT: ['RESIDENT', 'RESIDENTE'],
  }
  const aliases = fallbackMap[key].map(normalizeRoleName)
  const byAlias = roles.find(r => aliases.includes(normalizeRoleName(r.name)))
  return byAlias?.id
}

async function fetchRoles(): Promise<RoleRecord[]> {
  const raw = await ApiService.fetchDataWithAxios<unknown>({
    url: '/api/v1/roles/',
    method: 'get',
  })
  const list =
    (Array.isArray(raw) ? raw :
      (typeof raw === 'object' && raw !== null && Array.isArray((raw as any).items)) ? (raw as any).items :
      (typeof raw === 'object' && raw !== null && Array.isArray((raw as any).data)) ? (raw as any).data :
      (typeof raw === 'object' && raw !== null && Array.isArray((raw as any).results)) ? (raw as any).results :
      []) as Array<{ id?: string | number; name?: string }>
  return list
    .filter(r => r && (r.id ?? r.name))
    .map(r => ({ id: String(r.id ?? r.name!), name: String(r.name ?? r.id!) }))
}

async function createUserWithCommunity(payload: {
  full_name: string
  email: string
  phone: string
  password: string
  role_id?: string | number
  role_name?: string
  community_id?: string | number
}) {
  const data: Record<string, unknown> = {
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
  }
  if (payload.role_id != null) data.role_id = payload.role_id
  if (payload.role_name != null) data.role_name = payload.role_name
  if (payload.community_id != null) data.community_id = payload.community_id
  const resp = await ApiService.fetchDataWithAxios({
    url: '/api/v1/users/',
    method: 'post',
    data,
  })
  return resp
}

const CondosDetails = () => {
  const { id } = useParams()
  const [activeModal, setActiveModal] = useState<RoleKey | null>(null)

  const { selectedId: currentCommunityId, selectedName: currentCommunityName } = useCommunitiesStore()

  const { data, isLoading, error } = useSWR<Condo>(
    id ? ['/api/v1/communities/id', id] : null,
    ([, _id]) => apiGetCondoById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  )

  const isDataReady = !!data && !isEmpty(data) && !error

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)

  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [rolesLoaded, setRolesLoaded] = useState(false)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const r = await fetchRoles()
        if (!ignore) {
          setRoles(r)
          setRolesLoaded(true)
        }
      } catch {
        if (!ignore) setRolesLoaded(true)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormPassword('')
    setFormError(null)
    setFormOk(null)
  }, [activeModal])

  const modalTitle = useMemo(
    () => (activeModal ? roleTitle[activeModal] : ''),
    [activeModal]
  )

  const modalRoleLabel = useMemo(
    () => (activeModal ? rolePretty[activeModal] : ''),
    [activeModal]
  )

  const handleConfirm = async () => {
    if (!activeModal) return
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('Completa nombre, email y contraseña.')
      return
    }
    if (!currentCommunityId && currentCommunityId !== 0) {
      setFormError('Selecciona una comunidad en el header para crear aquí.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    setFormOk(null)
    try {
      const rid = rolesLoaded ? matchRoleId(roles, activeModal) : undefined
      await createUserWithCommunity({
        full_name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: formPassword,
        role_id: rid,
        role_name: rid ? undefined : modalRoleLabel,
        community_id: currentCommunityId as string | number,
      })
      setFormOk('Usuario creado correctamente.')
      setTimeout(() => setActiveModal(null), 700)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        'No se pudo crear el usuario.'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Loading loading={isLoading}>
      {isDataReady ? (
        <>
          <Card className="w-full">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {data?.img ? (
                  <img
                    src={data.img}
                    alt={data.name ?? 'Comunidad'}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : null}
                <div>
                  <h3 className="text-xl font-semibold">
                    {data?.name ?? 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {data?.type ?? 'Tipo no definido'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Dirección
                  </div>
                  <div className="text-base">
                    {data?.address && data.address.trim() !== '' ? data.address : '—'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700" />

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="solid" className="rounded-xl" onClick={() => setActiveModal('ADMIN')}>
                  Crear Admin
                </Button>
                <Button variant="solid" className="rounded-xl" onClick={() => setActiveModal('SUB_ADMIN')}>
                  Crear Sub-Admin
                </Button>
                <Button variant="solid" className="rounded-xl" onClick={() => setActiveModal('CONCIERGE')}>
                  Crear Conserje
                </Button>
                <Button variant="solid" className="rounded-xl" onClick={() => setActiveModal('GUARD')}>
                  Crear Guardia
                </Button>
                <Button variant="solid" className="rounded-xl" onClick={() => setActiveModal('RESIDENT')}>
                  Crear Residente
                </Button>
              </div>
            </div>
          </Card>

          <ModalBase
            open={activeModal !== null}
            title={modalTitle}
            onClose={() => setActiveModal(null)}
            onConfirm={handleConfirm}
            confirmText="Crear"
            disabled={submitting}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm"
                    value={modalRoleLabel}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comunidad destino</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm"
                    value={currentCommunityName ?? ''}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre completo</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Correo</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>
              </div>

              {formError ? <div className="text-sm text-red-600">{formError}</div> : null}
              {formOk ? <div className="text-sm text-green-600">{formOk}</div> : null}
            </div>
          </ModalBase>
        </>
      ) : (
        <div className="text-center text-gray-500 p-4">
          No se pudo cargar la información de la comunidad.
        </div>
      )}
    </Loading>
  )
}

export default CondosDetails
