// src/views/concepts/residents/ResidentsList/components/ResidentsListTableFilter.tsx
import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useResidentsList from '../hooks/useResidentsList'

const sortOptions = [
  { value: 'id_desc', label: 'Recientes primero (ID ↓)', key: 'id', order: 'desc' as const },
  { value: 'id_asc', label: 'Antiguos primero (ID ↑)', key: 'id', order: 'asc' as const },
  { value: 'start_desc', label: 'Inicio más nuevo (↓)', key: 'start_date', order: 'desc' as const },
  { value: 'start_asc', label: 'Inicio más antiguo (↑)', key: 'start_date', order: 'asc' as const },
] as const

const validationSchema = z.object({
  sortBy: z.enum(['id_desc', 'id_asc', 'start_desc', 'start_asc']).optional(),
  propertyId: z.union([z.literal(''), z.coerce.number()]).optional(),
  userId: z.union([z.literal(''), z.coerce.number()]).optional(),
  isOwner: z.enum(['', 'true', 'false']).optional(),
  startDateFrom: z.string().optional(),
  endDateTo: z.string().optional(),
})

type FormSchema = z.infer<typeof validationSchema>

const ResidentsListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)

  const {
    tableData,
    filterData,
    setTableData,
    setFilterData,
  } = useResidentsList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const initialSortValue = useMemo<string>(() => {
    const key = tableData?.sort?.key ?? 'id'
    const order = tableData?.sort?.order ?? 'desc'
    const found = sortOptions.find(o => o.key === key && o.order === order)
    return found?.value ?? 'id_desc'
  }, [tableData?.sort?.key, tableData?.sort?.order])

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: {
      sortBy: initialSortValue as FormSchema['sortBy'],
      propertyId: (filterData as any)?.propertyId ?? '',
      userId: (filterData as any)?.userId ?? '',
      isOwner: (filterData as any)?.isOwner === '' ? '' : (filterData as any)?.isOwner ? 'true' : 'false',
      startDateFrom: (filterData as any)?.startDateFrom ?? '',
      endDateTo: (filterData as any)?.endDateTo ?? '',
    },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    const chosen = sortOptions.find(o => o.value === values.sortBy) ?? sortOptions[0]

    setTableData(prev => ({
      ...prev,
      sort: { key: chosen.key, order: chosen.order },
      pageIndex: 1,
    }))

    setFilterData((prev: any) => ({
      ...prev,
      propertyId: values.propertyId === '' ? '' : Number(values.propertyId),
      userId: values.userId === '' ? '' : Number(values.userId),
      isOwner: values.isOwner === '' ? '' : values.isOwner === 'true',
      startDateFrom: values.startDateFrom || undefined,
      endDateTo: values.endDateTo || undefined,
    }))

    setIsOpen(false)
  }

  const onClear = () => {
    setTableData(prev => ({
      ...prev,
      sort: undefined,
      pageIndex: 1,
    }))
    setFilterData((prev: any) => ({
      ...prev,
      propertyId: '',
      userId: '',
      isOwner: '',
      startDateFrom: undefined,
      endDateTo: undefined,
    }))
    reset({
      sortBy: 'id_desc',
      propertyId: '',
      userId: '',
      isOwner: '',
      startDateFrom: '',
      endDateTo: '',
    })
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
                  {...field}
                  className="form-select w-full"
                  aria-label="Ordenar residentes"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem label="ID de Propiedad">
              <Controller
                name="propertyId"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min={0}
                    className="form-input w-full"
                    placeholder="Ej: 123"
                    aria-label="Filtrar por propiedad"
                  />
                )}
              />
            </FormItem>

            <FormItem label="ID de Usuario">
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min={0}
                    className="form-input w-full"
                    placeholder="Ej: 456"
                    aria-label="Filtrar por usuario"
                  />
                )}
              />
            </FormItem>
          </div>

          <FormItem label="¿Es dueño?">
            <Controller
              name="isOwner"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="form-select w-full"
                  aria-label="Filtrar por dueño"
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              )}
            />
          </FormItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem label="Inicio desde">
              <Controller
                name="startDateFrom"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="form-input w-full"
                    aria-label="Fecha inicio desde"
                  />
                )}
              />
            </FormItem>

            <FormItem label="Fin hasta">
              <Controller
                name="endDateTo"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="form-input w-full"
                    aria-label="Fecha fin hasta"
                  />
                )}
              />
            </FormItem>
          </div>

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

export default ResidentsListTableFilter
