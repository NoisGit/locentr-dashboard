import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import useLogbookList from '../hooks/useLogbookList'
import { TbFilter } from 'react-icons/tb'

const LogbookTableFilter = () => {
  const [open, setOpen] = useState(false)

  const { filterData, setFilterData, tableData, setTableData } = useLogbookList()

  const handleReset = () => {
    // Limpiar búsqueda y volver a la primera página
    setFilterData({ query: '' })
    setTableData({ ...tableData, pageIndex: 1 })
    setOpen(false)
  }

  return (
    <>
      <Button icon={<TbFilter />} onClick={() => setOpen(true)}>
        Filtros
      </Button>
      <Drawer
        title="Filtros"
        isOpen={open}
        onClose={() => setOpen(false)}
        onRequestClose={() => setOpen(false)}
      >
        <div className="py-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Por ahora no hay filtros avanzados para el Libro de Novedades.
            Puedes limpiar la búsqueda actual si necesitas reiniciar la lista.
          </p>

          <div className="flex gap-2">
            <Button variant="solid" onClick={handleReset}>
              Limpiar búsqueda
            </Button>
            <Button
              variant="plain"
              onClick={() => setOpen(false)}
              className="border rounded-xl"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default LogbookTableFilter
