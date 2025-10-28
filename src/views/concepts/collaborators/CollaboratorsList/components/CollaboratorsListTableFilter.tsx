// src/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTableFilter.tsx
import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useCollaboratorsList from '../hooks/useCollaboratorsList'
import type { Filter } from '../store/CollaboratorsListStore'

/** Opciones de orden (id y nombre, como mínimo) */
const sortOptions = [
  { value: 'id_desc', label: 'Recientes primero (ID ↓)', key: 'id', order: 'desc' as const },
  { value: 'id_asc', label: 'Antiguos primero (ID ↑)', key: 'id', order: 'asc' as const },
  { value: 'name_asc', label: 'Nombre (A → Z)', key: 'name', order: 'asc' as const },
  { value: 'name_desc', label: 'Nombre (Z → A)', key: 'name', order: 'desc' as const },
  { value: 'role_asc', label: 'Rol (A → Z)', key: 'role', order: 'asc' as const },
] as const

/** Roles relevantes para colaboradores */
const roleOptions = [
  { value: '', label: 'Todos' },
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUBADMIN', label: 'Subadmin' },
  { value: 'CONCIERGE', label: 'Conserje' },
  { value: 'GUARD', label: 'Guardia' },
] as const

const validationSchema = z.object({
  sortBy: z.enum(['id_desc', 'id_asc', 'name_asc', 'name_desc', 'role_asc']).optional(),
  role: z.enum(['', 'SUPERADMIN', 'ADMIN', 'SUBADMIN', 'CONCIERGE', 'GUARD']).optional(),
  active: z.enum(['', 'true', 'false']).optional(),
})

type FormSchema = z.infer<typeof validationSchema>

const CollaboratorsListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)

  const { tableData, filterData, setTableData, setFilterData } = useCollaboratorsList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const initialSortValue = useMemo<string>(() => {
    const key = tableData?.sort?.key ?? 'id'
    const order = tableData?.sort?.order ?? 'desc'
    const found = sortOptions.find((o) => o.key === key && o.order === order)
    return found?.value ?? 'id_desc'
  }, [tableData?.sort?.key, tableData?.sort?.order])

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: {
      sortBy: initialSortValue as FormSchema['sortBy'],
      role: (filterData.role ?? '') as FormSchema['role'],
      active:
        filterData.active === ''
          ? ''
          : filterData.active === true
          ? 'true'
          : 'false',
    },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    const chosen = sortOptions.find((o) => o.value === values.sortBy) ?? sortOptions[0]

    // Orden y reset a página 1
    setTableData((prev) => ({
      ...prev,
      sort: { key: chosen.key, order: chosen.order },
      pageIndex: 1,
    }))

    // Filtros
    setFilterData((prev: Filter) => ({
      ...prev,
      role: values.role ?? '',
      active: values.active === '' ? '' : values.active === 'true',
    }))

    setIsOpen(false)
  }

  const onClear = () => {
    setTableData((prev) => ({
      ...prev,
      sort: undefined,
      pageIndex: 1,
    }))
    setFilterData((prev: Filter) => ({
      ...prev,
      role: '',
      active: '',
    }))
    reset({
      sortBy: 'id_desc',
      role: '',
      active: '',
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
                  className="form-select w-full"
                  aria-label="Ordenar colaboradores"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem label="Rol">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select
                    className="form-select w-full"
                    aria-label="Filtrar por rol"
                    {...field}
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </FormItem>

            <FormItem label="Estado">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <select
                    className="form-select w-full"
                    aria-label="Filtrar por estado"
                    {...field}
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
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

export default CollaboratorsListTableFilter
