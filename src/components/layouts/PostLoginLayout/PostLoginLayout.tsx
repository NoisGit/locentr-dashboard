import CollapsibleSide from './components/CollapsibleSide'
import type { CommonProps } from '@/@types/common'
import type { LayoutType } from '@/@types/theme'

interface PostLoginLayoutProps extends CommonProps {
    layoutType?: LayoutType
}

const PostLoginLayout = ({ children }: PostLoginLayoutProps) => {
    return <CollapsibleSide>{children}</CollapsibleSide>
}

export default PostLoginLayout
