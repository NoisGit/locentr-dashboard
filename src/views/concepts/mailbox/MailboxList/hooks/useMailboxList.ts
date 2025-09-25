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
import { apiGetPropertiesList, type PropertyRow } from '@/services/PropertiesService'

type SWRKey = [typeof MAILBOX_COMMUNITY_BASE, number | string, MailboxTableQueries]

type Rec = Record<string, unknown>
function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function pick(row: unknown, keys: string[]) {
  if (!isRec(row)) return undefined
  for (const k of keys) {
    const v = (row as Rec)[k]
    if (v !== undefined && v !== null && String(v) !== '') return v
  }
  return undefined
}
function readPropId(row: unknown): string {
  const direct = pick(row, ['property_id', 'propertyId'])
  if (direct !== undefined) return String(direct)
  const nested = isRec(row) ? (row as Rec)['property'] : undefined
  if (isRec(nested)) {
    const nid = pick(nested, ['id'])
    if (nid !== undefined) return String(nid)
  }
  return ''
}

export default function useMailboxList() {
  const { selectedId: communityId } = useCommunitiesStore()

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
  const effectiveParams: MailboxTableQueries = {
    ...baseParams,
    communityId: communityId ?? baseParams.communityId,
  }

  const swrKey: SWRKey | null = communityId
    ? [MAILBOX_COMMUNITY_BASE, communityId, effectiveParams]
    : null

  const { data, error, isLoading, mutate } = useSWR<GetMailboxListResponse, unknown, SWRKey | null>(
    swrKey,
    ([, , p]) => apiGetMailboxList<GetMailboxListResponse, MailboxTableQueries>(p),
    { revalidateOnFocus: false },
  )

  const raw: any = data
  const list: MailboxEntry[] = Array.isArray(raw?.list)
    ? raw.list
    : Array.isArray(raw?.data)
    ? raw.data
    : []

  const total: number =
    typeof raw?.total === 'number' ? raw.total : Array.isArray(list) ? list.length : 0

  const shouldLoadProps = Boolean(communityId)
  const { data: propsResp } = useSWR<{ list: PropertyRow[]; total: number }>(
    shouldLoadProps ? ['props:byCommunity', communityId] : null,
    () =>
      apiGetPropertiesList<{ list: PropertyRow[]; total: number }>({
        pageIndex: 1,
        pageSize: 1000,
        communityId: communityId as number | string,
      }),
    { revalidateOnFocus: false },
  )

  const propMap = new Map<string, { number: string; block: string; floor: string }>()
  for (const p of propsResp?.list ?? []) {
    const id = String((p as unknown as { id: string | number }).id)
    const number =
      (p as unknown as any).propertyNumber ??
      (p as unknown as any).number ??
      (p as unknown as any).property_number ??
      id
    const block =
      (p as unknown as any).block ??
      (p as unknown as any).block_tower ??
      (p as unknown as any).tower ??
      ''
    const floor =
      (p as unknown as any).floor ??
      (p as unknown as any).level ??
      ''
    propMap.set(id, { number: String(number ?? ''), block: String(block ?? ''), floor: String(floor ?? '') })
  }

  const enrichedList: MailboxEntry[] = list.map((row: any) => {
    const pid = readPropId(row)
    const info = pid ? propMap.get(pid) : undefined
    const blockVal = row?.block ?? row?.block_tower ?? row?.property?.block ?? (info?.block ?? '')
    const floorVal = row?.floor ?? row?.property?.floor ?? (info?.floor ?? '')
    const numberVal = row?.property_number ?? row?.property?.number ?? (info?.number ?? '')
    return {
      ...row,
      property_number: numberVal,
      block: blockVal,
      floor: floorVal,
      property: {
        ...(row?.property ?? {}),
        id: row?.property?.id ?? pid,
        number: row?.property?.number ?? numberVal,
        block: row?.property?.block ?? blockVal,
        floor: row?.property?.floor ?? floorVal,
      },
    }
  })

  return {
    mailboxList: enrichedList,
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
