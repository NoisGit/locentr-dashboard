import { useMemo, lazy, Suspense, useEffect } from 'react'
import type { CommonProps } from '@/@types/common'
import type { LazyExoticComponent, JSX } from 'react'

type LayoutType = 'simple' | 'split' | 'side'


type Layouts = Record<
  LayoutType,
  LazyExoticComponent<(props: CommonProps) => JSX.Element>
>

const currentLayoutType: LayoutType = 'side'

const layouts: Layouts = {
  simple: lazy(() => import('./Simple')),
  split: lazy(() => import('./Split')),
  side: lazy(() => import('@/views/auth/SignIn/Side')),
}

const AuthLayout = ({ children }: CommonProps) => {
  const Layout = useMemo(() => layouts[currentLayoutType], [])

  useEffect(() => {
    
    import('@/views/auth/SignIn/Side')
  }, [])

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="animate-pulse">Cargando…</div>
        </div>
      }
    >
      <Layout>{children}</Layout>
    </Suspense>
  )
}

export default AuthLayout
