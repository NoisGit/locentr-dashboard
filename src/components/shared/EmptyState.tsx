import Button from '@/components/ui/Button'
import classNames from '@/utils/classNames'
import { PiTrayDuotone } from 'react-icons/pi'
import type { ReactNode } from 'react'

type EmptyStateProps = {
    title?: string
    description?: string
    icon?: ReactNode
    actionLabel?: string
    onAction?: () => void
    compact?: boolean
    className?: string
}

const EmptyState = ({
    title = 'Aún no hay información',
    description = 'Cuando existan registros, aparecerán organizados en este espacio.',
    icon,
    actionLabel,
    onAction,
    compact = false,
    className,
}: EmptyStateProps) => {
    return (
        <div
            className={classNames(
                'flex flex-col items-center justify-center text-center',
                compact ? 'px-5 py-10' : 'min-h-[280px] px-6 py-14',
                className,
            )}
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary-subtle text-2xl text-primary">
                {icon ?? <PiTrayDuotone />}
            </div>
            <h5 className="mb-2">{title}</h5>
            <p className="max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button
                    className="mt-6"
                    variant="solid"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}

export default EmptyState
