// src/views/concepts/mailbox/MailboxList/components/MailboxListTable.tsx
import { useMemo, useCallback, useState } from 'react'
import DataTable from '@/components/shared/DataTable'
import Tooltip from '@/components/ui/Tooltip'
import useMailboxList from '../hooks/useMailboxList'
import cloneDeep from 'lodash/cloneDeep'
import { TbEye } from 'react-icons/tb'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import type { MailboxEntry } from '../types'

const EMPTY = '-------'

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null

function pickFirst(row: unknown, keys: string[]): unknown {
  if (!isRec(row)) return undefined
  for (const k of keys) {
    const val = (row as Rec)[k]
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
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    const s = String(v)
    return s.trim() === '' ? EMPTY : s
  }
  return EMPTY
}

function readBool(row: unknown, keys: string[]): boolean {
  const v = pickFirst(row, keys)
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return ['true', '1', 'yes', 'si', 'sí'].includes(v.trim().toLowerCase())
  return false
}

function readPropertyNumber(row: unknown): string {
  const direct = readStr(row, ['property_number', 'propertyNumber', 'unit', 'apartment', 'apt'])
  if (direct !== EMPTY) return direct
  if (isRec(row)) {
    const prop = (row as Rec)['property']
    if (isRec(prop)) {
      const nested = readStr(prop, ['number', 'propertyNumber', 'code', 'name', 'id'])
      if (nested !== EMPTY) return nested
    }
  }
  const maybeId = readStr(row, ['property_id', 'propertyId'])
  return maybeId !== EMPTY ? maybeId : EMPTY
}

function readBlock(row: unknown): string {
  const direct = readStr(row, ['block', 'block_tower', 'tower'])
  if (direct !== EMPTY) return direct
  if (isRec(row) && isRec((row as Rec)['property'])) {
    const prop = (row as Rec)['property'] as Rec
    const nested = readStr(prop, ['block', 'block_tower', 'tower'])
    if (nested !== EMPTY) return nested
  }
  return EMPTY
}

function readFloor(row: unknown): string {
  const direct = readStr(row, ['floor', 'level'])
  if (direct !== EMPTY) return direct
  if (isRec(row) && isRec((row as Rec)['property'])) {
    const prop = (row as Rec)['property'] as Rec
    const nested = readStr(prop, ['floor', 'level'])
    if (nested !== EMPTY) return nested
  }
  return EMPTY
}

/** Lee una URL de imagen desde varias posibles keys y valida http(s) */
function readImageUrl(row: unknown): string | null {
  const candidates = [
    'image_url',
    'imageUrl',
    'photo_url',
    'photoUrl',
    'image',
    'photo',
  ]
  let v = pickFirst(row, candidates)
  if (isRec(v)) {
    // por si viene como { url: '...' }
    v = (v as Rec).url ?? (v as Rec).href
  }
  const url = typeof v === 'string' ? v.trim() : ''
  if (!url) return null
  try {
    const u = new URL(url, window.location.origin)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
  } catch {
    // ignorar
  }
  return null
}

const RecipientColumn = ({ row }: { row: MailboxEntry }) => {
  const id = resolveIdFromRow(row)
  const name =
    readStr(row, ['recipient_name', 'recipientName', 'recipient']) ||
    (id ? `#${id}` : EMPTY)
  return (
    <div className="flex items-center">
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {name === '' ? EMPTY : name}
      </span>
    </div>
  )
}

const MailboxListTable = () => {
  const { mailboxList, mailboxListTotal, tableData, isLoading, setTableData } = useMailboxList()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fmtDate = useCallback((v?: string) => {
    if (!v) return EMPTY
    const d = new Date(v)
    return isNaN(d.getTime()) ? EMPTY : d.toLocaleString()
  }, [])

  const columns: ColumnDef<MailboxEntry>[] = useMemo(
    () => [
      {
        header: <span className="whitespace-nowrap">Nº Propiedad</span>,
        accessorKey: 'property_number',
        cell: (props) => {
          const num = readPropertyNumber(props.row.original)
          return <span className="font-medium">{num}</span>
        },
      },
      {
        header: <span className="whitespace-nowrap">Piso</span>,
        accessorKey: 'floor',
        cell: (props) => <span>{readFloor(props.row.original)}</span>,
      },
      {
        header: <span className="whitespace-nowrap">Torre</span>,
        accessorKey: 'block',
        cell: (props) => <span>{readBlock(props.row.original)}</span>,
      },
      {
        header: 'Destinatario',
        accessorKey: 'recipient_name',
        cell: (props) => <RecipientColumn row={props.row.original} />,
      },
      {
        header: 'Descripción',
        accessorKey: 'description',
        cell: (props) => <span>{readStr(props.row.original, ['description'])}</span>,
      },
      {
        header: 'Nº de seguimiento',
        accessorKey: 'tracking_number',
        cell: (props) => <span>{readStr(props.row.original, ['tracking_number', 'trackingNumber'])}</span>,
      },
      {
        header: 'Empresa de envío',
        accessorKey: 'delivery_company',
        cell: (props) => <span>{readStr(props.row.original, ['delivery_company', 'deliveryCompany'])}</span>,
      },
      {
        header: 'Creado',
        accessorKey: 'created_at',
        cell: (props) => {
          const createdAt = readStr(props.row.original, ['created_at', 'createdAt', 'created'])
          return <span>{createdAt === EMPTY ? EMPTY : fmtDate(createdAt)}</span>
        },
      },
      {
        header: 'Entregado',
        accessorKey: 'is_delivered',
        cell: (props) => {
          const delivered = readBool(props.row.original, ['is_delivered', 'isDelivered', 'delivered'])
          return <span>{delivered ? 'Sí' : 'No'}</span>
        },
      },
      {
        header: 'Entregado el',
        accessorKey: 'delivered_at',
        cell: (props) => {
          const deliveredAt = readStr(props.row.original, ['delivered_at', 'deliveredAt'])
          return <span>{deliveredAt === EMPTY ? EMPTY : fmtDate(deliveredAt)}</span>
        },
      },
      // === NUEVA COLUMNA: Ver imagen ===
      {
        header: 'Ver imagen',
        id: 'view_image',
        cell: (props) => {
          const url = readImageUrl(props.row.original)
          if (!url) return <span className="text-gray-400">{EMPTY}</span>
          return (
            <Tooltip title="Ver imagen">
              <button
                type="button"
                className="text-xl cursor-pointer select-none p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setPreviewUrl(url)}
              >
                <TbEye />
              </button>
            </Tooltip>
          )
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
    <>
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

      {/* Lightbox simple */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewUrl}
              alt="Imagen de casilla"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
            <button
              type="button"
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black shadow font-bold"
              onClick={() => setPreviewUrl(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MailboxListTable
