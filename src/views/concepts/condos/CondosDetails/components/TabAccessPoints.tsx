import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import DataTable, { type ColumnDef, type OnSortParam } from '@/components/shared/DataTable'
import useSWR from 'swr'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetHardwareUsers, type GetHardwareListResponse, type HardwareRow } from '@/services/AccessPointsService'

type Props = {
  communityId?: number
}

type TableState = {
  pageIndex: number
  pageSize: number
  query: string
  sort: OnSortParam
}

export default function TabAccessPoints({ communityId: propCommunityId }: Props) {
  const { selectedId } = useCommunitiesStore()
  const communityId = propCommunityId ?? (selectedId ? Number(selectedId) : undefined)

  const [tableData, setTableData] = useState<TableState>({
    pageIndex: 1,
    pageSize: 10, // default 10
    query: '',
    sort: { key: 'id', order: 'desc' },
  })

  const swrKey = useMemo(
    () =>
      [
        'hardware:list',
        communityId ?? '',
        tableData.pageIndex,
        tableData.pageSize,
        tableData.query,
        String(tableData.sort?.key ?? ''),
        tableData.sort?.order ?? '',
      ] as const,
    [communityId, tableData.pageIndex, tableData.pageSize, tableData.query, tableData.sort?.key, tableData.sort?.order],
  )

  const { data, isLoading } = useSWR<GetHardwareListResponse>(
    swrKey,
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
      { header: 'Rol', accessorKey: 'role', cell: (p) => <span>{p.row.original.role || '—'}</span> },
      { header: 'Comunidad', accessorKey: 'community', cell: (p) => <span>{p.row.original.community || '—'}</span> },
      { header: 'Ubicación', accessorKey: 'location', cell: (p) => <span>{p.row.original.location || '—'}</span> },
      {
        header: 'Estado',
        accessorKey: 'active',
        cell: (p) => (
          <span className={p.row.original.active ? 'text-green-600' : 'text-gray-500'}>
            {p.row.original.active ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
    ],
    [],
  )

  const handlePaginationChange = (page: number) => {
    setTableData((prev) => ({ ...prev, pageIndex: page }))
  }
  const handleSelectChange = (value: number) => {
    setTableData((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 1 }))
  }
  const handleSort = (sort: OnSortParam) => {
    setTableData((prev) => ({ ...prev, sort }))
  }

  const tableKey = useMemo(() => {
    const sKey = tableData.sort?.key ?? ''
    const sOrd = tableData.sort?.order ?? ''
    const q = tableData.query ?? ''
    return `${tableData.pageIndex}-${tableData.pageSize}-${sKey}-${sOrd}-${q}-${communityId ?? ''}`
  }, [tableData, communityId])

  return (
    <Card className="w-full">
      <div className="p-0">
        <DataTable
          key={tableKey}
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
