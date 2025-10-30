// src/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListTableFilter.tsx
import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useAccessPointsList from '../hooks/useAccessPointsList'

/** Opciones de orden (id y nombre, como mínimo) */
const sortOptions = [
  { value: 'id_desc',   label: 'Recientes primero (ID ↓)', key: 'id',   order: 'desc' as const },
  { value: 'id_asc',    label: 'Antiguos primero (ID ↑)',  key: 'id',   order: 'asc'  as const },
  { value: 'name_asc',  label: 'Nombre (A → Z)',           key: 'name', order: 'asc'  as const },
  { value: 'name_desc', label: 'Nombre (Z → A)',           key: 'name', order: 'desc' as const },
] as const

const validationSchema = z.object({
  sortBy: z.enum(['id_desc', 'id_asc', 'name_asc', 'name_desc']).optional(),
})

type FormSchema = z.infer<typeof validationSchema>

const AccessPointsListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const { tableData, setTableData } = useAccessPointsList()

  const initialSortValue = useMemo<string>(() => {
    const key = tableData?.sort?.key ?? 'id'
    const order = tableData?.sort?.order ?? 'desc'
    const found = sortOptions.find((o) => o.key === key && o.order === order)
    return found?.value ?? 'id_desc'
  }, [tableData?.sort?.key, tableData?.sort?.order])

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: { sortBy: initialSortValue as FormSchema['sortBy'] },
    resolver: zodResolver(validationSchema),
  })

  const openDialog = () => {
    // sincroniza el select con el estado actual antes de abrir
    reset({ sortBy: initialSortValue as FormSchema['sortBy'] })
    setIsOpen(true)
  }
  const onDialogClose = () => setIsOpen(false)

  const onSubmit = (values: FormSchema) => {
    const chosen = sortOptions.find((o) => o.value === values.sortBy) ?? sortOptions[0]
    setTableData((prev) => ({
      ...prev,
      sort: { key: chosen.key, order: chosen.order },
      pageIndex: 1,
    }))
    setIsOpen(false)
  }

  const onClear = () => {
    setTableData((prev) => ({
      ...prev,
      sort: undefined,
      pageIndex: 1,
    }))
    reset({ sortBy: 'id_desc' })
    setIsOpen(false)
  }

  return (
    <>
      <Button icon={<TbFilter />} onClick={openDialog}>
        Filtrar
      </Button>

      <Dialog
        isOpen={dialogIsOpen}
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <h4 className="mb-4">Filtros del listado</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Orden">
            <Controller
              name="sortBy"
              control={control}
              render={({ field }) => (
                <select
                  className="form-select w-full"
                  aria-label="Ordenar access points"
                  {...field}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormItem>

          <div className="flex justify-end items-center gap-2 mt-4">
            <Button type="button" onClick={onClear}>
              Limpiar
            </Button>
            <Button type="submit" variant="solid">
              Aplicar
            </Button>
          </div>
        </Form>
      </Dialog>
    </>
  )
}

export default AccessPointsListTableFilter
