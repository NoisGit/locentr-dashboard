// src/services/MailboxService.ts
import ApiService from '@/services/ApiService'

export const MAILBOX_BASE = '/api/v1/mailboxes/community'
export const MAILBOX_ENTRY_BASE = '/api/v1/mailboxes/entries'

export type MailboxTableQueries = {
  pageIndex?: number
  pageSize?: number
  skip?: number
  limit?: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  folder?: string
  subject?: string
  communityId?: string | number
  recipientName?: string
  trackingNumber?: string
  deliveryCompany?: string
  deliveredOnly?: boolean
  [k: string]: unknown
}

export type MailboxRow = {
  id: string | number
  description: string
  recipientName: string
  trackingNumber: string
  deliveryCompany: string
  createdAt: string
  createdByGuard: string | number | ''
  createdBy: string | number | ''
  isDelivered: boolean
  deliveredAt: string
  deliveredByGuard: string | number | ''
  imageUrl: string
  folder: string
  subject: string
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function get(obj: unknown, key: string): unknown {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key)
    ? (obj as Record<string, unknown>)[key]
    : undefined
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function toString(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function toBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return ['true', '1', 'yes', 'si', 'sí'].includes(v.trim().toLowerCase())
  return false
}

function withPagination(params: Record<string, unknown>) {
  const p: Record<string, unknown> = { ...params }
  const pageIndex = Math.max(1, Number((p.pageIndex as number | undefined) ?? 1))
  const sizeRaw = Number((p.pageSize as number | undefined) ?? 10)
  const pageSize = Number.isFinite(sizeRaw) ? sizeRaw : 10
  const limit = Math.min(100, Math.max(1, pageSize))
  const skip = (pageIndex - 1) * limit
  if (typeof p.skip === 'undefined') p.skip = skip
  if (typeof p.limit === 'undefined') p.limit = limit
  delete p.pageIndex
  delete p.pageSize
  return p
}

function buildCommunityEntriesUrl(communityId: string | number | undefined | null) {
  if (communityId == null || String(communityId) === '') return null
  return `${MAILBOX_BASE}/${encodeURIComponent(String(communityId))}/entries`
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const candidates = [
    get(raw, 'entries'),
    get(raw, 'items'),
    get(raw, 'list'),
    get(get(raw, 'data'), 'entries'),
    get(get(raw, 'data'), 'items'),
    get(get(raw, 'data'), 'results'),
    get(raw, 'data'),
    get(raw, 'results'),
    raw,
  ]
  let items: unknown[] = []
  for (const c of candidates) {
    const arr = asArray(c)
    if (arr.length) {
      items = arr
      break
    }
  }
  const totalRaw =
    get(raw, 'total') ??
    get(raw, 'count') ??
    get(get(raw, 'data'), 'total') ??
    get(get(raw, 'pagination'), 'total') ??
    items.length
  return { items, total: Number(totalRaw ?? items.length) }
}

function pickIdFlat(o: Record<string, unknown>): string | number | '' {
  const keys = [
    'id',
    '_id',
    'uuid',
    'entry_id',
    'entryId',
    'mailbox_entry_id',
    'mailboxEntryId',
    'mailbox_id',
    'mailboxId',
    'mail_id',
    'mailId',
    'package_id',
    'packageId',
    'parcel_id',
    'parcelId',
  ]
  for (const k of keys) {
    const v = o[k]
    if (v !== undefined && v !== null && String(v) !== '') return v as string | number
  }
  return ''
}

function pickIdDeep(o: Record<string, unknown>): string | number | '' {
  const direct = pickIdFlat(o)
  if (direct !== '') return direct
  const nestedKeys = ['entry', 'mailbox', 'mail', 'package', 'parcel', 'node', 'item', 'data', 'attributes']
  for (const nk of nestedKeys) {
    const child = get(o, nk)
    if (isObject(child)) {
      const nid = pickIdFlat(child)
      if (nid !== '') return nid
    }
  }
  const href = toString(get(o, 'url') ?? get(o, 'href') ?? get(o, 'link'))
  if (href) {
    const m = href.match(/\/entries\/([^/?#]+)/i)
    if (m && m[1]) return m[1]
  }
  return ''
}

function joinName(first: string, last: string, email: string) {
  const a = [first, last].map((s) => s.trim()).filter(Boolean)
  if (a.length) return a.join(' ')
  return email || ''
}

function toMailboxRow(v: unknown): MailboxRow {
  const o = isObject(v) ? v : {}
  const first = toString(get(o, 'recipientFirstName') ?? get(o, 'first_name') ?? get(o, 'recipient_first_name'))
  const last = toString(get(o, 'recipientLastName') ?? get(o, 'last_name') ?? get(o, 'recipient_last_name'))
  const email = toString(get(o, 'recipientEmail') ?? get(o, 'email') ?? get(o, 'recipient_email'))
  const composedRecipient = joinName(first, last, email)
  return {
    id: pickIdDeep(o),
    description: toString(get(o, 'description') ?? get(o, 'notes') ?? get(o, 'note') ?? get(o, 'observations')),
    recipientName: toString(get(o, 'recipientName') ?? get(o, 'recipient_name') ?? get(o, 'recipient') ?? composedRecipient),
    trackingNumber: toString(
      get(o, 'trackingNumber') ??
      get(o, 'tracking_number') ??
      get(o, 'tracking') ??
      get(o, 'guide') ??
      get(o, 'trackingCode') ??
      get(o, 'tracking_code') ??
      get(o, 'code')
    ),
    deliveryCompany: toString(
      get(o, 'deliveryCompany') ??
      get(o, 'delivery_company') ??
      get(o, 'company') ??
      get(o, 'carrier') ??
      get(o, 'courier') ??
      get(o, 'delivery_company_name')
    ),
    createdAt: toString(get(o, 'createdAt') ?? get(o, 'created_at') ?? get(o, 'created') ?? get(o, 'received_at') ?? get(o, 'receivedAt')),
    createdByGuard: (get(o, 'createdByGuard') ?? get(o, 'created_by_guard') ?? '') as string | number | '',
    createdBy: (get(o, 'created_by') ?? get(o, 'createdBy') ?? '') as string | number | '',
    isDelivered: toBoolean(
      get(o, 'isDelivered') ??
      get(o, 'is_delivered') ??
      get(o, 'delivered') ??
      get(o, 'picked_up') ??
      get(o, 'is_picked_up') ??
      (toString(get(o, 'status')).toLowerCase() === 'delivered')
    ),
    deliveredAt: toString(get(o, 'deliveredAt') ?? get(o, 'delivered_at') ?? get(o, 'picked_up_at') ?? get(o, 'pickedUpAt')),
    deliveredByGuard: (get(o, 'deliveredByGuard') ?? get(o, 'delivered_by_guard') ?? '') as string | number | '',
    imageUrl: toString(
      get(o, 'imageUrl') ?? get(o, 'image_url') ?? get(o, 'image') ?? get(o, 'img') ?? get(o, 'photo_url') ?? get(o, 'picture') ?? get(o, 'thumbnail') ?? get(o, 'thumb_url')
    ),
    folder: toString(get(o, 'folder')),
    subject: toString(get(o, 'subject')),
  }
}

export async function apiGetMailboxList<
  T = { list: MailboxRow[]; total: number },
  U extends MailboxTableQueries = MailboxTableQueries
>(params: U) {
  const { communityId, ...rest } = params
  const url = buildCommunityEntriesUrl(communityId as string | number | undefined)
  if (!url) return { list: [], total: 0 } as T
  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url,
    method: 'get',
    params: withPagination(rest as Record<string, unknown>),
  })
  const { items, total } = pickItemsAndTotal(resp)
  const list = items.map(toMailboxRow)
  return { list, total } as T
}

export async function apiGetMailbox<
  T = unknown,
  U extends { id: string | number } & Record<string, unknown> = { id: string | number }
>({ id, ...params }: U) {
  return ApiService.fetchDataWithAxios<T, Record<string, unknown>>({
    url: `${MAILBOX_ENTRY_BASE}/${encodeURIComponent(String(id))}`,
    method: 'get',
    params,
  })
}

const MailboxApi = {
  apiGetMailboxList,
  apiGetMailbox,
}

export default MailboxApi
