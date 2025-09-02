import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useResidentsList from '../hooks/useResidentsList'
import { Link, useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import useSWR from 'swr'
import ApiService from '@/services/ApiService'
import { TbPencil } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { Resident } from '../types'

type NameCellProps = {
  row: any
  usersMap: Map<string, { name: string; avatar?: string }>
}

function NameCell({ row, usersMap }: NameCellProps) {
  const userId = String(row?.userId ?? row?.user_id ?? row?.user?.id ?? '')
  const user = usersMap.get(userId)
  const label =
    user?.name ||
    row?.user?.full_name ||
    row?.user?.name ||
    row?.user?.email ||
    (userId ? `ID ${userId}` : 'Sin nombre')
  const avatar =
    user?.avatar ||
    row?.user?.avatar ||
    row?.user?.avatar_url ||
    row?.avatar ||
    ''
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={avatar} />
      <Link
        className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/residents/residents-details/${row?.id}`}
      >
        {label}
      </Link>
    </div>
  )
}

function getBoolean(v: any): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return ['true', '1', 'si', 'sí', 'yes'].includes(v.trim().toLowerCase())
  return false
}

function fmtDate(raw: any): string {
  const d = raw ? new Date(raw) : null
  if (d && !isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return String(raw || '')
}

async function fetchUsersMap() {
  const limit = 100
  let pageIndex = 1
  const map = new Map<string, { name: string; avatar?: string }>()
  while (true) {
    const resp = await ApiService.fetchDataWithAxios<any>({
      url: '/api/v1/users/',
      method: 'get',
      params: { pageIndex, pageSize: limit },
    })
    const list =
      (Array.isArray(resp?.list) && resp.list) ||
      (Array.isArray(resp?.items) && resp.items) ||
      (Array.isArray(resp?.users) && resp.users) ||
      (Array.isArray(resp?.data?.list) && resp.data.list) ||
      (Array.isArray(resp?.data?.items) && resp.data.items) ||
      (Array.isArray(resp?.data?.users) && resp.data.users) ||
      (Array.isArray(resp?.data) && resp.data) ||
      (Array.isArray(resp) && resp) ||
      []
    list.forEach((u: any) => {
      const id = String(u?.id ?? u?._id ?? '')
      const parts = [u?.first_name, u?.last_name].filter(Boolean).join(' ')
      const name = String(u?.full_name || u?.name || parts || u?.email || `ID ${id}`)
      const avatar = u?.avatar ?? u?.avatar_url ?? u?.photoURL ?? u?.photo_url ?? ''
      if (id) map.set(id, { name, avatar })
    })
    const total =
      Number(resp?.total ?? resp?.data?.total ?? resp?.pagination?.total ?? 0) || 0
    if (list.length < limit || pageIndex * limit >= total) break
    pageIndex += 1
  }
  return map
}

async function fetchPropertiesMap() {
  const limit = 100
  let skip = 0
  const map = new Map<string, string>()
  while (true) {
    const resp = await ApiService.fetchDataWithAxios<any>({
      url: '/api/v1/communities/properties',
      method: 'get',
      params: { skip, limit },
    })
    const list =
      (Array.isArray(resp?.list) && resp.list) ||
      (Array.isArray(resp?.items) && resp.items) ||
      (Array.isArray(resp?.data?.list) && resp.data.list) ||
      (Array.isArray(resp?.data?.items) && resp.data.items) ||
      (Array.isArray(resp?.data) && resp.data) ||
      (Array.isArray(resp) && resp) ||
      []
    list.forEach((p: any) => {
      const id = String(p?.id ?? p?.property_id ?? '')
      const num = p?.property_number ?? p?.number ?? p?.unit ?? p?.code ?? ''
      const label = num ? `Propiedad ${String(num)}` : (id ? `Propiedad #${id}` : 'Propiedad')
      if (id) map.set(id, label)
    })
    if (list.length < limit) break
    skip += limit
  }
  return map
}

