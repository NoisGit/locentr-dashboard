// src/views/concepts/condos/CondosDetails/CondosDetails.tsx
import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { apiGetCondoById } from '@/services/CondosService'
import ApiService from '@/services/ApiService'
import useSWR, { mutate as globalMutate } from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import PropertiesCreateModalForm, { type CreatePropertySchema } from '@/views/concepts/properties/PropertiesForm/PropertiesCreateModalForm'
import { apiCreateProperty, apiGetPropertiesList, type PropertyRow } from '@/services/PropertiesService'
import { apiGetResidentsList } from '@/services/ResidentsService'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import type { Condo } from '../CondosList/types'
import useSyncCommunityFromCondo from '../CondosList/hooks/useSyncCommunityFromCondo'
import CondoTabs from './components/CondoTabs'
import {
  PiHouseLineDuotone,
  PiUserGearDuotone,
  PiUserDuotone,
  PiUserCheckDuotone,
  PiUsersThreeDuotone,
} from 'react-icons/pi'

type RoleKey = 'ADMIN' | 'SUB_ADMIN' | 'CONCIERGE' | 'GUARD' | 'RESIDENT'
type RoleRecord = { id: string | number; name: string }
type SelectOption = { label: string; value: number }

type HttpError = {
  response?: {
    status?: number
    data?: { message?: string; detail?: string }
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function asHttpError(e: unknown): HttpError {
  return isRecord(e) ? (e as HttpError) : {}
}

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
          <h3 className="mb-3 text-lg font-semibold">{title}</h3>
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/40 p-5 dark:border-gray-700 dark:bg-gray-900/30">
            {children}
          </div>
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button
              variant="plain"
              className="rounded-xl border border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-300"
              disabled={disabled}
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant="solid"
              className="rounded-xl"
              disabled={disabled}
              onClick={onConfirm ?? onClose}
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

function normalizeRoleName(s: string) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

async function fetchRoles(): Promise<RoleRecord[]> {
  const raw = await ApiService.fetchDataWithAxios<unknown>({ url: '/api/v1/roles/', method: 'get' })
  const list =
    (Array.isArray(raw) && raw) ||
    (isRecord(raw) && Array.isArray((raw as Record<string, unknown>).items) && ((raw as Record<string, unknown>).items as unknown[])) ||
    (isRecord(raw) && Array.isArray((raw as Record<string, unknown>).data) && ((raw as Record<string, unknown>).data as unknown[])) ||
    (isRecord(raw) && Array.isArray((raw as Record<string, unknown>).results) && ((raw as Record<string, unknown>).results as unknown[])) ||
    []
  return (list as Array<Record<string, unknown>>)
    .filter(Boolean)
    .map((r) => {
      const name =
        (r.code as string | undefined) ??
        (r.key as string | undefined) ??
        (r.slug as string | undefined) ??
        (r.display_name as string | undefined) ??
        (r.role as string | undefined) ??
        (r.name as string | undefined) ??
        String((r.id as string | number | undefined) ?? '')
      const id = (r.id as string | number | undefined) ?? name
      return { id: String(id), name: String(name) }
    })
}

function matchRoleId(roles: RoleRecord[], key: RoleKey): string | number | undefined {
  const norm = (s: string) => normalizeRoleName(s)
  const wanted = norm(key)
  const exact = roles.find((r) => norm(r.name) === wanted)
  if (exact) return exact.id

  const aliasMap: Record<RoleKey, string[]> = {
    ADMIN: ['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'],
    SUB_ADMIN: [
      'SUB_ADMIN', 'SUBADMIN', 'SUB-ADMIN', 'SUB ADMIN',
      'SUB_ADMINISTRADOR', 'SUBADMINISTRADOR', 'SUB-ADMINISTRADOR',
      'SUB ADMINISTRADOR', 'SUB-ADMINISTRATOR', 'SUBADMINISTRATOR',
    ],
    CONCIERGE: ['CONCIERGE', 'CONSERJE'],
    GUARD: ['GUARD', 'GUARDIA', 'SECURITY', 'SEGURIDAD', 'VIGILANTE'],
    RESIDENT: ['RESIDENT', 'RESIDENTE'],
  }
  const aliases = aliasMap[key].map(norm)
  const byAlias = roles.find((r) => aliases.includes(norm(r.name)))
  if (byAlias) return byAlias.id

  if (key === 'SUB_ADMIN') {
    const cand = roles.find((r) => {
      const n = norm(r.name)
      return n.includes('SUB') && n.includes('ADMIN') && !n.includes('SUPER')
    })
    if (cand) return cand.id
  }
  if (key === 'ADMIN') {
    const cand = roles.find((r) => {
      const n = norm(r.name)
      return n.includes('ADMIN') && !n.includes('SUB') && !n.includes('SUPER')
    })
    if (cand) return cand.id
  }
  if (key === 'CONCIERGE') {
    const cand = roles.find((r) => {
      const n = norm(r.name)
      return n.includes('CONSERJE') || n.includes('CONCIERGE')
    })
    if (cand) return cand.id
  }
  if (key === 'GUARD') {
    const cand = roles.find((r) => {
      const n = norm(r.name)
      return n.includes('GUARD') || n.includes('GUARDIA') || n.includes('SEGURIDAD') || n.includes('VIGILANTE')
    })
    if (cand) return cand.id
  }
  if (key === 'RESIDENT') {
    const cand = roles.find((r) => normalizeRoleName(r.name).includes('RESIDENT'))
    if (cand) return cand.id
  }
  return undefined
}

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
  role_id: number | string
  property_id: number
  is_owner: boolean
  home_role: string
  start_date: string
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

// pequeña ayuda
const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

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

  useSyncCommunityFromCondo(data?.id ?? id ?? null, (data?.name as string | undefined) ?? null, true)

  const isDataReady = !!data && !isEmpty(data) && !error

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formIdNumber, setFormIdNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)

  const [isOwner, setIsOwner] = useState<boolean>(true)
  const [homeRole, setHomeRole] = useState<string>('')

  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [rolesLoaded, setRolesLoaded] = useState(false)

  const communityIdNum = Number(currentCommunityId ?? id ?? 0)

  const { data: propsData, isLoading: loadingProps, mutate: mutateProps } = useSWR<{ list: PropertyRow[]; total: number }>(
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
        if (!ignore) setRolesLoaded = true
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

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

  const validateBeforeCreate = (isResidentFlow: boolean): boolean => {
    const missingBasics =
      !communityIdNum ||
      !formIdNumber.trim() ||
      !formName.trim() ||
      !formEmail.trim() ||
      !formPassword.trim()

    const missingResidentBits = isResidentFlow && (!residentPropertyId || !homeRole)

    if (missingBasics || missingResidentBits) {
      setFormError(
        isResidentFlow
          ? 'Completa los campos obligatorios y selecciona comunidad, propiedad y rol en el hogar.'
          : 'Completa los campos obligatorios y selecciona una comunidad.',
      )
      return false
    }
    return true
  }

  const handleConfirm = async () => {
    if (!activeModal) return
    const isResidentFlow = activeModal === 'RESIDENT'
    if (!validateBeforeCreate(isResidentFlow)) return

    setSubmitting(true)
    setFormError(null)
    setFormOk(null)

    try {
      if (isResidentFlow) {
        const payload: CreateResidentAssignPayload = {
          full_name: formName.trim(),
          id_number: formIdNumber.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role_id: RESIDENT_ROLE_ID,
          property_id: Number(residentPropertyId),
          is_owner: isOwner,
          home_role: homeRole,
          start_date: new Date().toISOString(),
          ...(formPhone.trim() ? { phone: formPhone.trim() } : {}),
        }
        await createResidentAndAssign(payload)

        window.dispatchEvent(new CustomEvent('residents:changed', { detail: { type: 'created' } }))
      } else {
        const rid = rolesLoaded ? matchRoleId(roles, activeModal) : undefined
        if (rid == null) throw new Error('No se pudo determinar el role_id para este tipo de usuario.')
        const payload: CreateUserAssignPayload = {
          full_name: formName.trim(),
          id_number: formIdNumber.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          password: formPassword,
          role_id: typeof rid === 'string' ? Number(rid) || rid : rid,
          community_id: communityIdNum,
        }
        await createUserAndAssign(payload)

        // 🔄 Refresco inmediato de la(s) lista(s) de colaboradores
        await globalMutate((key: unknown) => Array.isArray(key) && key[0] === 'collaborators:list')
        window.dispatchEvent(
          new CustomEvent('collaborators:changed', {
            detail: { type: 'created', communityId: communityIdNum },
          }),
        )
      }

      setFormOk('Creación realizada correctamente.')
      window.setTimeout(() => setActiveModal(null), 700)
    } catch (errorUnknown) {
      // Algunos backends crean pero devuelven 500; probamos varias sondas antes de mostrar error.
      for (let intento = 0; intento < 3; intento += 1) {
        try {
          // sonda por propiedad
          const probe = await apiGetResidentsList({
            pageIndex: 1,
            pageSize: 10,
            propertyId: Number(residentPropertyId ?? 0),
            communityId: communityIdNum,
            sort: { key: 'id', order: 'desc' },
          })

          const found = (probe?.list ?? []).find((r) => {
            const email = (r as any).userEmail?.toLowerCase()?.trim?.() || ''
            const rut = (r as any).idNumber?.toLowerCase()?.trim?.() || ''
            return (
              (formEmail && email === formEmail.toLowerCase().trim()) ||
              (formIdNumber && rut === formIdNumber.toLowerCase().trim())
            )
          })

          if (found) {
            window.dispatchEvent(new CustomEvent('residents:changed', { detail: { type: 'created' } }))
            setFormOk('Creación realizada correctamente.')
            window.setTimeout(() => setActiveModal(null), 700)
            setSubmitting(false)
            return
          }

          // sonda por query libre
          const probe2 = await apiGetResidentsList({
            pageIndex: 1,
            pageSize: 10,
            query: formEmail || formIdNumber,
            communityId: communityIdNum,
            sort: { key: 'id', order: 'desc' },
          })

          if ((probe2?.total ?? 0) > 0) {
            window.dispatchEvent(new CustomEvent('residents:changed', { detail: { type: 'created' } }))
            setFormOk('Creación realizada correctamente.')
            window.setTimeout(() => setActiveModal(null), 700)
            setSubmitting(false)
            return
          }
        } catch {
          // ignoramos fallos de sonda
        }
        await delay(500) // esperar un poco por eventual consistencia
      }

      const httpErr = asHttpError(errorUnknown)
      let msg = 'No se pudo completar la operación.'
      if (httpErr.response?.data?.message) msg = httpErr.response.data.message
      else if (httpErr.response?.data?.detail) msg = httpErr.response.data.detail
      else if (typeof httpErr.response?.status === 'number') msg = `${msg} (HTTP ${httpErr.response.status})`
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const [propSubmitting, setPropSubmitting] = useState(false)
  const [propMsg, setPropMsg] = useState<string | null>(null)
  const [propErr, setPropErr] = useState<string | null>(null)

  const handleCreateProperty = async (values: CreatePropertySchema) => {
    setPropSubmitting(true)
    setPropMsg(null)
    setPropErr(null)
    try {
      const cid = Number(currentCommunityId ?? id ?? 0)
      await apiCreateProperty({
        community_id: cid,
        property_number: values.property_number,
        floor: values.floor,
        block: values.block ?? '',
      })

      await mutateProps?.()
      window.dispatchEvent(new CustomEvent('properties:changed', { detail: { type: 'created', communityId: cid } }))

      setPropMsg('Propiedad creada correctamente.')
      window.setTimeout(() => setPropertyModalOpen(false), 700)
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

  const submitCreateProperty = () => {
    const form = document.getElementById('create-property-form') as HTMLFormElement | null
    if (form) form.requestSubmit()
  }

  const isResident = activeModal === 'RESIDENT'

  return (
    <Loading loading={isLoading}>
      {isDataReady ? (
        <>
          <Card className="w-full">
            <div className="flex flex-col gap-6 p-6">
              <div className="flex items-center gap-4">
                {data?.img ? (
                  <img src={data.img} alt={data.name ?? 'Comunidad'} className="h-16 w-16 rounded-lg object-cover" />
                ) : null}
                <div>
                  <h3 className="text-xl font-semibold">{data?.name ?? 'Sin nombre'}</h3>
                  <p className="text-sm text-gray-500">{data?.type ?? 'Tipo no definido'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Dirección</div>
                  <div className="text-base">{data?.address && data.address.trim() !== '' ? data.address : '—'}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2 dark:border-gray-700" />

              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="solid"
                  className="rounded-xl"
                  icon={<PiHouseLineDuotone className="text-lg" />}
                  onClick={() => setPropertyModalOpen(true)}
                >
                  Crear Propiedad
                </Button>

                <Button
                  variant="solid"
                  className="rounded-xl"
                  icon={<PiUserGearDuotone className="text-lg" />}
                  onClick={() => setActiveModal('ADMIN')}
                >
                  Crear Admin
                </Button>

                <Button
                  variant="solid"
                  className="rounded-xl"
                  icon={<PiUserDuotone className="text-lg" />}
                  onClick={() => setActiveModal('SUB_ADMIN')}
                >
                  Crear Sub-Admin
                </Button>

                <Button
                  variant="solid"
                  className="rounded-xl"
                  icon={<PiUserDuotone className="text-lg" />}
                  onClick={() => setActiveModal('CONCIERGE')}
                >
                  Crear Conserje
                </Button>

                <Button
                  variant="solid"
                  className="rounded-xl"
                  icon={<PiUserCheckDuotone className="text-lg" />}
                  onClick={() => setActiveModal('GUARD')}
                >
                  Crear Guardia
                </Button>

                <Button
                  variant="solid"
                  className="rounded-xl"
                  icon={<PiUsersThreeDuotone className="text-lg" />}
                  onClick={() => setActiveModal('RESIDENT')}
                >
                  Crear Residente
                </Button>
              </div>
            </div>
          </Card>

          <CondoTabs
            communityId={currentCommunityId && String(currentCommunityId) !== '' ? Number(currentCommunityId) : undefined}
            condoId={Number(id)}
          />

          <ModalBase
            open={activeModal !== null}
            title={modalTitle}
            confirmText="Crear"
            disabled={submitting}
            onClose={() => setActiveModal(null)}
            onConfirm={handleConfirm}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Rut<span className="text-red-500"> *</span>
                </label>
                <Input className="rounded-xl" value={formIdNumber} onChange={(e) => setFormIdNumber(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nombre completo<span className="text-red-500"> *</span>
                </label>
                <Input className="rounded-xl" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>

              {isResident ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Propiedad<span className="text-red-500"> *</span>
                    </label>
                    <Select
                      options={propertyOptions}
                      isSearchable={false}
                      isLoading={loadingProps}
                      value={propertyOptions.find((o) => o.value === (residentPropertyId ?? -1)) ?? null}
                      placeholder="Seleccione propiedad"
                      onChange={(opt: unknown) => {
                        const isOpt = (v: unknown): v is SelectOption =>
                          isRecord(v) && typeof (v as Record<string, unknown>).value === 'number'
                        setResidentPropertyId(isOpt(opt) ? (opt as SelectOption).value : null)
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Rol en el hogar<span className="text-red-500"> *</span>
                    </label>
                    <Select
                      options={HOME_ROLE_OPTIONS.map((label) => ({ label, value: label }))}
                      isSearchable={false}
                      value={homeRole ? { label: homeRole, value: homeRole } : null}
                      placeholder="Seleccione Rol en el hogar"
                      onChange={(opt: unknown) => {
                        const isOpt = (v: unknown): v is { label: string; value: string } =>
                          isRecord(v) && typeof (v as Record<string, unknown>).value === 'string'
                        setHomeRole(isOpt(opt) ? (opt as { label: string; value: string }).value : '')
                      }}
                    />
                  </div>

                  <div className="flex items-center">
                    <Checkbox checked={isOwner} onChange={(v) => setIsOwner(Boolean(v))}>
                      Es propietario
                    </Checkbox>
                  </div>
                </>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium">Teléfono</label>
                <Input className="rounded-xl" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Correo<span className="text-red-500"> *</span>
                  </label>
                  <Input
                    type="email"
                    className="rounded-xl"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Contraseña<span className="text-red-500"> *</span>
                  </label>
                  <Input
                    type="password"
                    className="rounded-xl"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>
              </div>

              {formError ? <div className="text-sm text-red-600">{formError}</div> : null}
              {formOk ? <div className="text-sm text-green-600">{formOk}</div> : null}
            </div>
          </ModalBase>

          <ModalBase
            open={propertyModalOpen}
            title="Crear propiedad"
            confirmText="Crear"
            disabled={propSubmitting}
            onClose={() => setPropertyModalOpen(false)}
            onConfirm={submitCreateProperty}
          >
            <>
              <PropertiesCreateModalForm
                formId="create-property-form"
                hideCommunity
                onSubmit={handleCreateProperty}
              />
              <div className="mt-2 text-sm">
                {propMsg ? <div className="text-green-600">{propMsg}</div> : null}
                {propErr ? <div className="text-red-600">{propErr}</div> : null}
              </div>
            </>
          </ModalBase>
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">No se pudo cargar la información de la comunidad.</div>
      )}
    </Loading>
  )
}

export default CondosDetails
