// src/views/concepts/incidents/IncidentList/components/IncidentListTableFilter.tsx
import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import ApiService from '@/services/ApiService'
import { useIncidentListStore } from '../store/IncidentListStore'

type Community = { id: number; name: string }

const sortOptions = [
  { value: 'created_desc', label: 'Recientes primero (fecha ↓)', key: 'created_at', order: 'desc' as const },
  { value: 'created_asc', label: 'Antiguos primero (fecha ↑)', key: 'created_at', order: 'asc' as const },
  { value: 'id_desc', label: 'ID ↓', key: 'id', order: 'desc' as const },
  { value: 'id_asc', label: 'ID ↑', key: 'id', order: 'asc' as const },
] as const

const validationSchema = z.object({
  sortBy: z.enum(['created_desc', 'created_asc', 'id_desc', 'id_asc']).optional(),
  communityId: z.union([z.literal(''), z.coerce.number()]).optional(),
})

type FormSchema = z.infer<typeof validationSchema>

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function get(obj: unknown, key: string): unknown {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key)
    ? obj[key]
    : undefined
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}
function toNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(v as unknown)
  return Number.isFinite(n) ? n : undefined
}
function toStr(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

const fetchCommunities = async (): Promise<Community[]> => {
  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/communities/',
    method: 'get',
  })

  const candidates = [
    get(resp, 'items'),
    get(get(resp, 'data'), 'items'),
    get(resp, 'list'),
    get(get(resp, 'data'), 'list'),
    get(resp, 'communities'),
    get(get(resp, 'data'), 'communities'),
    resp,
  ]

  const raw = candidates.map(asArray).find((a) => a.length) ?? []
  const mapped: Community[] = raw
    .map((c): Community | null => {
      const id =
        toNum(get(c, 'id')) ??
        toNum(get(c, 'community_id')) ??
        toNum(get(c, '_id'))
      const name =
        toStr(get(c, 'name')) ??
        toStr(get(c, 'community_name')) ??
        toStr(get(c, 'title')) ??
        ''
      const cleanName = (name ?? '').trim()
      return id && cleanName ? { id, name: cleanName } : null
    })
    .filter((x): x is Community => !!x)

  return mapped
}

const IncidentListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)

  const tableData = useIncidentListStore((s) => s.activeTable.tableData)
  const setTableData = useIncidentListStore((s) => s.setActiveTableData)

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const { data: communities = [], isLoading: loadingCommunities } = useSWR<Community[]>(
    dialogIsOpen ? '/api/v1/communities/' : null,
    fetchCommunities,
    { revalidateOnFocus: false },
  )

  const initialSortValue = useMemo<string>(() => {
    const key = tableData?.sort?.key ?? 'created_at'
    const order = tableData?.sort?.order ?? 'desc'
    const found = sortOptions.find((o) => o.key === key && o.order === order)
    return found?.value ?? 'created_desc'
  }, [tableData?.sort?.key, tableData?.sort?.order])

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: { sortBy: initialSortValue as FormSchema['sortBy'], communityId: '' as unknown as number },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    const chosen = sortOptions.find((o) => o.value === values.sortBy) ?? sortOptions[0]
    setTableData({ ...tableData, sort: { key: chosen.key, order: chosen.order }, pageIndex: 1 })
    setIsOpen(false)
  }

  const onClear = () => {
    setTableData({ ...tableData, sort: undefined, pageIndex: 1 })
    reset({ sortBy: 'created_desc', communityId: '' })
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
                <select {...field} className="form-select w-full" aria-label="Ordenar incidentes">
                  {sortOptions.map((opt) => (
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
                  {communities.map((c) => (
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

export default IncidentListTableFilter
