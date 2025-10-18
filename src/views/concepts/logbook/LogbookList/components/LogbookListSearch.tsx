import { useState, useCallback, type ChangeEvent } from 'react'
import Input from '@/components/ui/Input'
import useDebounce from '@/utils/hooks/useDebounce'
import { TbSearch, TbX } from 'react-icons/tb'
import { useLogbookListStore } from '../store/LogbookListStore'

type LogbookListSearchProps = {
  /** opcional: si lo pasas, se ejecuta además del update al store */
  onInputChange?: (value: string) => void
}

const LogbookListSearch = ({ onInputChange }: LogbookListSearchProps) => {
  const filterData = useLogbookListStore((s) => s.filterData)
  const tableData  = useLogbookListStore((s) => s.tableData)
  const setFilterData = useLogbookListStore((s) => s.setFilterData)
  const setTableData  = useLogbookListStore((s) => s.setTableData)

  const [value, setValue] = useState<string>(filterData.query ?? '')

  const applyQuery = useCallback((q: string) => {
    // Actualiza filtro
    setFilterData({ query: q })
    // Resetea a la primera página para que el usuario vea resultados desde el inicio
    if (tableData.pageIndex !== 1) {
      setTableData({ ...tableData, pageIndex: 1 })
    }
    // Callback opcional externo
    onInputChange?.(q)
  }, [setFilterData, setTableData, tableData, onInputChange])

  const debouncedApply = useDebounce(applyQuery, 500)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setValue(q)
    debouncedApply(q)
  }

  const clear = () => {
    setValue('')
    applyQuery('')
  }

  const suffix = value
    ? (
      <button
        type="button"
        aria-label="Limpiar búsqueda"
        onClick={clear}
        className="text-lg hover:text-red-600"
      >
        <TbX />
      </button>
    )
    : <TbSearch className="text-lg" />

  return (
    <Input
      value={value}
      placeholder="Quick search..."
      suffix={suffix}
      onChange={handleInputChange}
    />
  )
}

export default LogbookListSearch
