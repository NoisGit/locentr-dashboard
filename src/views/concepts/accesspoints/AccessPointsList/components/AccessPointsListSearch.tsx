// src/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListSearch.tsx
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import React, { Ref, KeyboardEvent } from 'react'

type AccessPointsListSearchProps = {
  onInputChange: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
  defaultValue?: string
}

const AccessPointsListSearch = ({
  onInputChange,
  inputRef,
  defaultValue = '',
}: AccessPointsListSearchProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ')
    onInputChange(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onInputChange('')
      ;(e.target as HTMLInputElement)?.blur()
    }
    if (e.key === 'Enter') {
      // fuerza aplicar el valor actual al presionar Enter
      onInputChange((e.target as HTMLInputElement).value.trim())
      ;(e.target as HTMLInputElement)?.blur()
    }
  }

  return (
    <DebouceInput
      ref={inputRef}
      placeholder="Buscar Access Points…"
      suffix={<TbSearch className="text-lg" />}
      defaultValue={defaultValue}
      aria-label="Buscar Access Points"
      autoComplete="off"
      spellCheck={false}
      inputMode="search"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

export default AccessPointsListSearch
