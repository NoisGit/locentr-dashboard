import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type PerksListSearchProps = {
    onInputChange: (value: string) => void
    inputRef?: Ref<HTMLInputElement>
}

const PerksListSearch = ({ onInputChange, inputRef }: PerksListSearchProps) => {
    return (
        <DebouceInput
            ref={inputRef}
            placeholder="Buscar perks..."
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default PerksListSearch
