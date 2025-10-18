// src/utils/authority.ts
type UnknownRecord = Record<string, unknown>

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

export function normalizeAuthority(authority: unknown): Set<string> {
  const roles = new Set<string>()
  const add = (v: unknown) => {
    if (v == null) return
    if (typeof v === 'string') {
      const s = v.trim()
      if (s) roles.add(s.toUpperCase())
      return
    }
    if (typeof v === 'number' || typeof v === 'boolean') {
      roles.add(String(v).toUpperCase())
      return
    }
    if (Array.isArray(v)) {
      v.forEach(add)
      return
    }
    if (isRecord(v)) {
      const o = v as UnknownRecord
      const byName =
        (typeof o.name === 'string' && o.name) ||
        (typeof o.role === 'string' && o.role) ||
        (typeof o.authority === 'string' && o.authority) ||
        (typeof o.code === 'string' && o.code) ||
        (typeof o.key === 'string' && o.key) ||
        (typeof o.value === 'string' && o.value)

      const byNameTrim = typeof byName === 'string' ? byName.trim() : byName
      if (byNameTrim) roles.add(String(byNameTrim).toUpperCase())

      ;(['roles', 'authorities', 'permissions', 'scopes'] as const).forEach(
        (k) => add(o[k]),
      )
    }
  }
  add(authority)
  return roles
}

export function getUserRoles(userOrAuthority: unknown): Set<string> {
  if (!isRecord(userOrAuthority)) {
    return normalizeAuthority(userOrAuthority)
  }
  const u = userOrAuthority as UnknownRecord
  const base = normalizeAuthority([
    u.authority,
    u.authorities,
    u.roles,
    u.role,
    userOrAuthority,
  ])

  const flags = [
    u.isSuperAdmin,
    u.superAdmin,
    u.is_super_admin,
    u.is_superadmin,
    u.superadmin,
  ]
  if (flags.some((f) => f === true || f === 'true')) {
    base.add('SUPERADMIN')
  }

  const tokens: string[] = []
  const push = (val: unknown) => {
    if (typeof val === 'string') tokens.push(val)
    else if (typeof val === 'number' || typeof val === 'boolean')
      tokens.push(String(val))
  }
  ;[u.role, u.type, u.kind, u.level, u.tier, u.group].forEach(push)
  tokens
    .map((s) => s.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter(Boolean)
    .forEach((t) => base.add(t))

  return base
}

export function canAccess(userAuthority: unknown, allowed?: string[]): boolean {
  const user = getUserRoles(userAuthority)
  if (user.has('SUPERADMIN')) return true
  if (!allowed || allowed.length === 0) return true
  const need = new Set(allowed.map((r) => String(r).trim().toUpperCase()))
  for (const r of user) if (need.has(r)) return true
  return false
}
