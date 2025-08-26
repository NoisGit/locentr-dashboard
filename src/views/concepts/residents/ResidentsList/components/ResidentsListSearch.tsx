import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import React, { Ref, KeyboardEvent } from 'react'

type ResidentsListSearchProps = {
  onInputChange: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
  defaultValue?: string
}

const ResidentsListSearch = ({
  onInputChange,
  inputRef,
  defaultValue = '',
}: ResidentsListSearchProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ')
    onInputChange(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      aria-label="Search residents"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      spellCheck={false}
    />
  )
}

export default ResidentsListSearch
