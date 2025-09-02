// src/services/RoleService.ts
import ApiService from '@/services/ApiService'

export type Role = {
  id: number | string
  name: string
  slug?: string
}

/* utils sin any */

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function getProp(obj: unknown, key: string): unknown {
  if (!isObject(obj)) return undefined
  return Object.prototype.hasOwnProperty.call(obj, key)
    ? (obj as Record<string, unknown>)[key]
    : undefined
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function pickList(raw: unknown): unknown[] {
  const data = getProp(raw, 'data')

  return (
    asArray(data)
  )
}

type RoleLike = {
  id?: number | string
  role_id?: number | string
  name?: string
  role_name?: string
  title?: string
  label?: string
  slug?: string
  key?: string
}

function roleName(r: RoleLike): string {
  return String(r.name ?? r.role_name ?? r.title ?? r.label ?? '').trim()
}

function toRole(v: unknown): Role | null {
  const r = isObject(v) ? (v as RoleLike) : {}
  const name = roleName(r)
  const id = r.id ?? r.role_id ?? (name || undefined)
  if (id == null || String(id).length === 0 || name.length === 0) return null
  return { id, name, slug: r.slug ?? r.key ?? undefined }
}

async function fetchRolesFrom(url: string): Promise<Role[]> {
  const resp = await ApiService.fetchDataWithAxios<unknown>({ url, method: 'get' })
  const list = pickList(resp)
  const rolelist = list.map(toRole)
  return rolelist.filter((x): x is Role => x !== null)

}

export async function apiGetRoles(): Promise<Role[]> {
  try {
    return await fetchRolesFrom('/api/v1/roles/')
  } catch {
    return await fetchRolesFrom('/api/v1/roles')
  }
}

export default { apiGetRoles }
