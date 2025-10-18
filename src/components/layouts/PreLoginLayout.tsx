// layouts/PreLoginLayout.tsx
import { useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import type { CommonProps } from '@/@types/common'

const PreLoginLayout = ({ children }: CommonProps) => {
  const { pathname } = useLocation()

  // Cubre /auth y cualquier subruta (sign-in, forgot-password, etc.)
  const isAuthPath = pathname.startsWith('/auth')

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthPath ? <AuthLayout>{children}</AuthLayout> : children}
    </div>
  )
}

export default PreLoginLayout
