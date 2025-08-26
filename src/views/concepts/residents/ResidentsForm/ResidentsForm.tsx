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

import isEmpty from 'lodash/isEmpty'
import ApiService from '@/services/ApiService'
import { apiGetResidentsList } from '@/services/ResidentsService'
import { apiGetCustomersList } from '@/services/CustomersService'

import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

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
    propertyId: z.coerce.number().int().positive({ message: 'Seleccione una comunidad' }),
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
    { path: ['endDate'], message: 'La fecha de fin debe ser mayor o igual a la de inicio' }
  )

type Option = { value: number; label: string }

async function fetchCondos() {
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/communities/',
    method: 'get',
    params: { pageIndex: 1, pageSize: 1000 },
  })
  const arr =
    (Array.isArray(resp?.items) && resp.items) ||
    (Array.isArray(resp?.list) && resp.list) ||
    (Array.isArray(resp?.data?.items) && resp.data.items) ||
    (Array.isArray(resp?.data) && resp.data) ||
    (Array.isArray(resp?.results) && resp.results) ||
    (Array.isArray(resp) && resp) ||
    []
  return arr
}

const ResidentsForm = (props: ResidentsFormProps) => {
  const { onFormSubmit, defaultValues = {}, children } = props

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

  const { data: usersData } = useSWR(['/api/users', 'all'], () =>
    apiGetCustomersList({ pageIndex: 1, pageSize: 1000 })
  )
  const usersRaw = usersData?.list ?? []

  const { data: condosData } = useSWR('/api/communities', fetchCondos, { revalidateOnFocus: false })
  const condosRaw = condosData ?? []

  const { data: residentsData, error: residentsErr } = useSWR(
    ['/api/residents/all', 1],
    () => apiGetResidentsList({ pageIndex: 1, pageSize: 1000 } as any),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  const usedPropertyIds = useMemo(() => {
    const list = residentsData?.list ?? []
    return new Set(
      list
        .map((r) => Number(r.propertyId))
        .filter((n) => Number.isFinite(n) && n > 0)
    )
  }, [residentsData])

  const userIsResident = (u: any) => {
    const roleName =
      (typeof u?.role === 'string' ? u.role : u?.role?.name) || ''
    return roleName.trim().toLowerCase() === 'residente'
  }

  const usersOptions: Option[] = useMemo(() => {
    return usersRaw.filter(userIsResident).map((u: any) => {
      const idNum = Number(u?.id ?? 0)
      const label =
        (u?.email ? String(u.email) : '') ||
        (u?.name ? String(u.name) : '') ||
        `Usuario #${idNum}`
      return { value: idNum, label }
    })
  }, [usersRaw])

  const condosOptions: Option[] = useMemo(() => {
    const arr = Array.isArray(condosRaw) ? condosRaw : []
    const filteredBase = residentsErr
      ? arr
      : arr.filter((c: any) => !usedPropertyIds.has(Number(c?.id ?? 0)))
    const finalArr = filteredBase.length ? filteredBase : arr
    return finalArr.map((c: any) => {
      const idNum = Number(c?.id ?? 0)
      const label =
        (c?.name ? String(c.name) : '') ||
        (c?.address ? String(c.address) : '') ||
        `Comunidad #${idNum}`
      return { value: idNum, label }
    })
  }, [condosRaw, usedPropertyIds, residentsErr])

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        propertyId: defaultValues.propertyId as any,
        userId: defaultValues.userId as any,
        isOwner: defaultValues.isOwner ?? false,
        startDate: defaultValues.startDate ?? '',
        endDate: defaultValues.endDate ?? '',
      })
    }
  }, [JSON.stringify(defaultValues), reset])

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
                <FormItem label="Comunidad" invalid={!!errors.propertyId} errorMessage={errors.propertyId?.message}>
                  <Controller
                    name="propertyId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isSearchable={false}
                        options={condosOptions}
                        value={selectValue(condosOptions)(field.value)}
                        placeholder="Seleccione una comunidad"
                        onChange={(opt) =>
                          field.onChange(opt ? (opt as Option).value : undefined)
                        }
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
                        value={selectValue(usersOptions)(field.value)}
                        placeholder="Seleccione un usuario"
                        onChange={(opt) =>
                          field.onChange(opt ? (opt as Option).value : undefined)
                        }
                      />
                    )}
                  />
                </FormItem>

                <FormItem label="Fecha de inicio" invalid={!!errors.startDate} errorMessage={errors.startDate?.message}>
                  <Controller name="startDate" control={control} render={({ field }) => <Input type="date" {...field} />} />
                </FormItem>

                <FormItem label="Fecha de fin" invalid={!!errors.endDate} errorMessage={errors.endDate?.message}>
                  <Controller name="endDate" control={control} render={({ field }) => <Input type="date" {...field} />} />
                </FormItem>

                <div className="md:col-span-2">
                  <FormItem>
                    <Controller
                      name="isOwner"
                      control={control}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onChange={(val) => field.onChange(val)} className="justify-start">
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
