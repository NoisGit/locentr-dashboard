// src/views/concepts/invitations/InvitationsList/hooks/useInvitationsList.ts
import useSWR from 'swr'
import { useInvitationsListStore } from '../store/InvitationsListStore'
import {
  apiGetInvitationsList,
  type InvitationsTableQueries,
  INVITATIONS_COMMUNITY_BASE,
} from '@/services/InvitationsService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { GetInvitationsListResponse, InvitationEntry } from '../types'

type SWRKey = [typeof INVITATIONS_COMMUNITY_BASE, number | string, InvitationsTableQueries]

type Rec = Record<string, unknown>

type NormalizedInvitation = InvitationEntry & {
  resident?: {
    property_number?: string | number
    floor?: string | number
    block?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function asRec(v: unknown): Rec {
  return isRec(v) ? (v as Rec) : {}
}
function pickStrOrNum(...vals: unknown[]): string | number | '' {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v) !== '') {
      if (typeof v === 'number' || typeof v === 'string') return v
      return String(v)
    }
  }
  return ''
}
function pickStr(...vals: unknown[]): string {
  const v = pickStrOrNum(...vals)
  return typeof v === 'number' ? String(v) : (v as string)
}

export default function useInvitationsList() {
  const { selectedId: communityId } = useCommunitiesStore()

  const {
    tableData,
    filterData,
    selectedEntry,
    setTableData,
    setSelectedEntry,
    setSelectAllEntry,
    setFilterData,
  } = useInvitationsListStore((state) => state)

  const baseParams = { ...tableData, ...filterData } as InvitationsTableQueries
  const effectiveParams: InvitationsTableQueries = {
    ...baseParams,
    communityId: communityId ?? baseParams.communityId,
  }

  const swrKey: SWRKey | null = communityId ? [INVITATIONS_COMMUNITY_BASE, communityId, effectiveParams] : null

  const { data, error, isLoading, mutate } = useSWR<GetInvitationsListResponse, unknown, SWRKey | null>(
    swrKey,
    ([, , p]) => apiGetInvitationsList<GetInvitationsListResponse, InvitationsTableQueries>(p),
    { revalidateOnFocus: false },
  )

  const listRaw: InvitationEntry[] = data?.list ?? []

  const list: NormalizedInvitation[] = listRaw.map((row) => {
    const r = asRec(row)
    const residentSrc = asRec(r['resident'])

    const property_number = pickStrOrNum(
      residentSrc['property_number'],
      residentSrc['propertyNumber'],
      r['property_number'],
      r['propertyNumber'],
      r['property_id'],
      r['propertyId'],
    )

    const floor = pickStrOrNum(
      residentSrc['floor'],
      residentSrc['level'],
      r['floor'],
      r['level'],
    )

    const block = pickStr(
      residentSrc['block'],
      residentSrc['block_tower'],
      residentSrc['tower'],
      r['block'],
      r['block_tower'],
      r['tower'],
    )

    const normalized: NormalizedInvitation = {
      ...(row as InvitationEntry),
      resident: {
        ...residentSrc,
        property_number,
        floor,
        block,
      },
    }
    return normalized
  })

  const total: number = typeof data?.total === 'number' ? data.total : list.length

  return {
    invitationsList: list,
    invitationsListTotal: total,
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
