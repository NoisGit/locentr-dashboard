import classNames from 'classnames'
import locentrLogo from '@/assets/locentr-logo.svg'
import locentrLogoDark from '@/assets/locentr-logo-dark.svg'
import locentrIcon from '@/assets/locentr-icon.svg'
import { APP_NAME } from '@/constants/app.constant'
import { Link } from 'react-router-dom'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
    disableLink?: boolean
    onlyIcon?: boolean
}

const LOGO_HEIGHT = 44

const Logo = (props: LogoProps) => {
    const {
        className,
        imgClass,
        style,
        disableLink = false,
        onlyIcon = false,
        mode = 'light',
    } = props

    const logoSrc = onlyIcon
        ? locentrIcon
        : mode === 'dark'
          ? locentrLogoDark
          : locentrLogo

    const alignment = onlyIcon
        ? 'flex items-center w-full pl-6'
        : 'flex items-center w-full'

    const logoImg = (
        <img
            className={imgClass}
            src={logoSrc}
            alt={`${APP_NAME} logo`}
            style={{
                height: LOGO_HEIGHT,
                width: 'auto',
                maxWidth: 220,
                objectFit: 'contain',
                ...style,
            }}
            draggable={false}
        />
    )

    const logoContent = (
        <div className={classNames('logo', alignment, className)}>
            {logoImg}
        </div>
    )

    return disableLink ? logoContent : <Link to="/dashboard">{logoContent}</Link>
}

export default Logo
