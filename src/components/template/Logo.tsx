import classNames from 'classnames'
import porteriaBlack from '@/assets/porteria-black.svg'
import porteriaWhite from '@/assets/porteria-white.svg'
import porteriaIcon from '@/assets/porteria-icon.svg' // <--- CAMBIA AQUÍ!!
import { useThemeStore } from '@/store/themeStore'
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

const LOGO_HEIGHT = 44;

const Logo = (props: LogoProps) => {
    const {
        className,
        imgClass,
        style,
        mode,
        disableLink = false,
        onlyIcon = false,
    } = props
    const themeMode = useThemeStore((state) => state.mode)
    const isDark = (mode ? mode : themeMode) === 'dark'

    let logoSrc = porteriaBlack
    if (onlyIcon) {
        logoSrc = porteriaIcon
    } else {
        logoSrc = isDark ? porteriaWhite : porteriaBlack
    }

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
        <div
            className={classNames(
                'logo',
                alignment,
                className
            )}
        >
            {logoImg}
        </div>
    )

    return disableLink ? logoContent : (
        <Link to="/dashboards">
            {logoContent}
        </Link>
    )
}

export default Logo
