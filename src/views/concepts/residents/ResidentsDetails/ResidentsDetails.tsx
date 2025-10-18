// src/views/concepts/residents/ResidentsDetails.tsx
import { useMemo } from 'react'
import useSWR from 'swr'
import { useParams } from 'react-router'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import ApiService from '@/services/ApiService'

type MaybeId = string | number | undefined

type MinimalUser = { id?: MaybeId } | null | undefined
type MinimalProperty = { id?: MaybeId } | null | undefined

type ResidentRaw = {
  id?: MaybeId
  userId?: MaybeId
  user_id?: MaybeId
  user?: MinimalUser
  propertyId?: MaybeId
  property_id?: MaybeId
  property?: MinimalProperty
  isOwner?: boolean
  is_owner?: boolean
  owner?: boolean
  startDate?: string
  start_date?: string
  start?: string
  created_at?: string
  endDate?: string
  end_date?: string
  end?: string
  finish_date?: string
}

type UserInfo = {
  id?: MaybeId
  name?: string
  email?: string
  avatar?: string
}

type PropertyInfo = {
  id?: MaybeId
  label?: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return ['true', '1', 'si', 'sí', 'yes'].includes(v.trim().toLowerCase())
  return false
}

function fmtDate(raw: unknown): string {
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    return String(raw)
  }
  return '—'
}

async function fetchResident(id: string) {
  try {
    return await ApiService.fetchDataWithAxios<ResidentRaw>({ url: `/api/v1/residents/${encodeURIComponent(id)}`, method: 'get' })
  } catch {
    return await ApiService.fetchDataWithAxios<ResidentRaw>({ url: `/api/v1/residents/id/${encodeURIComponent(id)}`, method: 'get' })
  }
}

async function fetchUser(uId: string | number): Promise<UserInfo> {
  try {
    const body = await ApiService.fetchDataWithAxios<unknown>({
      url: `/api/v1/users/${encodeURIComponent(String(uId))}`,
      method: 'get',
    })
    if (!isRecord(body)) return { id: uId, name: `ID ${uId}`, email: '', avatar: '' }
    const first = (body.first_name as string | undefined) ?? ''
    const last = (body.last_name as string | undefined) ?? ''
    const parts = [first, last].filter(Boolean).join(' ')
    const name =
      (body.full_name as string | undefined) ||
      (body.name as string | undefined) ||
      parts ||
      (body.email as string | undefined) ||
      `ID ${uId}`
    const email = (body.email as string | undefined) ?? ''
    const avatar =
      (body.avatar as string | undefined) ??
      (body.avatar_url as string | undefined) ??
      (body.photoURL as string | undefined) ??
      (body.photo_url as string | undefined) ??
      ''
    return { id: uId, name, email, avatar }
  } catch {
    return { id: uId, name: `ID ${uId}`, email: '', avatar: '' }
  }
}

async function fetchProperty(pId: string | number): Promise<PropertyInfo> {
  try {
    const body = await ApiService.fetchDataWithAxios<unknown>({
      url: `/api/v1/communities/properties/id/${encodeURIComponent(String(pId))}`,
      method: 'get',
    })
    if (!isRecord(body)) return { id: pId, label: `Propiedad #${pId}` }
    const num =
      (body.property_number as string | number | undefined) ??
      (body.number as string | number | undefined) ??
      (body.unit as string | number | undefined) ??
      (body.code as string | number | undefined) ??
      ''
    const label = num ? `Propiedad ${String(num)}` : `Propiedad #${pId}`
    return { id: pId, label }
  } catch {
    return { id: pId, label: `Propiedad #${pId}` }
  }
}

const ResidentsDetails = () => {
  const { id = '' } = useParams()

  const { data: resident, isLoading: loadingResident, error } = useSWR<ResidentRaw>(
    id ? ['resident', id] : null,
    ([, rid]) => fetchResident(String(rid)),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const userId = useMemo<MaybeId>(() => {
    const r = resident
    const nested = r?.user && isRecord(r.user) ? (r.user.id as MaybeId) : undefined
    return r?.userId ?? r?.user_id ?? nested ?? ''
  }, [resident])

  const propertyId = useMemo<MaybeId>(() => {
    const r = resident
    const nested = r?.property && isRecord(r.property) ? (r.property.id as MaybeId) : undefined
    return r?.propertyId ?? r?.property_id ?? nested ?? ''
  }, [resident])

  const { data: userInfo, isLoading: loadingUser } = useSWR<UserInfo>(
    userId ? ['resident-user', userId] : null,
    ([, uid]) => fetchUser(uid as string | number),
    { revalidateOnFocus: false },
  )

  const { data: propertyInfo, isLoading: loadingProperty } = useSWR<PropertyInfo>(
    propertyId ? ['resident-property', propertyId] : null,
    ([, pid]) => fetchProperty(pid as string | number),
    { revalidateOnFocus: false },
  )

  const isOwner = useMemo(() => {
    const r = resident
    return bool(r?.isOwner ?? r?.is_owner ?? r?.owner)
  }, [resident])

  const start = useMemo(() => {
    const r = resident
    return fmtDate(r?.created_at ?? r?.startDate ?? r?.start_date ?? r?.start)
  }, [resident])

  const end = useMemo(() => {
    const r = resident
    return fmtDate(r?.endDate ?? r?.end_date ?? r?.end ?? r?.finish_date)
  }, [resident])

  const status = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (end && end !== '—' && end < today) return 'Finalizado'
    return 'Activo'
  }, [end])

  const loading = loadingResident || loadingUser || loadingProperty

  return (
    <Loading loading={loading}>
      <Container>
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="min-w-[330px] 2xl:min-w-[400px]">
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <Avatar shape="circle" size={64} src={userInfo?.avatar || ''} />
                <div className="flex flex-col">
                  <h4 className="font-semibold leading-tight">{userInfo?.name || 'Residente'}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{userInfo?.email || '—'}</span>
                  <div className="mt-2">
                    <Badge className="mr-2" content={isOwner ? 'Dueño(a)' : 'Alojado(a)'} />
                    <Badge content={status} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="w-full">
            <Card className="p-5">
              <h5 className="mb-4 font-semibold">Detalles del residente</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">ID del residente</span>
                  <span className="font-medium">{resident?.id ?? String(id)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">ID del usuario</span>
                  <span className="font-medium">{userId ?? '—'}</span>
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Usuario</span>
                  <span className="font-medium">{userInfo?.name || (userId ? `ID ${userId}` : '—')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Propiedad</span>
                  <span className="font-medium">{propertyInfo?.label || (propertyId ? `Propiedad #${propertyId}` : '—')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Dueño</span>
                  <span className="font-medium">{isOwner ? 'Sí' : 'No'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Inicio (creación)</span>
                  <span className="font-medium">{start}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Término</span>
                  <span className="font-medium">{end}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Card className="p-4">
              <span className="text-sm text-red-600 dark:text-red-400">No se pudo cargar el detalle del residente.</span>
            </Card>
          </div>
        )}
      </Container>
    </Loading>
  )
}

export default ResidentsDetails
