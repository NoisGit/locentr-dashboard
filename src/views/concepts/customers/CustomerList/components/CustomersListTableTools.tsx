import { useCallback } from 'react'
import useCustomerList from '../hooks/useCustomerList'
import CustomerListSearch from './CustomerListSearch'
import CustomerTableFilter from './CustomerListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const CustomersListTableTools = () => {
  const { tableData, setTableData } = useCustomerList()

  const handleInputChange = useCallback((val: string) => {
    const next = cloneDeep(tableData)
    next.query = val ?? ''
    next.pageIndex = 1
    setTableData(next)
  }, [tableData, setTableData])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <CustomerListSearch onInputChange={handleInputChange} />
      <CustomerTableFilter />
    </div>
  )
}

export default CustomersListTableTools
