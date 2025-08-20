import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import useCondosList from '../hooks/useCondosList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import ApiService from '@/services/ApiService'

/**
 * Opciones de orden válidas para el backend.
 * Se mapean a: sort[key] y sort[order]
 */
const sortOptions = [
  { value: 'id_desc', label: 'Recientes primero (ID ↓)', key: 'id', order: 'desc' as const },
  { value: 'id_asc', label: 'Antiguos primero (ID ↑)', key: 'id', order: 'asc' as const },
  { value: 'name_asc', label: 'Nombre A–Z', key: 'name', order: 'asc' as const },
  { value: 'name_desc', label: 'Nombre Z–A', key: 'name', order: 'desc' as const },
] as const

// Zod del formulario: orden + tipo (typeId)
const validationSchema = z.object({
  sortBy: z.enum(['id_desc', 'id_asc', 'name_asc', 'name_desc']).optional(),
  typeId: z.union([z.literal(''), z.coerce.number()]).optional(), // '' o número
})

type FormSchema = z.infer<typeof validationSchema>

// Fetch de tipos de comunidad
async function fetchCommunityTypes() {
  // colección => slash final para evitar 307 CORS
  const data = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/communities/types/',
    method: 'get',
  })
  // Normalizamos: soporta array directo o en data.{items,list,results}
  const items =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.list) && data.list) ||
    (Array.isArray(data?.results) && data.results) ||
    (Array.isArray(data?.data) && data.data) ||
    []
  // esperamos objetos con {id,name}
  return items
    .map((t: any) => ({
      id: Number(t?.id ?? t?.type_id ?? t?.value ?? 0),
      name: String(t?.name ?? t?.label ?? '').trim() || 'Desconocido',
    }))
    .filter((t: any) => Number.isFinite(t.id) && t.id > 0)
}

const CondosListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)

  const {
    tableData,
    setTableData,
    filterData,
    setFilterData,
  } = useCondosList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  // Tipos: SWR
  const { data: types, isLoading: loadingTypes } = useSWR(
    '/api/v1/communities/types/',
    fetchCommunityTypes,
    { revalidateOnFocus: false }
  )

  // Derivar el valor inicial desde tableData.sort (fallback a id_desc)
  const initialSortValue = useMemo<string>(() => {
    const key = tableData?.sort?.key ?? 'id'
    const order = tableData?.sort?.order ?? 'desc'
    const found = sortOptions.find(o => o.key === key && o.order === order)
    return found?.value ?? 'id_desc'
  }, [tableData?.sort?.key, tableData?.sort?.order])

  // Valor inicial del filtro por tipo
  const initialTypeId = (filterData as any)?.typeId ?? ''

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: { sortBy: initialSortValue as FormSchema['sortBy'], typeId: initialTypeId as any },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    const chosen = sortOptions.find(o => o.value === values.sortBy) ?? sortOptions[0]

    // 1) setear sort en tableData
    setTableData(prev => ({
      ...prev,
      sort: { key: chosen.key, order: chosen.order },
      pageIndex: 1, // al cambiar orden, volvemos a la primera página
    }))

    // 2) setear typeId en filterData ('' o número)
    setFilterData((prev: any) => ({
      ...prev,
      typeId: values.typeId === '' ? '' : Number(values.typeId),
    }))

    setIsOpen(false)
  }

  const onClear = () => {
    // Quitar orden explícito y limpiar typeId; ir a página 1
    setTableData(prev => ({
      ...prev,
      sort: undefined,
      pageIndex: 1,
    }))
    setFilterData((prev: any) => ({
      ...prev,
      typeId: '',
    }))
    reset({ sortBy: 'id_desc', typeId: '' }) // UI vuelve a valores conocidos
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
          {/* Orden */}
          <FormItem label="Orden">
            <Controller
              name="sortBy"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="form-select w-full"
                  aria-label="Ordenar comunidades"
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

          {/* Tipo */}
          <FormItem label="Tipo">
            <Controller
              name="typeId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="form-select w-full"
                  aria-label="Filtrar por tipo"
                  disabled={loadingTypes}
                >
                  <option value="">Todos</option>
                  {(types ?? []).map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
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

export default CondosListTableFilter
