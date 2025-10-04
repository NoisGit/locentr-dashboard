// src/views/concepts/residents/ResidentsList/components/ResidentsListTable.tsx
import { useMemo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useResidentsList from '../hooks/useResidentsList'
import { Link, useNavigate } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import useSWR from 'swr'
import ApiService from '@/services/ApiService'
import { TbPencil } from 'react-icons/tb'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { Resident } from '../types'

/* ---------------- types & helpers ---------------- */

type Rec = Record<string, unknown>
type UsersMap = Map<string, { name: string }>
type PropInfo = { number: string; floor: string | number | ''; block: string; createdAt: string }
type PropsMap = Map<string, PropInfo>

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function toText(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function isEmptyish(v: unknown) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '')
}
function valueOrDash(v: unknown): string {
  return isEmptyish(v) ? '---------' : String(v)
}
function pickNonEmpty(row: Rec | undefined, keys: string[]): unknown {
  if (!row) return undefined
  for (const k of keys) {
    const v = row[k]
    if (!isEmptyish(v)) return v
  }
  return undefined
}
/** Lee la 1ª ruta no vacía: admite ["property","floor"] */
function pickDeepNonEmpty(obj: Rec | undefined, candidates: Array<string | string[]>): unknown {
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
      if (ok && !isEmptyish(cur)) return cur
    } else {
      const v = obj[c]
      if (!isEmptyish(v)) return v
    }
  }
  return undefined
}
function getBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return ['true', '1', 'si', 'sí', 'yes'].includes(v.trim().toLowerCase())
  return false
}
function fmtDateOrDash(raw: unknown): string {
  const s = toText(raw)
  if (!s) return '---------'
  const d = new Date(s)
  return isNaN(d.getTime()) ? '---------' : d.toISOString().slice(0, 10)
}
function readList(raw: unknown): unknown[] {
  if (!raw) return []
  const candidates: unknown[] = [
    (raw as Rec)?.list,
    (raw as Rec)?.items,
    (raw as Rec)?.users,
    (raw as Rec)?.data,
    raw,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
    if (isRec(c)) {
      const arr = (c as Rec).list ?? (c as Rec).items ?? (c as Rec).users
      if (Array.isArray(arr)) return arr
    }
  }
  return []
}
function readTotal(raw: unknown): number {
  if (!isRec(raw)) return 0
  const top = Number((raw as Rec).total ?? 0)
  if (top) return top
  const d = (raw as Rec).data
  if (isRec(d)) return Number((d as Rec).total ?? 0)
  return 0
}

/* ---------------- cells ---------------- */

function NameCell({ row, usersMap }: { row: Rec; usersMap: UsersMap }) {
  const userId = String(
    pickNonEmpty(row, ['userId', 'user_id']) ?? (isRec(row.user) ? (row.user as Rec).id : '') ?? '',
  )
  const user = usersMap.get(userId)
  const label =
    user?.name ||
    (isRec(row.user) &&
      (toText((row.user as Rec).full_name) || toText((row.user as Rec).name) || toText((row.user as Rec).email))) ||
    (userId ? `ID ${userId}` : 'Sin nombre')

  return (
    <div className="flex items-center">
      <Link
        className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
        to={`/concepts/residents/residents-details/${String(row.id ?? '')}`}
      >
        {label}
      </Link>
    </div>
  )
}

const ActionColumn = ({ onEdit }: { onEdit: () => void }) => (
  <div className="flex items-center gap-3">
    <Tooltip title="Editar">
      <div className="text-xl cursor-pointer select-none font-semibold" role="button" onClick={onEdit}>
        <TbPencil />
      </div>
    </Tooltip>
  </div>
)

/* ---------------- fetch helpers (subset por IDs) ---------------- */

