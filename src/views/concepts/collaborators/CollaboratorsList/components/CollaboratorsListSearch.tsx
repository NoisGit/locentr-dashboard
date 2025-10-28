// src/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListSearch.tsx
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import React, { Ref, KeyboardEvent } from 'react'

type CollaboratorsListSearchProps = {
  onInputChange: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
  defaultValue?: string
}

const CollaboratorsListSearch = ({
  onInputChange,
  inputRef,
  defaultValue = '',
}: CollaboratorsListSearchProps) => {
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
      placeholder="Buscar colaboradores…"
      suffix={<TbSearch className="text-lg" />}
      defaultValue={defaultValue}
      aria-label="Search collaborators"
      autoComplete="off"
      spellCheck={false}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

export default CollaboratorsListSearch
