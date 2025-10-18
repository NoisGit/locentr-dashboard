import classNames from '@/utils/classNames'
import { HEADER_HEIGHT } from '@/constants/theme.constant'
import CommunitySwitcher from '@/components/shared/CommunitySwitcher'
import { useAuth } from '@/auth'
import type { ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'

interface HeaderProps extends CommonProps {
  headerStart?: ReactNode
  headerEnd?: ReactNode
  headerMiddle?: ReactNode
  container?: boolean
  wrapperClass?: string
}

const Header = (props: HeaderProps) => {
  const {
    headerStart,
    headerEnd,
    headerMiddle,
    className,
    container,
    wrapperClass,
  } = props

  const { authenticated } = useAuth()

  return (
    <header className={classNames('header', className)}>
      <div
        className={classNames(
          'header-wrapper flex items-center justify-between w-full',
          container && 'container mx-auto',
          wrapperClass,
        )}
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="header-action header-action-start flex items-center h-full">
          {headerStart}
        </div>

        {headerMiddle && (
          <div className="header-action header-action-middle flex items-center justify-center flex-1 h-full">
            {headerMiddle}
          </div>
        )}

        <div className="header-action header-action-end flex items-center h-full">
          {authenticated && (
            <CommunitySwitcher className="hidden md:block mr-3" />
          )}
          {headerEnd}
        </div>
      </div>
    </header>
  )
}

export default Header
