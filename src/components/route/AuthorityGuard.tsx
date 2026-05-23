import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: unknown
    authority?: unknown
}>

const AuthorityGuard = ({ userAuthority, authority, children }: AuthorityGuardProps) => {
    const roleMatched = useAuthority(
        userAuthority as string[] | unknown,
        authority as string[] | unknown,
    )

    if (!roleMatched) {
        return <Navigate to={DASHBOARDS_PREFIX_PATH} replace />
    }

    return <>{children}</>
}

export default AuthorityGuard
