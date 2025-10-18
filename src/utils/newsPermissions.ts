// src/utils/newsPermissions.ts
type Dict = Record<string, unknown>

function isRec(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}

function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function normToken(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z]/g, '')
}

export function extractCreatedBy(row: unknown): string | number | null {
  if (!isRec(row)) return null
  const r = row as Dict
  const author = r['author']
  if (isRec(author) && (typeof author.id === 'number' || typeof author.id === 'string')) {
    return author.id as number | string
  }
  const ids = [
    r['created_by_user_id'],
    r['createdByUserId'],
    r['author_id'],
    r['user_id'],
    isRec(r['created_by']) ? (r['created_by'] as Dict).id : undefined,
  ]
  for (const v of ids) {
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim() !== '') return v
  }
  return null
}

export function getCurrentUserIdFromStorage(): string | number | null {
  try {
    const keys = ['access_token', 'token', 'auth', 'session', 'authToken']
    let raw: string | null = null
    for (const k of keys) {
      raw = window.localStorage.getItem(k) || window.sessionStorage.getItem(k)
      if (raw) break
    }
    if (!raw) return null
    let token = raw
    if (raw.startsWith('{')) {
      const obj = JSON.parse(raw) as Dict
      token =
        (obj['access_token'] as string | undefined) ||
        (obj['accessToken'] as string | undefined) ||
        (obj['token'] as string | undefined) ||
        (obj['jwt'] as string | undefined) ||
        (isRec(obj['state']) ? ((obj['state'] as Dict)['token'] as string | undefined) : undefined) ||
        (isRec(obj['user']) ? ((obj['user'] as Dict)['token'] as string | undefined) : undefined) ||
        ''
    }
    if (!token || typeof token !== 'string' || !token.includes('.')) return null
    const base64url = token.split('.')[1]
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(decodeURIComponent(escape(atob(base64))))
    if (isRec(json)) {
      const cand = (json['user_id'] ?? json['sub'] ?? json['id']) as unknown
      if (typeof cand === 'number') return cand
      if (typeof cand === 'string' && cand.trim() !== '') return cand
    }
    return null
  } catch {
    return null
  }
}

export function getCurrentUserIdSmart(user: unknown): string | number | null {
  if (isRec(user)) {
    const u = user as Dict
    const cands: unknown[] = [
      u['id'],
      u['user_id'],
      u['_id'],
      u['uid'],
      isRec(u['user']) ? (u['user'] as Dict)['id'] : undefined,
      isRec(u['user']) ? (u['user'] as Dict)['user_id'] : undefined,
      isRec(u['data']) ? (u['data'] as Dict)['id'] : undefined,
      isRec(u['data']) ? (u['data'] as Dict)['user_id'] : undefined,
      isRec(u['profile']) ? (u['profile'] as Dict)['id'] : undefined,
      isRec(u['account']) ? (u['account'] as Dict)['id'] : undefined,
    ]
    for (const v of cands) {
      if (typeof v === 'number') return v
      if (typeof v === 'string' && v.trim() !== '') return v
    }
  }
  return getCurrentUserIdFromStorage()
}

function collectRoleTokens(authority: unknown, user: unknown): string[] {
  const tokens: string[] = []
  const push = (v: unknown) => {
    if (typeof v === 'string' || typeof v === 'number') tokens.push(normToken(String(v)))
  }
  const pushObj = (o: Dict) => {
    const maybe =
      toStr(o['name']) ||
      toStr(o['role']) ||
      toStr(o['key']) ||
      toStr(o['code']) ||
      toStr(o['authority']) ||
      toStr(o['value'])
    if (maybe) tokens.push(normToken(maybe))
  }

  if (Array.isArray(authority)) {
    authority.forEach((a) => {
      if (typeof a === 'string' || typeof a === 'number') push(a)
      else if (isRec(a)) pushObj(a as Dict)
    })
  } else if (authority != null) {
    push(authority)
  }

  if (isRec(user)) {
    const u = user as Dict
    const fields = ['roles', 'role', 'authorities', 'authority', 'permissions', 'scopes'] as const
    for (const k of fields) {
      const v = u[k]
      if (typeof v === 'string' || typeof v === 'number') push(v)
      else if (Array.isArray(v)) {
        v.forEach((item) => {
          if (typeof item === 'string' || typeof item === 'number') push(item)
          else if (isRec(item)) pushObj(item as Dict)
        })
      } else if (isRec(v)) {
        pushObj(v as Dict)
      }
    }
    const singleRole = normToken(toStr(u['role']))
    if (singleRole) tokens.push(singleRole)
  }

  return tokens
}

export function isSuperAdmin(authority: unknown, user: unknown): boolean {
  const tokens = collectRoleTokens(authority, user)
  const wanted = ['superadmin', 'superadministrator', 'owner', 'root', 'systemadmin']
  const set = new Set(tokens)
  const ok = wanted.some((w) => set.has(w) || tokens.some((t) => t.includes(w)))
  if (ok) return true
  if (isRec(user) && Number((user as Dict)['role_id']) === 1) return true
  if (isRec(user)) {
    const direct = (user as Dict)['isSuperAdmin'] ?? (user as Dict)['superAdmin']
    if (direct === true) return true
  }
  return false
}

export function canEditNewsStrict(params: {
  currentUserId: unknown
  createdByUserId: unknown
  isSuperAdmin: boolean
}) {
  const { currentUserId, createdByUserId, isSuperAdmin } = params
  if (isSuperAdmin) return true
  if (createdByUserId == null || currentUserId == null) return false
  return String(currentUserId) === String(createdByUserId)
}