async function fetchUsersSubset(targetIds: string[]): Promise<UsersMap> {
  const want = new Set(targetIds.filter(Boolean))
  const out: UsersMap = new Map()
  if (want.size === 0) return out

  const limit = 100
  let pageIndex = 1

  for (;;) {
    const resp = await ApiService.fetchDataWithAxios<unknown>({
      url: '/api/v1/users/',
      method: 'get',
      params: { pageIndex, pageSize: limit },
    })
    const list = readList(resp)
    for (const u of list) {
      if (!isRec(u)) continue
      const id = String(u.id ?? (u as Rec)._id ?? '')
      if (!id || !want.has(id)) continue
      const parts = [toText((u as Rec).first_name), toText((u as Rec).last_name)].filter(Boolean).join(' ')
      const name = toText((u as Rec).full_name) || toText((u as Rec).name) || parts || toText((u as Rec).email) || `ID ${id}`
      out.set(id, { name })
      want.delete(id)
    }
    if (want.size === 0) break
    const total = readTotal(resp)
    if (list.length < limit || (total > 0 && pageIndex * limit >= total)) break
    pageIndex += 1
  }
  return out
}

async function fetchPropertiesSubset(targetIds: string[]): Promise<PropsMap> {
  const want = new Set(targetIds.filter(Boolean))
  const out: PropsMap = new Map()
  if (want.size === 0) return out

  const limit = 100
  let skip = 0

  for (;;) {
    const resp = await ApiService.fetchDataWithAxios<unknown>({
      url: '/api/v1/communities/properties',
      method: 'get',
      params: { skip, limit },
    })
    const list = readList(resp)
    for (const p of list) {
      if (!isRec(p)) continue
      const id = String((p as Rec).id ?? (p as Rec).property_id ?? '')
      if (!id || !want.has(id)) continue
      const number =
        toText((p as Rec).property_number) ||
        toText((p as Rec).number) ||
        toText((p as Rec).unit) ||
        toText((p as Rec).code) ||
        `#${id}`
      const floor = ((p as Rec).floor ?? (p as Rec).level) as string | number | ''
      const block = toText((p as Rec).block ?? (p as Rec).block_tower ?? (p as Rec).tower)
      const createdAt = toText((p as Rec).created_at ?? (p as Rec).createdAt)
      out.set(id, { number, floor: floor ?? '', block, createdAt })
      want.delete(id)
    }
    if (want.size === 0) break
    if (list.length < limit) break
    skip += limit
  }
  return out
}

