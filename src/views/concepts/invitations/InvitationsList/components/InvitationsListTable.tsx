// src/views/concepts/invitations/InvitationsList/components/InvitationsListTable.tsx
import { useMemo, useCallback } from 'react'
import DataTable from '@/components/shared/DataTable'
import useInvitationsList from '../hooks/useInvitationsList'
import cloneDeep from 'lodash/cloneDeep'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { InvitationEntry } from '../types'

const EMPTY = '-------'
type Rec = Record<string, unknown>

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}
function pickFirst(row: Rec, keys: string[]) {
  for (const k of keys) {
    const v = row[k]
    if (v !== undefined && v !== null && String(v) !== '') return v
  }
  return undefined
}
function toText(v: unknown) {
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    const s = String(v)
    return s.trim() === '' ? EMPTY : s
  }
  return EMPTY
}
function getFlat(row: Rec, keys: string[]) {
  return toText(pickFirst(row, keys))
}
function getNested(row: Rec, objKey: string, keys: string[]) {
  const obj = isRec(row[objKey]) ? (row[objKey] as Rec) : undefined
  return obj ? getFlat(obj, keys) : EMPTY
}

function getPropertyNumber(row: Rec) {
  const flat = getFlat(row, ['propertyNumber', 'property_number', 'propertyId', 'property_id'])
  if (flat !== EMPTY) return flat
  const nested = getNested(row, 'resident', ['property_number', 'propertyNumber', 'property_id', 'propertyId'])
  return nested !== EMPTY ? nested : EMPTY
}
function getPropertyFloor(row: Rec) {
  const flat = getFlat(row, ['floor', 'level', 'property_floor'])
  if (flat !== EMPTY) return flat
  const nested = getNested(row, 'resident', ['floor', 'level'])
  return nested !== EMPTY ? nested : EMPTY
}
function getPropertyBlock(row: Rec) {
  const flat = getFlat(row, ['block', 'block_tower', 'tower'])
  if (flat !== EMPTY) return flat
  const nested = getNested(row, 'resident', ['block', 'block_tower', 'tower'])
  return nested !== EMPTY ? nested : EMPTY
}

function getResidentName(row: Rec) {
  const flat = getFlat(row, ['residentName', 'createdByName', 'invitedByName', 'resident_user_name', 'user_name'])
  if (flat !== EMPTY) return flat
  const nested = getNested(row, 'resident', ['user_name', 'name', 'full_name'])
  return nested !== EMPTY ? nested : EMPTY
}

function getGuestName(row: Rec) {
  const nested = getNested(row, 'external_person', ['full_name'])
  if (nested !== EMPTY) return nested
  const flat = getFlat(row, ['externalPersonName', 'external_person_full_name', 'guest_name', 'name'])
  return flat !== EMPTY ? flat : EMPTY
}
function getGuestIdNumber(row: Rec) {
  const nested = getNested(row, 'external_person', ['id_number'])
  if (nested !== EMPTY) return nested
  const flat = getFlat(row, ['externalPersonIdNumber', 'external_person_id_number', 'id_number'])
  return flat !== EMPTY ? flat : EMPTY
}
function getGuestContact(row: Rec) {
  const nested = getNested(row, 'external_person', ['contact_info'])
  if (nested !== EMPTY) return nested
  const flat = getFlat(row, ['externalPersonContact', 'external_person_contact_info', 'contact_info', 'phone', 'email'])
  return flat !== EMPTY ? flat : EMPTY
}

const InvitationsListTable = () => {
  const { invitationsList, invitationsListTotal, tableData, isLoading, setTableData } = useInvitationsList()

  const fmtDate = useCallback((v?: string) => {
    if (!v) return EMPTY
    const d = new Date(v)
    return isNaN(d.getTime()) ? EMPTY : d.toLocaleString()
  }, [])

  const columns: ColumnDef<InvitationEntry>[] = useMemo(
    () => [
      {
        header: 'PROPIEDAD',
        accessorKey: 'resident.property_number',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span className="font-medium">{getPropertyNumber(row)}</span>
        },
      },
      {
        header: 'PISO',
        accessorKey: 'resident.floor',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span>{getPropertyFloor(row)}</span>
        },
      },
      {
        header: 'TORRE',
        accessorKey: 'resident.block',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span>{getPropertyBlock(row)}</span>
        },
      },
      {
        header: 'RESIDENTE',
        accessorKey: 'resident.user_name',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span className="font-medium">{getResidentName(row)}</span>
        },
      },
      {
        header: 'NOMBRE INVITADO',
        accessorKey: 'external_person.full_name',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span>{getGuestName(row)}</span>
        },
      },
      {
        header: 'ID INVITADO',
        accessorKey: 'external_person.id_number',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span>{getGuestIdNumber(row)}</span>
        },
      },
      {
        header: 'CONTACTO INVITADO',
        accessorKey: 'external_person.contact_info',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          return <span>{getGuestContact(row)}</span>
        },
      },
      {
        header: 'FECHA CREACIÓN',
        accessorKey: 'created_at',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          const raw = getFlat(row, ['created_at', 'createdAt'])
          return <span>{raw === EMPTY ? EMPTY : fmtDate(raw)}</span>
        },
      },
      {
        header: 'FECHA EXPIRACIÓN',
        accessorKey: 'expiration_at',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          const raw = getFlat(row, ['expiration_at', 'expirationAt'])
          return <span>{raw === EMPTY ? EMPTY : fmtDate(raw)}</span>
        },
      },
      {
        header: 'USADA',
        accessorKey: 'used',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          const v = pickFirst(row, ['used', 'is_used'])
          const b =
            typeof v === 'boolean'
              ? v
              : ['true', '1', 'yes', 'si', 'sí'].includes(String(v ?? '').trim().toLowerCase())
          return <span>{b ? 'Sí' : 'No'}</span>
        },
      },
      {
        header: 'FECHA USO',
        accessorKey: 'used_at',
        cell: (props) => {
          const row = props.row.original as unknown as Rec
          const raw = getFlat(row, ['used_at', 'usedAt'])
          return <span>{raw === EMPTY ? EMPTY : fmtDate(raw)}</span>
        },
      },
    ],
    [fmtDate],
  )

  const handleSetTableData = (data: TableQueries) => setTableData(data)
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

  return (
    <DataTable
      columns={columns}
      data={invitationsList}
      noData={!isLoading && invitationsList.length === 0}
      loading={isLoading}
      pagingData={{
        total: invitationsListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
    />
  )
}

export default InvitationsListTable
