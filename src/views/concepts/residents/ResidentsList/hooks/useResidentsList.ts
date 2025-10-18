import useSWR from 'swr'
import {
  apiGetResidentsList,
  type GetResidentsListResponse,
  type TableQueries as ResidentsTableQueries,
} from '@/services/ResidentsService'
import { useResidentsListStore } from '../store/ResidentsListStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

type Rec = Record<string, unknown>

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'yes'
  }
  return false
}

/** Lee la 1ª clave no vacía; soporta rutas anidadas: ["property","floor"] */
function pickDeep(obj: Rec | undefined, candidates: Array<string | string[]>): unknown {
  if (!obj) return undefined
  for (const c of candidates) {
    if (Array.isArray(c)) {
      let cur: unknown = obj
      let ok = true
      for (const k of c) {
        if (!isRec(cur) || !(k in (cur as Rec))) {
          ok = false
          break
        }
        cur = (cur as Rec)[k]
      }
      if (ok && cur !== undefined && cur !== null && String(cur) !== '') return cur
    } else {
      const v = obj[c]
      if (v !== undefined && v !== null && String(v) !== '') return v
    }
  }
  return undefined
}

/** Devuelve el array de items desde múltiples formatos conocidos */
function readItems(raw: unknown): unknown[] {
  if (!raw) return []
  const r = raw as Rec
  const candidates = [r.list, r.items, r.results, r.data, raw]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
    if (isRec(c)) {
      const nested = (c as Rec).list ?? (c as Rec).items ?? (c as Rec).results
      if (Array.isArray(nested)) return nested
    }
  }
  return []
}

export default function useResidentsList() {
  const {
    tableData,
    filterData,
    selectedResident,
    selectedResidents,
    setTableData,
    setSelectedResident,
    setSelectedResidents,
    setSelectAllResidents,
    setFilterData,
  } = useResidentsListStore((state) => state)

  const { selectedId: communityId } = useCommunitiesStore()

  const effectiveParams: ResidentsTableQueries = {
    ...(tableData as ResidentsTableQueries),
    ...(filterData as Partial<ResidentsTableQueries>),
    communityId: communityId ?? '',
  }

  const swrKey = ['residents:list', effectiveParams, String(communityId ?? '')] as const

  const { data, error, isLoading, mutate } = useSWR<GetResidentsListResponse>(
    swrKey,
    ([, params]) =>
      apiGetResidentsList<GetResidentsListResponse, ResidentsTableQueries>(
        params as ResidentsTableQueries,
      ),
    { revalidateOnFocus: false },
  )

  const items = readItems(data)
  const residentsList = items.map((row) => {
    const r = isRec(row) ? row : {}
    const user = isRec(r.user) ? (r.user as Rec) : undefined
    const prop = isRec(r.property) ? (r.property as Rec) : undefined

    const id = pickDeep(r, ['id'])

    const userId =
      pickDeep(r, ['userId', 'user_id']) ??
      pickDeep(user, ['id'])

    const propertyId =
      pickDeep(r, ['propertyId', 'property_id']) ??
      pickDeep(prop, ['id'])

    const isOwner = toBool(pickDeep(r, ['isOwner', 'is_owner', 'owner']))

    const startDate = toStr(
      pickDeep(r, [
        'startDate',
        'start_date',
        'start',
        'assignment_start',
        'created_at',
        'createdAt',
        ['assignment', 'start_date'],
      ]) ?? pickDeep(prop, ['created_at', 'createdAt']),
    )

    const endDate = toStr(
      pickDeep(r, ['endDate', 'end_date', 'end', 'finish_date', ['assignment', 'end_date']]),
    )

    const home_role = toStr(
      pickDeep(r, [
        'home_role',
        'homeRole',
        'role',
        'role_name',
        ['assignment', 'home_role'],
        ['resident', 'home_role'],
      ]),
    )

    const property_number = toStr(
      pickDeep(r, ['property_number', 'unit', 'apartment', 'apt']) ??
        pickDeep(prop, ['number', 'propertyNumber', 'code', 'name']),
    )

    const floor =
      (pickDeep(r, ['floor', 'level', 'property_floor']) as string | number | undefined) ??
      (pickDeep(prop, ['floor', 'level']) as string | number | undefined) ??
      ''

    const block = toStr(
      pickDeep(r, ['block', 'block_tower', 'tower', 'blockTower']) ??
        pickDeep(prop, ['block', 'tower']),
    )

    return {
      ...r,
      id,
      userId,
      propertyId,
      isOwner,
      startDate,
      endDate,
      home_role,
      property_number,
      floor,
      block,
      property: {
        ...(prop ?? {}),
        id: prop?.id ?? propertyId,
        number: (prop?.number as string | undefined) ?? property_number,
        floor: (prop?.floor as string | number | undefined) ?? floor,
        block: (prop?.block as string | undefined) ?? block,
      },
    } as Rec
  })

  const residentsListTotal =
    typeof (data as { total?: number } | undefined)?.total === 'number'
      ? (data as { total: number }).total
      : residentsList.length

  return {
    residents: residentsList,
    residentsList,
    residentsTotal: residentsListTotal,
    residentsListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    selectedResident,
    selectedResidents,
    mutate,
    setTableData,
    setSelectedResident,
    setSelectedResidents,
    setSelectAllResidents,
    setFilterData,
  }
}
