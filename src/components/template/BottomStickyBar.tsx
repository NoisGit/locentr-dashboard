import classNames from '@/utils/classNames'
import type { CommonProps } from '@/@types/common'

export type BottomStickyBarProps = CommonProps

const BottomStickyBar = ({ children }: BottomStickyBarProps) => {
    return (
        <div
            className={classNames(
                'bottom-0 left-0 right-0 z-10 mt-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 -mx-4 sm:-mx-8 py-4 sticky',
            )}
        >
            {children}
        </div>
    )
}

export default BottomStickyBar
