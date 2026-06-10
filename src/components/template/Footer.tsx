import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'

export type FooterPageContainerType = 'gutterless' | 'contained'

type FooterProps = {
    pageContainerType: FooterPageContainerType
    className?: string
}

const FooterContent = () => {
    return (
        <div className="flex w-full flex-auto items-center justify-between border-t border-gray-200/70 pt-5 dark:border-gray-800">
            <span>
                &copy; {`${new Date().getFullYear()}`}{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {`${APP_NAME}`}
                </span>
            </span>
            <span className="hidden text-xs text-gray-400 sm:block">
                Operación segura y trazable
            </span>
        </div>
    )
}

export default function Footer({
    pageContainerType = 'contained',
    className,
}: FooterProps) {
    return (
        <footer
            className={classNames(
                `footer flex flex-auto items-center min-h-20 ${PAGE_CONTAINER_GUTTER_X}`,
                className,
            )}
        >
            {pageContainerType === 'contained' ? (
                <Container>
                    <FooterContent />
                </Container>
            ) : (
                <FooterContent />
            )}
        </footer>
    )
}
