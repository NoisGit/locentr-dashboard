import { useMemo } from 'react'
import Card from '@/components/ui/Card'
import DataTable from '@/components/shared/DataTable'
import useSWR from 'swr'
import ApiService from '@/services/ApiService'
import cloneDeep from 'lodash/cloneDeep'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'

type Rec = Record<string, unknown>

type HardwareRow = {
  id: string | number
  name: string
  email?: string
  deviceType?: string
  location?: string
  active?: boolean
}

type GetHardwareListResponse = {
  list: HardwareRow[]
  total: number
}

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function s(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function readItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const r = isRec(raw) ? raw : {}
  const candidates = [
    (r as Rec).list,
    (r as Rec).items,
    (r as Rec).results,
    (r as Rec).data,
    raw,
  ]
  let items: unknown[] = []
  for (const c of candidates) {
    if (Array.isArray(c)) { items = c; break }
    if (isRec(c)) {
      const nested = (c as Rec).list ?? (c as Rec).items ?? (c as Rec).results
      if (Array.isArray(nested)) { items = nested; break }
    }
  }
  const total =
    Number((r as Rec).total ?? 0) ||
    Number(isRec((r as Rec).data) ? ((r as Rec).data as Rec).total ?? 0 : 0) ||
    items.length
  return { items, total }
}
function mapRow(u: unknown): HardwareRow {
  const r = isRec(u) ? u : {}
  const meta = isRec((r as Rec).meta) ? ((r as Rec).meta as Rec) : undefined
  const id = (r as Rec).id ?? (r as Rec)._id ?? ''
  const first = s((r as Rec).first_name)
  const last = s((r as Rec).last_name)
  const full = s((r as Rec).full_name) || s((r as Rec).name) || [first, last].filter(Boolean).join(' ')
  return {
    id: s(id),
    name: full || s((r as Rec).email) || `ID ${s(id)}`,
    email: s((r as Rec).email) || undefined,
    deviceType: s((r as Rec).device_type ?? meta?.device_type) || undefined,
    location: s((r as Rec).location ?? meta?.location) || undefined,
    active: Boolean((r as Rec).is_active ?? (r as Rec).active ?? meta?.active),
  }
}

async function apiGetHardwareUsers(params: {
  communityId?: number
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}): Promise<GetHardwareListResponse> {
  const pageIndex = Math.max(1, Number(params.pageIndex || 1))
  const pageSize = Math.max(1, Number(params.pageSize || 10))

  const qp: Record<string, unknown> = {
    pageIndex,
    pageSize,
    role: 'HARDWARE', // 👈 filtro por rol hardware
  }
  if (params.query) qp.query = params.query
  if (params.sort?.key) qp['sort[key]'] = params.sort.key
  if (params.sort?.order) qp['sort[order]'] = params.sort.order
  if (params.communityId != null) qp.community_id = Number(params.communityId)

  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/users/',
    method: 'get',
    params: qp,
  })

  const { items, total } = readItemsAndTotal(raw)
  let list = items.map(mapRow)

  // fallback si backend ignora la paginación y trae TODO
  if (Array.isArray(list) && list.length > pageSize) {
    const start = (pageIndex - 1) * pageSize
    list = list.slice(start, start + pageSize)
  }

  return { list, total }
}

type Props = {
  communityId?: number
}

export default function TabAccessPoints({ communityId }: Props) {
  // estado mínimo local de tabla (igual patrón que Properties)
  const tableData = { pageIndex: 1, pageSize: 10, query: '', sort: { key: 'id', order: 'desc' as const } }

  // Para mantenerlo simple en este primer corte, no guardo en Zustand.
  // Si luego quieres estados persistentes, replicamos el patrón de Residents/Properties.

  const key = useMemo(
    () =>
      ['hardware:list', communityId ?? '', tableData.pageIndex, tableData.pageSize, tableData.query, tableData.sort?.key ?? '', tableData.sort?.order ?? ''] as const,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [communityId, tableData.pageIndex, tableData.pageSize, tableData.query, tableData.sort?.key, tableData.sort?.order],
  )

  const { data, isLoading, mutate } = useSWR<GetHardwareListResponse>(
    key,
    () =>
      apiGetHardwareUsers({
        communityId,
        pageIndex: tableData.pageIndex,
        pageSize: tableData.pageSize,
        query: tableData.query,
        sort: tableData.sort,
      }),
    { revalidateOnFocus: false },
  )

  const list = (data?.list ?? []) as HardwareRow[]
  const total = Number(data?.total ?? list.length)

  const columns: ColumnDef<HardwareRow>[] = useMemo(
    () => [
      { header: 'Dispositivo', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email',
        cell: (p) => <span>{p.row.original.email || '—'}</span> },
      { header: 'Tipo', accessorKey: 'deviceType',
        cell: (p) => <span>{p.row.original.deviceType || '—'}</span> },
      { header: 'Ubicación', accessorKey: 'location',
        cell: (p) => <span>{p.row.original.location || '—'}</span> },
      { header: 'Estado', accessorKey: 'active',
        cell: (p) => <span className={p.row.original.active ? 'text-green-600' : 'text-gray-500'}>
          {p.row.original.active ? 'Activo' : 'Inactivo'}
        </span> },
    ],
    [],
  )

  // handlers locales (idénticos a tus listas)
  const handlePaginationChange = (page: number) => {
    const next = cloneDeep(tableData)
    next.pageIndex = page
    ;(key as unknown) // noop para linter
    mutate(
      apiGetHardwareUsers({
        communityId,
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        query: next.query,
        sort: next.sort,
      }),
      { revalidate: false },
    )
  }
  const handleSelectChange = (value: number) => {
    const next = cloneDeep(tableData)
    next.pageSize = Number(value)
    next.pageIndex = 1
    mutate(
      apiGetHardwareUsers({
        communityId,
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        query: next.query,
        sort: next.sort,
      }),
      { revalidate: false },
    )
  }
  const handleSort = (sort: OnSortParam) => {
    const next = cloneDeep(tableData)
    next.sort = sort
    mutate(
      apiGetHardwareUsers({
        communityId,
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
        query: next.query,
        sort: next.sort,
      }),
      { revalidate: false },
    )
  }

  return (
    <Card className="w-full">
      <div className="p-0">
        <DataTable
          columns={columns}
          data={list}
          loading={isLoading}
          noData={!isLoading && list.length === 0}
          pagingData={{
            total,
            pageIndex: tableData.pageIndex,
            pageSize: tableData.pageSize,
          }}
          onPaginationChange={handlePaginationChange}
          onSelectChange={handleSelectChange}
          onSort={handleSort}
        />
      </div>
    </Card>
  )
}
