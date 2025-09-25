// src/services/NewsService.ts
import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}

export type ArticleRow = {
  id: number | string
  title: string
  content?: string
  createdAt?: string
  updatedAt?: string
  author?: string
  status?: string
}

export type GetArticleListResponse = {
  list: ArticleRow[]
  total: number
}

export type NewsDetail = {
  id: string | number
  title: string
  content: string
  created_by?: string
  created_by_user_id?: number | string   // ← NUEVO
  updated_at?: string
}

type Dict = Record<string, unknown>

function isRec(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}
function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function toId(v: unknown): number | string | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') return v
  return undefined
}

/* ---------- LISTADO ---------- */

function pickArray(raw: unknown): unknown[] {
  const r = isRec(raw) ? (raw as Dict) : {}
  return (
    (Array.isArray(r.items) && r.items) ||
    (Array.isArray(r.list) && r.list) ||
    (Array.isArray(r.results) && r.results) ||
    (isRec(r.data) && Array.isArray((r.data as Dict).items) && ((r.data as Dict).items as unknown[])) ||
    (isRec(r.data) && Array.isArray((r.data as Dict).list) && ((r.data as Dict).list as unknown[])) ||
    (isRec(r.data) && Array.isArray((r.data as Dict).results) && ((r.data as Dict).results as unknown[])) ||
    (Array.isArray(r.data) && (r.data as unknown[])) ||
    (Array.isArray(raw) && (raw as unknown[])) ||
    []
  )
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const r = isRec(raw) ? (raw as Dict) : {}
  const items = pickArray(raw)
  const cand =
    (r.total as unknown) ??
    (r.count as unknown) ??
    (isRec(r.data) ? (r.data as Dict).total : undefined) ??
    (isRec(r.pagination) ? (r.pagination as Dict).total : undefined) ??
    items.length
  return { items, total: Number(cand) }
}

function mapArticle(u: unknown): ArticleRow {
  const r = isRec(u) ? (u as Dict) : {}
  const id = toStr(r.id ?? r.news_id ?? r._id)
  const title = toStr(r.title) || toStr(r.name) || (id ? `#${id}` : '')
  const content = toStr(r.content ?? r.body ?? r.text)
  const createdAt = toStr(r.createdAt ?? r.created_at ?? r.created)
  const updatedAt = toStr(r.updatedAt ?? r.updated_at ?? r.updated ?? r.updateTime)
  const author = toStr(r.author ?? r.author_name ?? r.created_by ?? r.creator)
  const status = toStr(r.status ?? r.state)
  return { id: id || String(r.id ?? ''), title, content, createdAt, updatedAt, author, status }
}

export async function apiGetCommunityNews<
  T = GetArticleListResponse,
  Q extends TableQueries = TableQueries
>(communityId: string | number, params: Q): Promise<T> {
  const p = params as TableQueries
  const pageIndex = Math.max(1, Number(p.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(p.pageSize ?? 10))
  const qp: Record<string, unknown> = { pageIndex, pageSize }
  const q = (p.query == null ? '' : String(p.query)).trim()
  if (q) {
    qp.query = q
    qp.search = q
    qp.q = q
    qp.title = q
  }
  if (p.sort?.key) qp['sort[key]'] = p.sort.key
  if (p.sort?.order) qp['sort[order]'] = p.sort.order
  if (!p.sort) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }

  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/news/community/${encodeURIComponent(String(communityId))}`,
    method: 'get',
    params: qp,
  })

  const { items, total } = pickItemsAndTotal(raw)
  const list: ArticleRow[] = items.map(mapArticle)
  return { list, total } as T
}

/* ---------- DETALLE ---------- */

function pickDetailObject(raw: unknown): Dict {
  if (isRec(raw)) {
    const r = raw as Dict
    if (isRec(r.data)) return r.data as Dict
    if (isRec(r.result)) return r.result as Dict
    if (isRec(r.news)) return r.news as Dict
    return r
  }
  return {}
}

function mapDetail(r: Dict, idFallback: string | number): NewsDetail {
  // intenta id del autor desde varias formas
  const authorId =
    toId(r.created_by_user_id) ??
    toId(r.created_by_id) ??
    toId(r.author_id) ??
    toId((isRec(r.author) ? (r.author as Dict).id : undefined)) ??
    toId((isRec(r.created_by) ? (r.created_by as Dict).id : undefined))

  return {
    id: toStr(r.id ?? idFallback) || String(idFallback),
    title: toStr(r.title),
    content: toStr(r.content ?? r.body ?? ''),
    created_by: toStr(r.created_by ?? r.author ?? r.author_name ?? r.createdBy),
    created_by_user_id: authorId,
    updated_at: toStr(r.updated_at ?? r.updatedAt ?? r.updated),
  }
}

export async function apiGetNewsById<T = NewsDetail>(
  communityId: string | number,
  id: string | number,
): Promise<T> {
  try {
    const raw = await ApiService.fetchDataWithAxios<unknown>({
      url: `/api/v1/news/community/${encodeURIComponent(String(communityId))}/id/${encodeURIComponent(String(id))}`,
      method: 'get',
    })
    return mapDetail(pickDetailObject(raw), id) as T
  } catch (e) {
    // Fallback: si el detalle rompe (p.ej. 500), intentamos rescatarlo del listado
    const listResp = await apiGetCommunityNews<GetArticleListResponse, TableQueries>(communityId, {
      pageIndex: 1,
      pageSize: 200,
      sort: { key: 'id', order: 'desc' },
    })
    const found = listResp.list.find(x => String(x.id) === String(id))
    if (found) {
      const mapped: NewsDetail = {
        id: found.id,
        title: found.title,
        content: found.content ?? '',
        created_by: found.author,
        updated_at: found.updatedAt ?? found.createdAt,
      }
      return mapped as T
    }
    throw e
  }
}

/* ---------- CREATE / UPDATE / DELETE ---------- */

export async function apiCreateNews(
  communityId: string | number,
  payload: { title: string; content: string; created_by_user_id?: number | string }
) {
  const data: Record<string, unknown> = {
    title: String(payload.title ?? '').trim(),
    content: String(payload.content ?? '').trim(),
  }
  if (payload.created_by_user_id != null) data.created_by_user_id = payload.created_by_user_id

  return ApiService.fetchDataWithAxios({
    url: `/api/v1/news/community/${encodeURIComponent(String(communityId))}`,
    method: 'post',
    data,
  })
}

export async function apiUpdateNews(
  communityId: string | number,
  id: string | number,
  patch: Partial<{ title: string; content: string; created_by_user_id: number | string }>
) {
  const data: Record<string, unknown> = {}
  if (patch.title !== undefined) data.title = String(patch.title ?? '').trim()
  if (patch.content !== undefined) data.content = String(patch.content ?? '').trim()
  if (patch.created_by_user_id !== undefined) data.created_by_user_id = patch.created_by_user_id

  return ApiService.fetchDataWithAxios({
    url: `/api/v1/news/community/${encodeURIComponent(String(communityId))}/id/${encodeURIComponent(String(id))}`,
    method: 'put',
    data,
  })
}

export async function apiDeleteNews(communityId: string | number, id: string | number) {
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/news/community/${encodeURIComponent(String(communityId))}/id/${encodeURIComponent(String(id))}`,
    method: 'delete',
  })
}
