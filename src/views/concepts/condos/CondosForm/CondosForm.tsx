// src/views/concepts/condos/CondosForm/CondosForm.tsx
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
import Select from '@/components/ui/Select'

import isEmpty from 'lodash/isEmpty'
import { apiGetCommunityTypes } from '@/services/CondosService'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

export type CondosFormSchema = {
  name: string
  address: string
  type: string
}

type CondosFormProps = {
  onFormSubmit: (values: CondosFormSchema) => void
  defaultValues?: Partial<CondosFormSchema>
  newCondo?: boolean
  children?: ReactNode
} & CommonProps

const validationSchema = z.object({
  name: z.string().min(1, { message: 'Nombre requerido' }),
  address: z.string().min(1, { message: 'Dirección requerida' }),
  type: z.string().min(1, { message: 'Selecciona el tipo' }),
})

const TYPE_OPTIONS_FALLBACK = [
  { label: 'Edificio', value: 'edificio' },
  { label: 'Condominio', value: 'condominio' },
]

const COMMUNITY_TYPES_ENDPOINT = '/api/v1/communities/types'

function normalizeTypeOptions(raw: any): Array<{ label: string; value: string }> {
  if (!raw) return []
  const arr =
    (Array.isArray(raw) && raw) ||
    raw?.types ||
    raw?.items ||
    raw?.results ||
    raw?.list ||
    raw?.data ||
    []
  if (!Array.isArray(arr)) return []
  const toTitle = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
  return arr
    .map((it: any) => {
      const valueRaw = it?.slug ?? it?.code ?? it?.key ?? it?.value ?? it?.id ?? it?.type_id ?? ''
      const labelRaw = it?.name ?? it?.label ?? it?.title ?? valueRaw
      const value = String(valueRaw ?? '').trim()
      const label = String(labelRaw ?? '').trim()
      if (!value) return null
      return { label: label || toTitle(value), value }
    })
    .filter(Boolean) as Array<{ label: string; value: string }>
}

const CondosForm = (props: CondosFormProps) => {
  const { onFormSubmit, defaultValues = {}, children } = props

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CondosFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      address: '',
      type: '',
      ...defaultValues,
    },
  })

  const {
    data: typesRaw,
    error: typesError,
    isLoading: typesLoading,
  } = useSWR(COMMUNITY_TYPES_ENDPOINT, apiGetCommunityTypes, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 60_000,
    shouldRetryOnError: false,
  })

  useEffect(() => {
    if (typesError) {
      const serverBody = (typesError as any)?.response?.data
      console.error('Error cargando tipos de comunidad:', serverBody || typesError)
    }
  }, [typesError])

  const apiTypeOptions = useMemo(() => normalizeTypeOptions(typesRaw), [typesRaw])
  const selectOptions =
    apiTypeOptions && apiTypeOptions.length > 0 ? apiTypeOptions : TYPE_OPTIONS_FALLBACK

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        name: defaultValues.name ?? '',
        address: defaultValues.address ?? '',
        type: defaultValues.type ?? '',
      })
    }
  }, [JSON.stringify(defaultValues), reset])

  const onSubmit = (values: CondosFormSchema) => onFormSubmit?.(values)

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Container>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="gap-4 flex flex-col flex-auto">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <FormItem
                    label="Nombre"
                    invalid={!!errors.name}
                    errorMessage={errors.name?.message}
                  >
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => <Input autoComplete="off" {...field} />}
                    />
                  </FormItem>
                </div>

                <div className="md:col-span-2">
                  <FormItem
                    label="Dirección"
                    invalid={!!errors.address}
                    errorMessage={errors.address?.message}
                  >
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => <Input autoComplete="off" {...field} />}
                    />
                  </FormItem>
                </div>

                <div className="md:col-span-2">
                  <FormItem invalid={!!errors.type} errorMessage={errors.type?.message}>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={selectOptions}
                          isSearchable={false}
                          isLoading={typesLoading}
                          isDisabled={typesLoading}
                          value={
                            selectOptions.find((o) => `${o.value}` === `${field.value}`) ??
                            null
                          }
                          placeholder="Tipo de comunidad"
                          onChange={(opt) => field.onChange(opt ? (opt as any).value : '')}
                        />
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

export default CondosForm
