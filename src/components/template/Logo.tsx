import classNames from 'classnames'
import coredeckLogo from '@/assets/coredeck-logo.svg'
import coredeckIcon from '@/assets/coredeck-icon.svg'
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
    } = props

    const logoSrc = onlyIcon ? coredeckIcon : coredeckLogo

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

    return disableLink ? logoContent : <Link to="/dashboards">{logoContent}</Link>
}

export default Logo
