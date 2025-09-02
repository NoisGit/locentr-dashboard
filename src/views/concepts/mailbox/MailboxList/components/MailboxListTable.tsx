// src/views/concepts/mailbox/MailboxList/components/MailboxListTable.tsx
import { useMemo, useCallback } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useMailboxList from '../hooks/useMailboxList'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbEye } from 'react-icons/tb'
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
  const to = id ? `/concepts/mailbox/mailbox-details/${id}` : `/concepts/mailbox/mailbox-list`
  const img = readStr(row, ['imageUrl', 'image_url', 'img', 'photo_url', 'picture', 'image'])
  const name = readStr(row, ['recipientName', 'recipient_name', 'recipient']) || (id ? `#${id}` : '#')
  return (
    <div className="flex items-center">
      <Avatar size={40} shape="circle" src={img} />
      {id ? (
        <Link
          className="hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100"
          to={to}
        >
          {name}
        </Link>
      ) : (
        <span className="ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100">{name}</span>
      )}
    </div>
  )
}

const ActionColumn = ({ onViewDetail }: { onViewDetail: () => void }) => (
  <div className="flex items-center gap-3">
    <Tooltip title="Ver detalle">
      <div
        className="text-xl cursor-pointer select-none font-semibold"
        role="button"
        onClick={onViewDetail}
      >
        <TbEye />
      </div>
    </Tooltip>
  </div>
)

const MailboxListTable = () => {
  const navigate = useNavigate()

  const { mailboxList, mailboxListTotal, tableData, isLoading, setTableData } = useMailboxList()

  const handleViewDetails = useCallback(
    (entry: MailboxEntry) => {
      const id = resolveIdFromRow(entry)
      if (id) navigate(`/concepts/mailbox/mailbox-details/${id}`)
    },
    [navigate],
  )

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
      {
        header: '',
        id: 'action',
        cell: (props) => <ActionColumn onViewDetail={() => handleViewDetails(props.row.original)} />,
      },
    ],
    [handleViewDetails, fmtDate],
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
      skeletonAvatarColumns={[0]}
      skeletonAvatarProps={{ width: 28, height: 28 }}
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
