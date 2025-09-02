import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Card from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Select from '@/components/ui/Select'

import ApiService from '@/services/ApiService'
import { apiGetResidentsList } from '@/services/ResidentsService'
import { apiGetCustomersList } from '@/services/CustomersService'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import type { GetCustomersListResponse, CustomerRow } from '@/services/CustomersService'

export type ResidentsFormSchema = {
  propertyId?: number
  userId?: number
  isOwner: boolean
  startDate?: string
  endDate?: string
}

type ResidentsFormProps = {
  onFormSubmit: (values: ResidentsFormSchema) => void
  defaultValues?: Partial<ResidentsFormSchema>
  newResident?: boolean
  children?: ReactNode
} & CommonProps

const isValidDate = (v?: string) => {
  if (!v) return true
  const d = new Date(v)
  return !Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(v)
}

const validationSchema = z
  .object({
    propertyId: z.coerce.number().int().positive({ message: 'Seleccione una propiedad' }),
    userId: z.coerce.number().int().positive({ message: 'Seleccione un usuario' }),
    isOwner: z.boolean().default(false),
    startDate: z.string().optional().refine(isValidDate, { message: 'Fecha inválida (YYYY-MM-DD)' }),
    endDate: z.string().optional().refine(isValidDate, { message: 'Fecha inválida (YYYY-MM-DD)' }),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.endDate) return true
      return new Date(d.endDate).getTime() >= new Date(d.startDate).getTime()
    },
    { path: ['endDate'], message: 'La fecha de fin debe ser mayor o igual a la de inicio' },
  )

type Option = { value: number; label: string }

type PropertyLike = {
  id?: number | string
  property_id?: number | string
  property_number?: string | number
  number?: string | number
  unit?: string | number
  code?: string | number
}

type ResidentsList = {
  list: Array<{ propertyId?: number | string }>
  total: number
}

function pickArray(raw: unknown): unknown[] {
  const r = raw as Record<string, unknown>
  return (
    (Array.isArray(r?.items) && (r.items as unknown[])) ||
    (Array.isArray((r?.data as Record<string, unknown>)?.items) &&
      (((r.data as Record<string, unknown>).items as unknown[]) ?? [])) ||
    (Array.isArray(r?.list) && (r.list as unknown[])) ||
    (Array.isArray(r?.data) && (r.data as unknown[])) ||
    (Array.isArray(r?.results) && (r.results as unknown[])) ||
    (Array.isArray(raw) && (raw as unknown[])) ||
    []
  )
}

async function fetchProperties(): Promise<PropertyLike[]> {
  const limit = 100
  let skip = 0
  const all: unknown[] = []
  while (true) {
    const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
      url: '/api/v1/communities/properties',
      method: 'get',
      params: { skip, limit },
    })
    const batch = pickArray(resp)
    all.push(...batch)
    if (batch.length < limit) break
    skip += limit
  }
  return all as PropertyLike[]
}