/* ---------------- table ---------------- */

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

  const { selectedId: communityId } = useCommunitiesStore()

  // Ids requeridos solo de la página actual
  const { userIds, propertyIds } = useMemo(() => {
    const u = new Set<string>()
    const p = new Set<string>()
    for (const r of residentsList as unknown as Rec[]) {
      const userId = String(pickNonEmpty(r, ['userId', 'user_id']) ?? '')
      if (userId) u.add(userId)
      const pid = String(pickNonEmpty(r, ['propertyId', 'property_id']) ?? '')
      if (pid) p.add(pid)
    }
    return { userIds: Array.from(u), propertyIds: Array.from(p) }
  }, [residentsList])

  // Subsets (rápido)
  const { data: usersMap = new Map() as UsersMap } = useSWR<UsersMap>(
    ['users-subset', userIds.join(',')],
    () => fetchUsersSubset(userIds),
    { revalidateOnFocus: false },
  )

  const { data: propertiesMap = new Map() as PropsMap } = useSWR<PropsMap>(
    ['properties-subset', String(communityId ?? ''), propertyIds.join(',')],
    () => fetchPropertiesSubset(propertyIds),
    { revalidateOnFocus: false },
  )

  const columns: ColumnDef<Resident>[] = useMemo(
    () => [
      {
        header: 'Residente',
        accessorKey: 'userId',
        cell: (props) => <NameCell row={props.row.original as unknown as Rec} usersMap={usersMap} />,
      },
      {
        header: 'Propiedad',
        accessorKey: 'propertyId',
        cell: (props) => {
          const r = props.row.original as unknown as Rec
          const pid = String(pickNonEmpty(r, ['propertyId', 'property_id']) ?? (isRec(r.property) ? (r.property as Rec).id : ''))
          const info = pid ? propertiesMap.get(pid) : undefined
          const label = info?.number ? `Propiedad ${info.number}` : pid ? `Propiedad #${pid}` : '---------'
          const isOwner = getBoolean(pickNonEmpty(r, ['isOwner', 'is_owner', 'owner']))
          return <span>{isOwner ? label : label ? `Alojado en ${label}` : '---------'}</span>
        },
      },
      {
        header: 'Piso',
        accessorKey: 'floor',
        cell: (props) => {
          const r = props.row.original as unknown as Rec
          const pid = String(pickNonEmpty(r, ['propertyId', 'property_id']) ?? (isRec(r.property) ? (r.property as Rec).id : ''))
          const fromRow =
            (pickNonEmpty(r, ['floor', 'level', 'property_floor']) as string | number | undefined) ??
            (isRec(r.property) ? (pickNonEmpty(r.property as Rec, ['floor', 'level']) as string | number | undefined) : undefined)
          const floor = !isEmptyish(fromRow) ? fromRow : propertiesMap.get(pid)?.floor
          return <span>{valueOrDash(floor)}</span>
        },
      },
      {
        header: 'Torre',
        accessorKey: 'block',
        cell: (props) => {
          const r = props.row.original as unknown as Rec
          const pid = String(pickNonEmpty(r, ['propertyId', 'property_id']) ?? (isRec(r.property) ? (r.property as Rec).id : ''))
          const fromRow =
            toText(pickNonEmpty(r, ['block', 'block_tower', 'tower'])) ||
            (isRec(r.property) ? toText(pickNonEmpty(r.property as Rec, ['block', 'tower'])) : '')
          const block = fromRow || propertiesMap.get(pid)?.block || ''
          return <span>{valueOrDash(block)}</span>
        },
      },
      {
        header: 'Rol en el hogar',
        accessorKey: 'home_role',
        cell: (props) => {
          const r = props.row.original as unknown as Rec
          const role =
            toText(
              pickDeepNonEmpty(r, [
                'home_role',
                'homeRole',
                'role',
                'role_name',
                ['assignment', 'home_role'],
                ['resident', 'home_role'],
              ]),
            ) || ''
          return <span>{valueOrDash(role)}</span>
        },
      },
      {
        header: 'Dueño',
        accessorKey: 'isOwner',
        cell: (props) => {
          const r = props.row.original as unknown as Rec
          const v = getBoolean(pickNonEmpty(r, ['isOwner', 'is_owner', 'owner']))
          return <span>{v ? 'Sí' : 'No'}</span>
        },
      },
      {
        header: 'Inicio',
        accessorKey: 'startDate',
        cell: (props) => {
          const r = props.row.original as unknown as Rec
          const pid = String(pickNonEmpty(r, ['propertyId', 'property_id']) ?? (isRec(r.property) ? (r.property as Rec).id : ''))
          const fromRow = pickDeepNonEmpty(r, [
            'startDate',
            'start_date',
            'start',
            'assignment_start',
            'created_at',
            'createdAt',
            ['assignment', 'start_date'],
          ])
          const fallback = propertiesMap.get(pid)?.createdAt ?? ''
          return <span>{fmtDateOrDash(fromRow || fallback)}</span>
        },
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn onEdit={() => navigate(`/concepts/residents/residents-edit/${(props.row.original as unknown as Rec).id}`)} />
        ),
      },
    ],
    [usersMap, propertiesMap, navigate],
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    setSelectAllResidents([])
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
    if (checked) setSelectedResidents([...selectedResidents, row])
    else setSelectedResidents(selectedResidents.filter((c) => c.id !== row.id))
  }

  const handleAllRowSelect = (checked: boolean, rows: Row<Resident>[]) => {
    if (checked) setSelectAllResidents(rows.map((r) => r.original))
    else setSelectAllResidents([])
  }

  return (
    <DataTable
      selectable
      columns={columns}
      data={residentsList}
      noData={!isLoading && residentsList.length === 0}
      skeletonAvatarColumns={[]}
      loading={isLoading}
      pagingData={{
        total: residentsListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) => selectedResidents.some((s) => s.id === row.id)}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default ResidentsListTable
