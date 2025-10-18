// src/views/concepts/users/CustomerList/components/CustomerListSearch.tsx
import React, { forwardRef } from 'react'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'

type CustomerListSearchProps = {
  onInputChange: (value: string) => void
  defaultValue?: string
  className?: string
}

const CustomerListSearch = forwardRef<HTMLInputElement, CustomerListSearchProps>(
  ({ onInputChange, defaultValue, className }, ref) => {
    return (
      <DebouceInput
        ref={ref}
        className={className}
        placeholder="Quick search..."
        aria-label="Quick search"
        defaultValue={defaultValue}
        suffix={<TbSearch className="text-lg" />}
        onChange={(e) => onInputChange(e.target.value)}
      />
    )
  },
)

CustomerListSearch.displayName = 'CustomerListSearch'
export default CustomerListSearch
