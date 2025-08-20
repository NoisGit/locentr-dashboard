import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import React, { Ref, KeyboardEvent } from 'react'

type CondosListSearchProps = {
    onInputChange: (value: string) => void
    inputRef?: Ref<HTMLInputElement>
    /** Valor inicial (por ejemplo, desde params de SWR o URL) */
    defaultValue?: string
}

const CondosListSearch = ({
    onInputChange,
    inputRef,
    defaultValue = '',
}: CondosListSearchProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Sanea un poco la entrada: elimina espacios al inicio y colapsa dobles espacios
        const value = e.target.value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ')
        onInputChange(value)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Limpia al presionar Escape
        if (e.key === 'Escape') {
            onInputChange('')
            ;(e.target as HTMLInputElement)?.blur()
        }
    }

    return (
        <DebouceInput
            ref={inputRef}
            placeholder="Quick search..."
            suffix={<TbSearch className="text-lg" />}
            defaultValue={defaultValue}
            aria-label="Search condos"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
        />
    )
}

export default CondosListSearch
