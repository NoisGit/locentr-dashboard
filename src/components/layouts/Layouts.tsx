// layouts/Layout.tsx
import { Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import Loading from '@/components/shared/Loading'
import type { CommonProps } from '@/@types/common'
import { useThemeStore } from '@/store/themeStore'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'

const Layout = ({ children }: CommonProps) => {
    const layoutType = useThemeStore((state) => state.layout.type)
    const { pathname } = useLocation()

    const isPreLoginRoute =
        pathname === '/' ||
        pathname.startsWith('/auth') ||
        pathname === '/accept-invitation' ||
        pathname === '/verify-email' ||
        pathname === '/pricing' ||
        pathname === '/start-trial'

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading />
                </div>
            }
        >
            {isPreLoginRoute ? (
                <PreLoginLayout>{children}</PreLoginLayout>
            ) : (
                <PostLoginLayout layoutType={layoutType}>{children}</PostLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
