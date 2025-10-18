import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import SecureRoutesWithCommunities from '@/components/route/SecureRoutesWithCommunities'
import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
import { useLocation } from 'react-router'
import type { LayoutType } from '@/@types/theme'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

const Views = (props: ViewsProps) => {
    const location = useLocation()

    return (
        <Suspense
            key={location.key}
            fallback={<Loading loading={true} className="w-full" />}
        >
            <SecureRoutesWithCommunities
                protectedRoutes={protectedRoutes}
                publicRoutes={publicRoutes}
                {...props}
            />
        </Suspense>
    )
}

export default Views
