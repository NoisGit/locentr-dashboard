// src/views/concepts/invitations/InvitationsList/hooks/useInvitationsList.ts
import useSWR from 'swr'
import { useInvitationsListStore } from '../store/InvitationsListStore'
import {
  apiGetInvitationsList,
  type InvitationsTableQueries,
} from '@/services/InvitationsService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { GetInvitationsListResponse, InvitationEntry } from '../types'
import { useAuth } from '@/auth'

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

function tokensFrom(user: unknown): string[] {
  if (!isRec(user)) return []
  const u = user as Rec
  const cands: unknown[] = [
    u['roles'],
    u['role'],
    u['authorities'],
    u['authority'],
    u['permissions'],
    u['scopes'],
  ]
  const out: string[] = []
  for (const c of cands) {
    if (typeof c === 'string' || typeof c === 'number') out.push(String(c))
    else if (Array.isArray(c)) {
      for (const x of c) {
        if (typeof x === 'string' || typeof x === 'number') out.push(String(x))
        else if (isRec(x)) {
          const n = (x['name'] ?? x['code'] ?? x['id'] ?? x['authority']) as unknown
          if (typeof n === 'string' || typeof n === 'number') out.push(String(n))
        }
      }
    } else if (isRec(c)) {
      const n = (c['name'] ?? c['code'] ?? c['id'] ?? c['authority']) as unknown
      if (typeof n === 'string' || typeof n === 'number') out.push(String(n))
    }
  }
  return out.map((s) => s.toLowerCase())
}
function isSuperAdmin(user: unknown): boolean {
  const toks = tokensFrom(user)
  if (!toks.length) return false
  const re = /(super)[\s_\-]*admin/i
  if (toks.some((t) => re.test(t))) return true
  if (toks.some((t) => t.includes('owner') || t.includes('root'))) return true
  return false
}

export default function useInvitationsList() {
  const { selectedId: communityId } = useCommunitiesStore()
  const { user } = useAuth()
  const superAdmin = isSuperAdmin(user)

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

  const listAll =
    superAdmin && (communityId == null || String(communityId) === '')

  const effectiveParams: InvitationsTableQueries = {
    ...baseParams,
    communityId: listAll ? undefined : (communityId as string | number | undefined),
  }

  type SWRKey =
    | [
        'invitations:list',
        'all' | string,
        number,
        number,
        string,
        string,
        string
      ]
    | null

  const swrKey: SWRKey = listAll
    ? [
        'invitations:list',
        'all',
        Number(baseParams.pageIndex ?? 1),
        Number(baseParams.pageSize ?? 10),
        String(baseParams.sort?.key ?? ''),
        String(baseParams.sort?.order ?? ''),
        String(baseParams.query ?? ''),
      ]
    : communityId != null && String(communityId) !== ''
    ? [
        'invitations:list',
        String(communityId),
        Number(baseParams.pageIndex ?? 1),
        Number(baseParams.pageSize ?? 10),
        String(baseParams.sort?.key ?? ''),
        String(baseParams.sort?.order ?? ''),
        String(baseParams.query ?? ''),
      ]
    : null

  const { data, error, isLoading, mutate } = useSWR<
    GetInvitationsListResponse,
    unknown,
    SWRKey
  >(
    swrKey,
    () => apiGetInvitationsList<GetInvitationsListResponse, InvitationsTableQueries>(effectiveParams),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    },
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
