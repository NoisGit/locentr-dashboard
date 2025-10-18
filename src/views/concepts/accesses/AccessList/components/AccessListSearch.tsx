import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type AccessListSearchProps = {
    onInputChange: (value: string) => void
    inputRef?: Ref<HTMLInputElement>
}

const AccessListSearch = ({ onInputChange, inputRef }: AccessListSearchProps) => {
    return (
        <DebouceInput
            ref={inputRef}
            placeholder="Quick search..."
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default AccessListSearch