const ResidentsForm = (props: ResidentsFormProps) => {
  const { onFormSubmit, defaultValues = {}, children, newResident } = props
  const isCreate =
    newResident ??
    !(defaultValues.userId || defaultValues.propertyId || defaultValues.startDate || defaultValues.endDate)

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ResidentsFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      propertyId: undefined,
      userId: undefined,
      isOwner: false,
      startDate: '',
      endDate: '',
      ...defaultValues,
    },
  })

  const { data: usersData } = useSWR<GetCustomersListResponse>(['/api/users', 'all'], () =>
    apiGetCustomersList({ pageIndex: 1, pageSize: 1000 }),
  )
  const usersRaw = useMemo<CustomerRow[]>(() => usersData?.list ?? [], [usersData])

  const { data: propertiesData } = useSWR<PropertyLike[]>(
    '/api/v1/communities/properties',
    fetchProperties,
    { revalidateOnFocus: false },
  )
  const propertiesRaw = useMemo<PropertyLike[]>(
    () => (Array.isArray(propertiesData) ? propertiesData : []),
    [propertiesData],
  )

  const { data: residentsData, error: residentsErr } = useSWR<ResidentsList>(
    ['/api/residents/all', 1],
    () => apiGetResidentsList<ResidentsList>({ pageIndex: 1, pageSize: 1000 }),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  )

  const usedPropertyIds = useMemo(() => {
    const list = residentsData?.list ?? []
    return new Set(
      list
        .map((r) => Number(r.propertyId))
        .filter((n) => Number.isFinite(n) && n > 0),
    )
  }, [residentsData])

  const userIsResident = (u: CustomerRow) => {
    const roleName = (typeof u.role === 'string' ? u.role : u.role?.name) || ''
    return roleName.trim().toLowerCase() === 'residente'
  }

  const usersOptions = useMemo<Option[]>(() => {
    return usersRaw.filter(userIsResident).map((u: CustomerRow) => {
      const idNum = Number(u.id ?? 0)
      const label =
        (u.email ? String(u.email) : '') ||
        (u.name ? String(u.name) : '') ||
        `Usuario #${idNum}`
      return { value: idNum, label }
    })
  }, [usersRaw])

  const propertiesOptions = useMemo<Option[]>(() => {
    const arr = Array.isArray(propertiesRaw) ? propertiesRaw : []
    const filteredBase = residentsErr ? arr : arr.filter((p) => !usedPropertyIds.has(Number((p as PropertyLike)?.id ?? 0)))
    const finalArr = filteredBase.length ? filteredBase : arr
    return finalArr.map((p: PropertyLike) => {
      const idNum = Number(p?.id ?? p?.property_id ?? 0)
      const number = p?.property_number ?? p?.number ?? p?.unit ?? p?.code ?? ''
      const label = number ? `Propiedad ${String(number)}` : `Propiedad #${idNum}`
      return { value: idNum, label }
    })
  }, [propertiesRaw, usedPropertyIds, residentsErr])

  useEffect(() => {
    reset({
      propertyId: defaultValues.propertyId,
      userId: defaultValues.userId,
      isOwner: defaultValues.isOwner ?? false,
      startDate: defaultValues.startDate ?? '',
      endDate: defaultValues.endDate ?? '',
    })
  }, [
    reset,
    defaultValues.propertyId,
    defaultValues.userId,
    defaultValues.isOwner,
    defaultValues.startDate,
    defaultValues.endDate,
  ])

  const onSubmit = (values: ResidentsFormSchema) => onFormSubmit?.(values)

  const selectValue =
    (options: Option[]) =>
    (val?: number) =>
      options.find((o) => String(o.value) === String(val)) ?? null

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Container>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="gap-4 flex flex-col flex-auto">
            <Card className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Propiedad" invalid={!!errors.propertyId} errorMessage={errors.propertyId?.message}>
                  <Controller
                    name="propertyId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isSearchable={false}
                        options={propertiesOptions}
                        placeholder="Seleccione una propiedad"
                        value={selectValue(propertiesOptions)(field.value)}
                        onChange={(opt) => field.onChange(opt ? (opt as Option).value : undefined)}
                      />
                    )}
                  />
                </FormItem>

                <FormItem label="Usuario" invalid={!!errors.userId} errorMessage={errors.userId?.message}>
                  <Controller
                    name="userId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isSearchable={false}
                        options={usersOptions}
                        placeholder="Seleccione un usuario"
                        value={selectValue(usersOptions)(field.value)}
                        isDisabled={!isCreate}
                        onChange={(opt) => field.onChange(opt ? (opt as Option).value : undefined)}
                      />
                    )}
                  />
                </FormItem>

                {!isCreate ? (
                  <FormItem label="Fecha de fin" invalid={!!errors.endDate} errorMessage={errors.endDate?.message}>
                    <Controller name="endDate" control={control} render={({ field }) => <Input type="date" {...field} />} />
                  </FormItem>
                ) : null}

                <div className="md:col-span-2">
                  <FormItem>
                    <Controller
                      name="isOwner"
                      control={control}
                      render={({ field }) => (
                        <Checkbox className="justify-start" checked={field.value} onChange={(val) => field.onChange(val)}>
                          ¿Es dueño(a) de la propiedad?
                        </Checkbox>
                      )}
                    />
                  </FormItem>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      <BottomStickyBar>{children}</BottomStickyBar>
    </Form>
  )
}

export default ResidentsForm
