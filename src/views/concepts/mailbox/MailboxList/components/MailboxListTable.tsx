// src/views/concepts/mailbox/MailboxList/components/MailboxListTable.tsx
import { useMemo, useCallback } from 'react'
import DataTable from '@/components/shared/DataTable'
import useMailboxList from '../hooks/useMailboxList'
import cloneDeep from 'lodash/cloneDeep'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { MailboxEntry } from '../types'

type Rec = Record<string, unknown>

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null
}

function pickFirst(row: unknown, keys: string[]): unknown {
  if (!isRec(row)) return undefined
  for (const k of keys) {
    const val = row[k]
    if (val !== undefined && val !== null && String(val) !== '') return val
  }
  return undefined
}

function resolveIdFromRow(row: unknown): string {
  const candidate = pickFirst(row, [
    'id',
    'entry_id',
    'entryId',
    'mailbox_entry_id',
    'mailboxEntryId',
    'mailbox_id',
    'mailboxId',
    'package_id',
    'packageId',
    '_id',
  ])
  return candidate !== undefined ? String(candidate) : ''
}

function readStr(row: unknown, keys: string[]): string {
  const v = pickFirst(row, keys)
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
    ? String(v)
    : ''
}

function readBool(row: unknown, keys: string[]): boolean {
  const v = pickFirst(row, keys)
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return ['true', '1', 'yes', 'si', 'sí'].includes(v.trim().toLowerCase())
  return false
}

const RecipientColumn = ({ row }: { row: MailboxEntry }) => {
  const id = resolveIdFromRow(row)
  const name = readStr(row, ['recipientName', 'recipient_name', 'recipient']) || (id ? `#${id}` : '#')
  return (
    <div className="flex items-center">
      <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
    </div>
  )
}

const MailboxListTable = () => {
  const { mailboxList, mailboxListTotal, tableData, isLoading, setTableData } = useMailboxList()

  const fmtDate = useCallback((v?: string) => (v ? new Date(v).toLocaleString() : ''), [])

  const columns: ColumnDef<MailboxEntry>[] = useMemo(
    () => [
      {
        header: 'Destinatario',
        accessorKey: 'recipientName',
        cell: (props) => <RecipientColumn row={props.row.original} />,
      },
      { header: 'Descripción', accessorKey: 'description' },
      { header: 'Nº de seguimiento', accessorKey: 'trackingNumber' },
      { header: 'Empresa de envío', accessorKey: 'deliveryCompany' },
      {
        header: 'Creado',
        accessorKey: 'createdAt',
        cell: (props) => {
          const createdAt = readStr(props.row.original, ['createdAt', 'created_at', 'created'])
          return <span>{fmtDate(createdAt)}</span>
        },
      },
      {
        header: 'Entregado',
        accessorKey: 'isDelivered',
        cell: (props) => {
          const delivered = readBool(props.row.original, ['isDelivered', 'is_delivered', 'delivered'])
          return <span>{delivered ? 'Sí' : 'No'}</span>
        },
      },
      {
        header: 'Entregado el',
        accessorKey: 'deliveredAt',
        cell: (props) => {
          const deliveredAt = readStr(props.row.original, ['deliveredAt', 'delivered_at'])
          return <span>{fmtDate(deliveredAt)}</span>
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
      data={mailboxList}
      noData={!isLoading && mailboxList.length === 0}
      loading={isLoading}
      pagingData={{
        total: mailboxListTotal,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
    />
  )
}

export default MailboxListTable
