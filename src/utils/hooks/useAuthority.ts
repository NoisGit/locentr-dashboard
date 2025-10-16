// src/utils/hooks/useAuthority.ts
import { useMemo } from 'react'
import { canAccess } from '@/utils/authority'

export default function useAuthority(userAuthority: unknown, authority?: unknown) {
  return useMemo(() => {
    const required =
      typeof authority === 'string'
        ? [authority]
        : Array.isArray(authority)
          ? (authority as string[])
          : undefined

    return canAccess(userAuthority, required)
  }, [userAuthority, authority])
}
