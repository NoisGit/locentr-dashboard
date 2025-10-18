import React from 'react'
import classNames from 'classnames'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, invalid, ...rest }, ref) => {
        return (
            <textarea
                ref={ref}
                className={classNames(
                    'form-textarea w-full rounded-md border border-gray-300 focus:border-primary-600 focus:ring focus:ring-primary-100',
                    { 'border-red-500': invalid },
                    className
                )}
                {...rest}
            />
        )
    }
)

Textarea.displayName = 'Textarea'

export default Textarea
