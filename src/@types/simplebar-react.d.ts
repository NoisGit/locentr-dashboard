declare module 'simplebar-react' {
    import type {
        ForwardRefExoticComponent,
        HTMLAttributes,
        ReactNode,
        RefAttributes,
    } from 'react'
    import type SimpleBarCore from 'simplebar-core'

    export type Props = HTMLAttributes<HTMLDivElement> & {
        autoHide?: boolean
        children?: ReactNode
        scrollableNodeProps?: Record<string, unknown>
    }

    const SimpleBar: ForwardRefExoticComponent<
        Props & RefAttributes<SimpleBarCore | null>
    >

    export default SimpleBar
}
