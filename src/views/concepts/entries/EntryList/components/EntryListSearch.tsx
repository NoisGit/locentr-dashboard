import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type EntryListSearchProps = {
    onInputChange: (value: string) => void
    inputRef?: Ref<HTMLInputElement>
}

const EntryListSearch = ({ onInputChange, inputRef }: EntryListSearchProps) => {
    return (
        <DebouceInput
            ref={inputRef}
            placeholder="Quick search..."
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default EntryListSearch
