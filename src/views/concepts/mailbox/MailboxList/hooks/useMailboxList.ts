// src/views/concepts/mailbox/MailboxList/hooks/useMailboxList.ts
import useSWR from 'swr'
import { useMailboxListStore } from '../store/MailboxListStore'
import {
  apiGetMailboxList,
  type MailboxTableQueries,
  MAILBOX_COMMUNITY_BASE,
} from '@/services/MailboxService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { GetMailboxListResponse, MailboxEntry } from '../types'
import { useAuth } from '@/auth'
import { isSuperAdmin } from '@/utils/newsPermissions'

type SWRKey = [typeof MAILBOX_COMMUNITY_BASE, number | string, MailboxTableQueries]

type Rec = Record<string, unknown>
function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function pickFrom(obj: Rec | undefined, keys: string[]): unknown {
  if (!obj) return undefined
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && String(v) !== '') return v
  }
  return undefined
}
function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

export default function useMailboxList() {
  const { selectedId: communityId } = useCommunitiesStore()
  const { user } = useAuth()
  const superAdmin = isSuperAdmin(undefined, user)

  const {
    tableData,
    filterData,
    selectedEntry,
    setTableData,
    setSelectedEntry,
    setSelectAllEntry,
    setFilterData,
  } = useMailboxListStore((state) => state)

  const baseParams = { ...tableData, ...filterData } as MailboxTableQueries
  const listAll = superAdmin && (communityId == null || String(communityId) === '')

  const effectiveParams: MailboxTableQueries = listAll
    ? { ...baseParams, communityId: undefined }
    : { ...baseParams, communityId: communityId ?? baseParams.communityId }

  const swrKey: SWRKey | null = listAll
    ? [MAILBOX_COMMUNITY_BASE, 'all', effectiveParams]
    : communityId
    ? [MAILBOX_COMMUNITY_BASE, communityId, effectiveParams]
    : null

  const { data, error, isLoading, mutate } = useSWR<GetMailboxListResponse, unknown, SWRKey | null>(
    swrKey,
    ([, , p]) => apiGetMailboxList<GetMailboxListResponse, MailboxTableQueries>(p),
    { revalidateOnFocus: false },
  )

  const raw = data as { list?: unknown[]; data?: unknown[]; total?: number } | undefined
  const listRaw: unknown[] = Array.isArray(raw?.list)
    ? (raw!.list as unknown[])
    : Array.isArray(raw?.data)
    ? (raw!.data as unknown[])
    : []

  const list: MailboxEntry[] = listRaw.map((row) => {
    const r = (isRec(row) ? row : {}) as Rec
    const p = isRec(r.property) ? (r.property as Rec) : undefined

    const property_number = toStr(
      pickFrom(r, [
        'property_number',
        'propertyNumber',
        'unit',
        'apartment',
        'apt',
        'houseNumber',
        'house_number',
        'property_id',
        'propertyId',
      ]) ?? pickFrom(p, ['number', 'propertyNumber', 'code', 'name', 'id']),
    )

    const floorRaw = pickFrom(r, ['floor', 'level']) ?? pickFrom(p, ['floor', 'level'])
    const floor =
      typeof floorRaw === 'number' || typeof floorRaw === 'string' ? (floorRaw as number | string) : ''

    const block = toStr(pickFrom(r, ['block', 'block_tower', 'tower']) ?? pickFrom(p, ['block', 'tower']))

    const base = r as unknown as MailboxEntry

    return {
      ...base,
      property_number,
      floor,
      block,
      property: {
        ...(p ?? {}),
        number: (p?.number as unknown as string) ?? property_number,
        floor: (p?.floor as unknown as number | string) ?? floor,
        block: (p?.block as unknown as string) ?? block,
      },
    } as MailboxEntry
  })

  const total: number = typeof raw?.total === 'number' ? raw!.total : list.length

  return {
    mailboxList: list,
    mailboxListTotal: total,
    error,
    isLoading,
    tableData,
    filterData,
    mutate,
    setTableData,
    selectedEntry,
    setSelectedEntry,
    setSelectAllEntry,
    setFilterData,
  }
}
