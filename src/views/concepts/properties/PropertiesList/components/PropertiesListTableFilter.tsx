// src/views/concepts/properties/PropertiesList/components/PropertiesListTableFilter.tsx
import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import usePropertiesList from '../hooks/usePropertiesList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import ApiService from '@/services/ApiService'

const sortOptions = [
  { value: 'id_desc', label: 'Recientes primero (ID ↓)', key: 'id', order: 'desc' as const },
  { value: 'id_asc', label: 'Antiguos primero (ID ↑)', key: 'id', order: 'asc' as const },
  { value: 'number_asc', label: 'Número A–Z', key: 'property_number', order: 'asc' as const },
  { value: 'number_desc', label: 'Número Z–A', key: 'property_number', order: 'desc' as const },
] as const

const validationSchema = z.object({
  sortBy: z.enum(['id_desc', 'id_asc', 'number_asc', 'number_desc']).optional(),
  communityId: z.union([z.literal(''), z.coerce.number()]).optional(),
})

type FormSchema = z.infer<typeof validationSchema>

const fetchCommunities = async () => {
  const resp = await ApiService.fetchDataWithAxios<any>({ url: '/api/v1/communities/', method: 'get' })
  const arr =
    (Array.isArray(resp?.items) && resp.items) ||
    (Array.isArray(resp?.list) && resp.list) ||
    (Array.isArray(resp?.data?.items) && resp.data.items) ||
    (Array.isArray(resp?.data?.list) && resp.data.list) ||
    (Array.isArray(resp?.communities) && resp.communities) ||
    (Array.isArray(resp?.data?.communities) && resp.data.communities) ||
    (Array.isArray(resp) && resp) ||
    []
  return arr.map((c: any) => ({
    id: Number(c?.id ?? c?.community_id ?? c?._id ?? 0),
    name: String(c?.name ?? c?.community_name ?? c?.title ?? '').trim(),
  })).filter((c: any) => c.id && c.name)
}

const PropertiesListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const { tableData, setTableData, filterData, setFilterData } = usePropertiesList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const { data: communities = [], isLoading: loadingCommunities } = useSWR(
    '/api/v1/communities/',
    fetchCommunities,
    { revalidateOnFocus: false }
  )

  const initialSortValue = useMemo<string>(() => {
    const key = tableData?.sort?.key ?? 'id'
    const order = tableData?.sort?.order ?? 'desc'
    const found = sortOptions.find(o => o.key === key && o.order === order)
    return found?.value ?? 'id_desc'
  }, [tableData?.sort?.key, tableData?.sort?.order])

  const initialCommunityId = (filterData as any)?.communityId ?? ''

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: { sortBy: initialSortValue as FormSchema['sortBy'], communityId: initialCommunityId as any },
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
      communityId: values.communityId === '' ? '' : Number(values.communityId),
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
      communityId: '',
    }))
    reset({ sortBy: 'id_desc', communityId: '' })
    setIsOpen(false)
  }

  return (
    <>
      <Button icon={<TbFilter />} onClick={openDialog}>
        Filtrar
      </Button>

      <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
        <h4 className="mb-4">Filtros del listado</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Orden">
            <Controller
              name="sortBy"
              control={control}
              render={({ field }) => (
                <select {...field} className="form-select w-full" aria-label="Ordenar propiedades">
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormItem>

          <FormItem label="Comunidad">
            <Controller
              name="communityId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="form-select w-full"
                  aria-label="Filtrar por comunidad"
                  disabled={loadingCommunities}
                >
                  <option value="">Todas</option>
                  {communities.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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

export default PropertiesListTableFilter
