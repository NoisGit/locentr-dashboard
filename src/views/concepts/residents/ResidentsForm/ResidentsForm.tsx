// src/views/concepts/residents/ResidentsForm/ResidentsForm.tsx
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
  homeRole: string
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
    homeRole: z.string().min(1, { message: 'Seleccione rol en el hogar' }),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.endDate) return true
      return new Date(d.endDate).getTime() >= new Date(d.startDate).getTime()
    },
    { path: ['endDate'], message: 'La fecha de fin debe ser mayor o igual a la de inicio' },
  )

type OptionNum = { value: number; label: string }
type OptionStr = { value: string; label: string }

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
  // simple paginado
  for (;;) {
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

const HOME_ROLE_OPTIONS: string[] = [
  'Papá',
  'Mamá',
  'Hijo',
  'Hija',
  'Abuela',
  'Abuelo',
  'Adulto Responsable',
  'Adulta Responsable',
]

// lector seguro del nombre de rol sin usar `any`
function readRoleName(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'name' in (v as Record<string, unknown>)) {
    const n = (v as Record<string, unknown>).name
    return typeof n === 'string' ? n : ''
  }
  return ''
}

const ResidentsForm = (props: ResidentsFormProps) => {
  const { onFormSubmit, defaultValues = {}, children, newResident } = props
  const isCreate =
    newResident ?? !(defaultValues.userId || defaultValues.propertyId || defaultValues.startDate || defaultValues.endDate)

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
      homeRole: '',
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
    // compatible con string o { name }
    const roleName = readRoleName((u as unknown as Record<string, unknown>)?.role)
    return roleName.trim().toLowerCase() === 'residente'
  }

  const usersOptions = useMemo<OptionNum[]>(() => {
    return usersRaw.filter(userIsResident).map((u: CustomerRow) => {
      const idNum = Number(u.id ?? 0)
      const label =
        (u.email ? String(u.email) : '') ||
        (u.name ? String(u.name) : '') ||
        `Usuario #${idNum}`
      return { value: idNum, label }
    })
  }, [usersRaw])

  const propertiesOptions = useMemo<OptionNum[]>(() => {
    const arr = Array.isArray(propertiesRaw) ? propertiesRaw : []
    const currentPropId = Number(defaultValues.propertyId ?? 0)
    const filteredBase = residentsErr
      ? arr
      : arr.filter((p) => {
          const pid = Number((p as PropertyLike)?.id ?? (p as PropertyLike)?.property_id ?? 0)
          if (pid === currentPropId) return true // mantener la actual aunque esté ocupada
          return !usedPropertyIds.has(pid)
        })
    const finalArr = filteredBase.length ? filteredBase : arr
    return finalArr.map((p: PropertyLike) => {
      const idNum = Number(p?.id ?? p?.property_id ?? 0)
      const number = p?.property_number ?? p?.number ?? p?.unit ?? p?.code ?? ''
      const label = number ? `Propiedad ${String(number)}` : `Propiedad #${idNum}`
      return { value: idNum, label }
    })
  }, [propertiesRaw, usedPropertyIds, residentsErr, defaultValues.propertyId])

  const homeRoleOptions: OptionStr[] = useMemo(
    () => HOME_ROLE_OPTIONS.map((label) => ({ label, value: label })),
    [],
  )

  useEffect(() => {
    reset({
      propertyId: defaultValues.propertyId,
      userId: defaultValues.userId,
      isOwner: defaultValues.isOwner ?? false,
      startDate: defaultValues.startDate ?? '',
      endDate: defaultValues.endDate ?? '',
      homeRole: defaultValues.homeRole ?? '',
    })
  }, [
    reset,
    defaultValues.propertyId,
    defaultValues.userId,
    defaultValues.isOwner,
    defaultValues.startDate,
    defaultValues.endDate,
    defaultValues.homeRole,
  ])

  const onSubmit = (values: ResidentsFormSchema) => onFormSubmit?.(values)

  const selectValueNum =
    (options: OptionNum[]) =>
    (val?: number) =>
      options.find((o) => String(o.value) === String(val)) ?? null

  const selectValueStr =
    (options: OptionStr[]) =>
    (val?: string) =>
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
                        value={selectValueNum(propertiesOptions)(field.value)}
                        onChange={(opt) => field.onChange(opt ? (opt as OptionNum).value : undefined)}
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
                        value={selectValueNum(usersOptions)(field.value)}
                        isDisabled={!isCreate}
                        onChange={(opt) => field.onChange(opt ? (opt as OptionNum).value : undefined)}
                      />
                    )}
                  />
                </FormItem>

                <FormItem label="Rol en el hogar" invalid={!!errors.homeRole} errorMessage={errors.homeRole?.message}>
                  <Controller
                    name="homeRole"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isSearchable={false}
                        options={homeRoleOptions}
                        placeholder="Seleccione rol"
                        value={selectValueStr(homeRoleOptions)(field.value)}
                        onChange={(opt) => field.onChange(opt ? (opt as OptionStr).value : '')}
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
