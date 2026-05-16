// src/services/NewsService.ts
import ApiService from '@/services/ApiService'
import { apiListCompanies } from '@/services/CompaniesService'

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
  created_by_user_id?: number | string | null
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
  created_by_user_id?: number | string
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
function getObj(o: Dict | null | undefined, key: string): Dict | null {
  const v = o?.[key]
  return isRec(v) ? (v as Dict) : null
}
function getArr(o: Dict | null | undefined, key: string): unknown[] | null {
  const v = o?.[key]
  return Array.isArray(v) ? (v as unknown[]) : null
}

function pickArray(raw: unknown): unknown[] {
  const r = isRec(raw) ? (raw as Dict) : {}
  const direct = getArr(r, 'items') || getArr(r, 'list') || getArr(r, 'results')
  if (direct) return direct
  const dataObj = getObj(r, 'data')
  const nested = getArr(dataObj, 'items') || getArr(dataObj, 'list') || getArr(dataObj, 'results')
  if (nested) return nested
  const dataArr = Array.isArray(r['data']) ? (r['data'] as unknown[]) : null
  if (dataArr) return dataArr
  if (Array.isArray(raw)) return raw as unknown[]
  return []
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const r = isRec(raw) ? (raw as Dict) : {}
  const items = pickArray(raw)
  const cand =
    r['total'] ??
    r['count'] ??
    getObj(r, 'data')?.['total'] ??
    getObj(r, 'pagination')?.['total'] ??
    items.length
  let total = 0
  if (typeof cand === 'number') total = cand
  else if (typeof cand === 'string') {
    const n = Number(cand)
    total = Number.isNaN(n) ? items.length : n
  } else if (typeof cand === 'boolean') {
    total = cand ? items.length : 0
  } else {
    total = items.length
  }
  return { items, total }
}

function mapArticle(u: unknown): ArticleRow {
  const r = isRec(u) ? (u as Dict) : {}
  const idStr = toStr(r['id'] ?? r['news_id'] ?? r['_id'])
  const title = toStr(r['title']) || toStr(r['name']) || (idStr ? `#${idStr}` : '')
  const content = toStr(r['content'] ?? r['body'] ?? r['text'])
  const createdAt = toStr(r['createdAt'] ?? r['created_at'] ?? r['created'])
  const updatedAt = toStr(r['updatedAt'] ?? r['updated_at'] ?? r['updated'] ?? r['updateTime'])
  const author = toStr(r['author'] ?? r['author_name'] ?? r['created_by'] ?? r['creator'])
  const status = toStr(r['status'] ?? r['state'])
  const authorObj = getObj(r, 'author')
  const created_by_user_id =
    toId(r['created_by_user_id']) ??
    toId(r['author_id']) ??
    toId(r['user_id']) ??
    toId(authorObj ? authorObj['id'] : undefined) ??
    null
  return {
    id: idStr || String(r['id'] ?? ''),
    title,
    content,
    createdAt,
    updatedAt,
    author,
    status,
    created_by_user_id,
  }
}

function buildQueryParams(p: TableQueries): Record<string, unknown> {
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
  return qp
}

function tsOf(article: ArticleRow): number {
  const s = article.updatedAt || article.createdAt || ''
  const t = Date.parse(s)
  if (!Number.isNaN(t)) return t
  const fixed = s.replace('T', ' ')
  const t2 = Date.parse(fixed)
  return Number.isNaN(t2) ? 0 : t2
}

export async function apiGetCommunityNews<
  T = GetArticleListResponse,
  Q extends TableQueries = TableQueries
>(communityId: string | number, params: Q): Promise<T> {
  const qp = buildQueryParams(params as TableQueries)
  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/news/community/${encodeURIComponent(String(communityId))}`,
    method: 'get',
    params: qp,
  })
  const { items, total } = pickItemsAndTotal(raw)
  const list: ArticleRow[] = items.map(mapArticle)
  return { list, total } as T
}

export async function apiGetAllNewsAggregated<
  T = GetArticleListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const companies = await apiListCompanies()
  if (!Array.isArray(companies) || companies.length === 0) {
    return { list: [], total: 0 } as T
  }
  const perCompany = await Promise.all(
    companies.map((company) =>
      apiGetCommunityNews<GetArticleListResponse, TableQueries>(company.id, {
        ...params,
        pageIndex: 1,
      }),
    ),
  )
  let combined: ArticleRow[] = []
  perCompany.forEach((r) => {
    combined = combined.concat(r.list)
  })
  const sortOrder = params.sort?.order === 'asc' ? 'asc' : 'desc'
  combined.sort((a, b) => {
    const ta = tsOf(a)
    const tb = tsOf(b)
    if (ta === tb) {
      const aid = Number(a.id)
      const bid = Number(b.id)
      if (!Number.isNaN(aid) && !Number.isNaN(bid)) {
        return sortOrder === 'asc' ? aid - bid : bid - aid
      }
      return 0
    }
    return sortOrder === 'asc' ? ta - tb : tb - ta
  })
  const total = combined.length
  const start = Math.max(0, (Number(params.pageIndex) - 1) * Number(params.pageSize))
  const end = start + Number(params.pageSize)
  const page = combined.slice(start, end)
  return { list: page, total } as T
}

function pickDetailObject(raw: unknown): Dict {
  if (isRec(raw)) {
    const r = raw as Dict
    const dataObj = getObj(r, 'data')
    if (dataObj) return dataObj
    const resultObj = getObj(r, 'result')
    if (resultObj) return resultObj
    const newsObj = getObj(r, 'news')
    if (newsObj) return newsObj
    return r
  }
  return {}
}

function mapDetail(r: Dict, idFallback: string | number): NewsDetail {
  const authorObj = getObj(r, 'author')
  const createdByObj = getObj(r, 'created_by')
  const authorId =
    toId(r['created_by_user_id']) ??
    toId(r['created_by_id']) ??
    toId(r['author_id']) ??
    toId(authorObj ? authorObj['id'] : undefined) ??
    toId(createdByObj ? createdByObj['id'] : undefined)
  return {
    id: toStr(r['id'] ?? idFallback) || String(idFallback),
    title: toStr(r['title']),
    content: toStr(r['content'] ?? r['body'] ?? ''),
    created_by: toStr(r['created_by'] ?? r['author'] ?? r['author_name'] ?? r['createdBy']),
    created_by_user_id: authorId,
    updated_at: toStr(r['updated_at'] ?? r['updatedAt'] ?? r['updated']),
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
    const listResp = await apiGetCommunityNews<GetArticleListResponse, TableQueries>(communityId, {
      pageIndex: 1,
      pageSize: 200,
      sort: { key: 'id', order: 'desc' },
    })
    const found = listResp.list.find((x) => String(x.id) === String(id))
    if (found) {
      const mapped: NewsDetail = {
        id: found.id,
        title: found.title,
        content: found.content ?? '',
        created_by: found.author,
        created_by_user_id: found.created_by_user_id ?? undefined,
        updated_at: found.updatedAt ?? found.createdAt,
      }
      return mapped as T
    }
    throw e
  }
}

export async function apiCreateNews(
  communityId: string | number,
  payload: { title: string; content: string; created_by_user_id?: number | string },
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
  patch: Partial<{ title: string; content: string; created_by_user_id: number | string }>,
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