const ActionColumn = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <div className="flex items-center gap-3">
      <Tooltip title="Editar">
        <div
          className="text-xl cursor-pointer select-none font-semibold"
          role="button"
          onClick={onEdit}
        >
          <TbPencil />
        </div>
      </Tooltip>
    </div>
  )
}

const ResidentsListTable = () => {
  const navigate = useNavigate()
  const {
    residentsList,
    residentsListTotal,
    tableData,
    isLoading,
    setTableData,
    setSelectAllResidents,
    setSelectedResidents,
    selectedResidents,
  } = useResidentsList()

  const { data: usersMap = new Map() } = useSWR('users-map', fetchUsersMap, { revalidateOnFocus: false })
  const { data: propertiesMap = new Map() } = useSWR('properties-map', fetchPropertiesMap, { revalidateOnFocus: false })

  const columns: ColumnDef<Resident>[] = useMemo(
    () => [
      {
        header: 'Residente',
        accessorKey: 'userId',
        cell: (props) => <NameCell row={props.row.original} usersMap={usersMap} />,
      },
      {
        header: 'Propiedad',
        accessorKey: 'propertyId',
        cell: (props) => {
          const r: any = props.row.original
          const pid = String(r?.propertyId ?? r?.property_id ?? r?.property?.id ?? '')
          const label = propertiesMap.get(pid) || (pid ? `Propiedad #${pid}` : '')
          const isOwner = getBoolean(r?.isOwner ?? r?.is_owner ?? r?.owner)
          return <span>{isOwner ? label : (label ? `Alojado en ${label}` : '')}</span>
        },
      },
      {
        header: 'Dueño',
        accessorKey: 'isOwner',
        cell: (props) => {
          const r: any = props.row.original
          const v = getBoolean(r?.isOwner ?? r?.is_owner ?? r?.owner)
          return <span>{v ? 'Sí' : 'No'}</span>
        },
      },
      {
        header: 'Inicio',
        accessorKey: 'startDate',
        cell: (props) => {
          const r: any = props.row.original
          const raw = r?.startDate ?? r?.start_date ?? r?.start ?? r?.created_at ?? ''
          return <span>{fmtDate(raw)}</span>
        },
      },
      {
        header: 'Término',
        accessorKey: 'endDate',
        cell: (props) => {
          const r: any = props.row.original
          const raw = r?.endDate ?? r?.end_date ?? r?.end ?? r?.finish_date ?? ''
          return <span>{fmtDate(raw)}</span>
        },
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn onEdit={() => navigate(`/concepts/residents/residents-edit/${props.row.original.id}`)} />
        ),
      },
    ],
    [usersMap, propertiesMap, navigate],
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedResidents.length > 0) {
      setSelectAllResidents([])
    }
  }

  const handlePaginationChange = (page: number) => {
    const newTableData = cloneDeep(tableData)
    newTableData.pageIndex = page
    handleSetTableData(newTableData)
  }

  const handleSelectChange = (value: number) => {
    const newTableData = cloneDeep(tableData)
    newTableData.pageSize = Number(value)
    newTableData.pageIndex = 1
    handleSetTableData(newTableData)
  }

  const handleSort = (sort: OnSortParam) => {
    const newTableData = cloneDeep(tableData)
    newTableData.sort = sort
    handleSetTableData(newTableData)
  }

  const handleRowSelect = (checked: boolean, row: Resident) => {
    if (checked) {
      setSelectedResidents([...selectedResidents, row])
    } else {
      setSelectedResidents(selectedResidents.filter((c) => c.id !== row.id))
    }
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Resident>[]) => {
    if (checked) {
      const originalRows = rows.map((row) => row.original)
      setSelectAllResidents(originalRows)
    } else {
      setSelectAllResidents([])
    }
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={residentsList}
      noData={!isLoading && residentsList.length === 0}
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
      loading={isLoading}
      pagingData={{
        total: residentsListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) =>
        selectedResidents.some((selected) => selected.id === row.id)
      }
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default ResidentsListTable
