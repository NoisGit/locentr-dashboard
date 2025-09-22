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
import PropertiesForm, { type PropertiesFormSchema } from '@/views/concepts/properties/PropertiesForm/PropertiesForm'
import { apiCreateProperty } from '@/services/PropertiesService'
import { apiGetPropertiesList, type PropertyRow } from '@/services/PropertiesService'
import Select from '@/components/ui/Select'
import type { Condo } from '../CondosList/types'

/* ------------------------------------------------------------------ */
/* Utils & types                                                       */
/* ------------------------------------------------------------------ */
type RoleKey = 'ADMIN' | 'SUB_ADMIN' | 'CONCIERGE' | 'GUARD' | 'RESIDENT'
type RoleRecord = { id: string | number; name: string }
type SelectOption = { label: string; value: number }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/* ------------------------------------------------------------------ */
/* UI                                                                 */
/* ------------------------------------------------------------------ */
function ModalBase(props: {
  open: boolean
  title: string
  children?: React.ReactNode
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  disabled?: boolean
}) {
  const { open, title, children, onClose, onConfirm, confirmText = 'Guardar', cancelText = 'Cancelar', disabled = false } = props
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

/* ------------------------------------------------------------------ */
/* Roles                                                              */
/* ------------------------------------------------------------------ */
function normalizeRoleName(s: string) {
  return s.trim().toUpperCase().replace(/[\s\-]+/g, '_')
}
function matchRoleId(roles: RoleRecord[], key: RoleKey): string | number | undefined {
  const wanted = normalizeRoleName(key)
  const byNormalized = roles.find((r) => normalizeRoleName(r.name) === wanted)
  if (byNormalized) return byNormalized.id
  const fallbackMap: Record<RoleKey, Array<string>> = {
    ADMIN: ['ADMIN', 'ADMINISTRADOR'],
    SUB_ADMIN: ['SUB_ADMIN', 'SUBADMIN', 'SUB-ADMIN', 'SUB ADMIN'],
    CONCIERGE: ['CONCIERGE', 'CONSERJE'],
    GUARD: ['GUARD', 'GUARDIA', 'SECURITY'],
    RESIDENT: ['RESIDENT', 'RESIDENTE'],
  }
  const aliases = fallbackMap[key].map(normalizeRoleName)
  const byAlias = roles.find((r) => aliases.includes(normalizeRoleName(r.name)))
  return byAlias?.id
}
async function fetchRoles(): Promise<RoleRecord[]> {
  const raw = await ApiService.fetchDataWithAxios<unknown>({ url: '/api/v1/roles/', method: 'get' })
  const list =
    (Array.isArray(raw) && raw) ||
    (isRecord(raw) && Array.isArray(raw.items) && (raw.items as unknown[])) ||
    (isRecord(raw) && Array.isArray(raw.data) && (raw.data as unknown[])) ||
    (isRecord(raw) && Array.isArray(raw.results) && (raw.results as unknown[])) ||
    []

  return (list as Array<{ id?: string | number; name?: string }>)
    .filter((r) => r && (r.id ?? r.name))
    .map((r) => ({ id: String(r.id ?? r.name!), name: String(r.name ?? r.id!) }))
}

/* ------------------------------------------------------------------ */
/* Endpoints NUEVOS                                                   */
/* ------------------------------------------------------------------ */
type CommonUserFields = {
  full_name: string
  id_number: string
  email: string
  phone: string
  password: string
}
type CreateUserAssignPayload = CommonUserFields & {
  role_id: number | string
  community_id: number
}
type CreateResidentAssignPayload = Omit<CommonUserFields, 'phone'> & {
  // phone sigue existiendo en el formulario pero es opcional, lo incluimos abajo sólo si viene
  role_id: number | string // será 5
  property_id: number
  is_owner: boolean
  home_role: string
  start_date: string // ISO requerido por backend
  phone?: string
}

const RESIDENT_ROLE_ID = 5

function createUserAndAssign(payload: CreateUserAssignPayload) {
  return ApiService.fetchDataWithAxios<unknown, CreateUserAssignPayload>({
    url: '/api/v1/users/create_user_and_assign',
    method: 'post',
    data: payload,
  })
}
function createResidentAndAssign(payload: CreateResidentAssignPayload) {
  return ApiService.fetchDataWithAxios<unknown, CreateResidentAssignPayload>({
    url: '/api/v1/users/create_resident_and_assign',
    method: 'post',
    data: payload,
  })
}

/* Selector en duro para home_role */
const HOME_ROLE_OPTIONS: string[] = [
  'Papá',
  'Mamá',
  'Hijo',
  'Hija',
  'Abuela',
  'Abuelo',
  'Adulto Responsable',
  'Adulta Responsable',
]

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const CondosDetails = () => {
  const { id } = useParams()
  const [activeModal, setActiveModal] = useState<RoleKey | null>(null)
  const [propertyModalOpen, setPropertyModalOpen] = useState(false)
  const { selectedId: currentCommunityId } = useCommunitiesStore()

  const { data, isLoading, error } = useSWR<Condo>(
    id ? ['/api/v1/communities/id', id] : null,
    ([, _id]) => apiGetCondoById(String(_id)),
    { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false },
  )

  const isDataReady = !!data && !isEmpty(data) && !error

  // form modal usuario (comunes)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formIdNumber, setFormIdNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)

  // Solo residente
  const [isOwner, setIsOwner] = useState<boolean>(true)
  const [homeRole, setHomeRole] = useState<string>('')

  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [rolesLoaded, setRolesLoaded] = useState(false)

  const communityIdNum = Number(id ?? currentCommunityId ?? 0)

  // propiedades (para residente)
  const { data: propsData, isLoading: loadingProps } = useSWR<{ list: PropertyRow[]; total: number }>(
    communityIdNum ? ['props:byCommunity', communityIdNum] : null,
    () =>
      apiGetPropertiesList<{ list: PropertyRow[]; total: number }>({
        pageIndex: 1,
        pageSize: 1000,
        communityId: communityIdNum,
      }),
    { revalidateOnFocus: false },
  )
  const propertyOptions: SelectOption[] = useMemo(
    () =>
      (propsData?.list ?? []).map((p) => {
        const lblNum = (p as PropertyRow).propertyNumber ?? p.id
        const lblFloor = p.floor != null ? ` · Piso ${p.floor}` : ''
        return { label: `Prop. ${lblNum}${lblFloor}`, value: Number(p.id) }
      }),
    [propsData],
  )
  const [residentPropertyId, setResidentPropertyId] = useState<number | null>(null)
  useEffect(() => {
    if (propertyOptions.length === 1 && residentPropertyId == null) {
      setResidentPropertyId(propertyOptions[0].value)
    }
  }, [propertyOptions, residentPropertyId])

  // roles
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
    return () => {
      ignore = true
    }
  }, [])

  // reset modal on open/close
  useEffect(() => {
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormPassword('')
    setFormIdNumber('')
    setFormError(null)
    setFormOk(null)
    setResidentPropertyId(null)
    setIsOwner(true)
    setHomeRole('')
  }, [activeModal])

  const modalTitle = useMemo(() => (activeModal ? roleTitle[activeModal] : ''), [activeModal])

  /* Confirmar creación con payloads nuevos */
  const handleConfirm = async () => {
    if (!activeModal) return

    // Reglas comunes: RUT, Nombre completo, Correo, Contraseña son obligatorios; Teléfono opcional
    if (!formIdNumber.trim() || !formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('Completa RUT, nombre completo, correo y contraseña. El teléfono es opcional.')
      return
    }
    if (!communityIdNum) {
      setFormError('Selecciona una comunidad en el header para crear aquí.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    setFormOk(null)

    try {
      if (activeModal === 'RESIDENT') {
        if (!residentPropertyId) {
          setSubmitting(false)
          setFormError('Selecciona la propiedad del residente.')
          return
        }
        if (!homeRole) {
          setSubmitting(false)
          setFormError('Selecciona el rol en el hogar.')
          return
        }

        const payload: CreateResidentAssignPayload = {
          full_name: formName.trim(),
          id_number: formIdNumber.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role_id: RESIDENT_ROLE_ID,
          property_id: residentPropertyId,
          is_owner: isOwner,
          home_role: homeRole,
          start_date: new Date().toISOString(), // backend aún lo exige
          ...(formPhone.trim() ? { phone: formPhone.trim() } : {}),
        }
        await createResidentAndAssign(payload)
      } else {
        // otros usuarios: role_id obligatorio (resuelto vía catálogo de roles)
        const rid = rolesLoaded ? matchRoleId(roles, activeModal) : undefined
        if (rid == null) {
          setSubmitting(false)
          setFormError('No se pudo determinar el role_id para este tipo de usuario.')
          return
        }
        const payload: CreateUserAssignPayload = {
          full_name: formName.trim(),
          id_number: formIdNumber.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(), // opcional pero el backend acepta string vacío
          password: formPassword,
          role_id: typeof rid === 'string' ? Number(rid) || rid : rid,
          community_id: communityIdNum,
        }
        await createUserAndAssign(payload)
      }

      setFormOk('Creación realizada correctamente.')
      setTimeout(() => setActiveModal(null), 700)
    } catch (e) {
      let msg = 'No se pudo completar la operación.'
      if (isRecord(e)) {
        const r = e as { response?: { data?: { message?: string; detail?: string } } }
        msg = r.response?.data?.message ?? r.response?.data?.detail ?? msg
      }
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  /* Crear Propiedad (se mantiene igual) */
  const [propSubmitting, setPropSubmitting] = useState(false)
  const [propMsg, setPropMsg] = useState<string | null>(null)
  const [propErr, setPropErr] = useState<string | null>(null)

  const handleCreateProperty = async (values: PropertiesFormSchema) => {
    setPropSubmitting(true)
    setPropMsg(null)
    setPropErr(null)
    try {
      const cid = Number(id ?? 0) || Number(values.community_id ?? 0) || Number(currentCommunityId ?? 0) || 0
      await apiCreateProperty({
        community_id: cid,
        property_number: values.property_number,
        floor: values.floor,
      })
      setPropMsg('Propiedad creada correctamente.')
      setTimeout(() => setPropertyModalOpen(false), 700)
    } catch (e) {
      let msg = 'No se pudo crear la propiedad.'
      if (isRecord(e)) {
        const r = e as { response?: { data?: { message?: string; detail?: string } } }
        msg = r.response?.data?.message ?? r.response?.data?.detail ?? msg
      }
      setPropErr(msg)
    } finally {
      setPropSubmitting(false)
    }
  }

  // Helpers de UI para orden y campos visibles
  const isResident = activeModal === 'RESIDENT'

  return (
    <Loading loading={isLoading}>
      {isDataReady ? (
        <>
          <Card className="w-full">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {data?.img ? (
                  <img src={data.img} alt={data.name ?? 'Comunidad'} className="w-16 h-16 rounded-lg object-cover" />
                ) : null}
                <div>
                  <h3 className="text-xl font-semibold">{data?.name ?? 'Sin nombre'}</h3>
                  <p className="text-sm text-gray-500">{data?.type ?? 'Tipo no definido'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Dirección</div>
                  <div className="text-base">{data?.address && data.address.trim() !== '' ? data.address : '—'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700" />

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="solid" className="rounded-xl" onClick={() => setPropertyModalOpen(true)}>
                  Crear Propiedad
                </Button>
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
            {/* 🚫 Se ocultan Rol y Comunidad destino (están seteados internamente) */}

            {/* Orden NUEVO */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rut<span className="text-red-500"> *</span></label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={formIdNumber}
                  onChange={(e) => setFormIdNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo<span className="text-red-500"> *</span></label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {isResident ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Propiedad<span className="text-red-500"> *</span></label>
                    <Select
                      options={propertyOptions}
                      isSearchable={false}
                      isLoading={loadingProps}
                      value={propertyOptions.find((o) => o.value === (residentPropertyId ?? -1)) ?? null}
                      placeholder="Selecciona propiedad"
                      onChange={(opt: unknown) => {
                        const isOpt = (v: unknown): v is SelectOption => isRecord(v) && typeof (v as any).value === 'number'
                        setResidentPropertyId(isOpt(opt) ? (opt as SelectOption).value : null)
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rol en el hogar<span className="text-red-500"> *</span></label>
                    <select
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={homeRole}
                      onChange={(e) => setHomeRole(e.target.value)}
                    >
                      <option value="">Seleccione…</option>
                      {HOME_ROLE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isOwner}
                        onChange={(e) => setIsOwner(e.target.checked)}
                      />
                      <span className="text-sm">Es propietario (opcional)</span>
                    </label>
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Correo<span className="text-red-500"> *</span></label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña<span className="text-red-500"> *</span></label>
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

          {propertyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-4xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Crear propiedad</h3>
                  <PropertiesForm
                    defaultValues={{ community_id: Number(id ?? 0), property_number: '', floor: 0 }}
                    onFormSubmit={handleCreateProperty}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-sm">
                        {/* Mensajes de creación de propiedad */}
                        {propMsg ? <div className="text-green-600">{propMsg}</div> : null}
                        {propErr ? <div className="text-red-600">{propErr}</div> : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="plain"
                          className="rounded-xl border border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300"
                          type="button"
                          onClick={() => setPropertyModalOpen(false)}
                          disabled={propSubmitting}
                        >
                          Cancelar
                        </Button>
                        <Button variant="solid" className="rounded-xl" type="submit" loading={propSubmitting}>
                          Crear
                        </Button>
                      </div>
                    </div>
                  </PropertiesForm>
                </div>
              </Card>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 p-4">No se pudo cargar la información de la comunidad.</div>
      )}
    </Loading>
  )
}

export default CondosDetails
