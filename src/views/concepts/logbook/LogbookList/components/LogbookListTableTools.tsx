// src/views/concepts/logbook/components/LogbookListTableTools.tsx
import LogbookListSearch from './LogbookListSearch'
import LogbookTableFilter from './LogbookTableFilter'
import useLogbookList from '../hooks/useLogbookList'
import cloneDeep from 'lodash/cloneDeep'

const LogbookListTableTools = () => {
  const { tableData, setTableData, setFilterData } = useLogbookList()

  const handleInputChange = (val: string) => {
    // La búsqueda va en filterData (igual que News)
    setFilterData({ query: val })
    // Reset de página
    const next = cloneDeep(tableData)
    next.pageIndex = 1
    setTableData(next)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <LogbookListSearch onInputChange={handleInputChange} />
      <LogbookTableFilter />
    </div>
  )
}

export default LogbookListTableTools
