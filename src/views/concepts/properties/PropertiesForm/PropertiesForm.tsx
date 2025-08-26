// src/views/concepts/properties/PropertiesForm/PropertiesForm.tsx
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
import ApiService from '@/services/ApiService'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

export type PropertiesFormSchema = {
  community_id: number
  property_number: string
  floor: number
}

type PropertiesFormProps = {
  onFormSubmit: (values: PropertiesFormSchema) => void
  defaultValues?: Partial<PropertiesFormSchema>
  children?: ReactNode
} & CommonProps

const validationSchema = z.object({
  community_id: z.coerce.number().int().gt(0, { message: 'Selecciona la comunidad' }),
  property_number: z.string().min(1, { message: 'Número requerido' }),
  floor: z.coerce.number().int().min(0, { message: 'Piso requerido' }),
})

const fetchCommunities = (_key: string) =>
  ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/communities/',
    method: 'get',
    params: { pageIndex: 1, pageSize: 1000 },
  })

function pickArray(raw: any): any[] {
  return (
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.list) && raw.data.list) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw) && raw) ||
    []
  )
}

function normalizeCommunities(raw: any): Array<{ label: string; value: number }> {
  const arr = pickArray(raw)
  return arr
    .map((c: any) => {
      const id = Number(c?.id ?? c?.community_id ?? c?._id ?? NaN)
      const name =
        c?.name ??
        c?.community_name ??
        c?.title ??
        `${c?.first_name ?? ''} ${c?.last_name ?? ''}`.trim()
      if (!Number.isFinite(id)) return null
      return { label: String(name || id), value: id }
    })
    .filter(Boolean) as Array<{ label: string; value: number }>
}

const PropertiesForm = (props: PropertiesFormProps) => {
  const { onFormSubmit, defaultValues = {}, children } = props

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PropertiesFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      community_id: 0,
      property_number: '',
      floor: 0,
      ...defaultValues,
    },
  })

  const { data: communitiesRaw, isLoading: loadingCommunities } = useSWR(
    '/api/v1/communities/',
    fetchCommunities,
    { revalidateOnFocus: false }
  )

  const communityOptions = useMemo(
    () => normalizeCommunities(communitiesRaw),
    [communitiesRaw]
  )

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        community_id: Number(defaultValues.community_id ?? 0),
        property_number: defaultValues.property_number ?? '',
        floor: Number(
          defaultValues.floor === undefined || defaultValues.floor === null
            ? 0
            : (defaultValues.floor as any)
        ),
      })
    }
  }, [JSON.stringify(defaultValues), reset])

  const onSubmit = (values: PropertiesFormSchema) => onFormSubmit?.(values)

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
                    label="Comunidad"
                    invalid={!!errors.community_id}
                    errorMessage={errors.community_id?.message}
                  >
                    <Controller
                      name="community_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={communityOptions}
                          isSearchable={false}
                          isLoading={loadingCommunities}
                          isDisabled={loadingCommunities}
                          value={
                            communityOptions.find(
                              (o) => Number(o.value) === Number(field.value)
                            ) ?? null
                          }
                          placeholder="Selecciona comunidad"
                          onChange={(opt) =>
                            field.onChange(opt ? Number((opt as any).value) : 0)
                          }
                        />
                      )}
                    />
                  </FormItem>
                </div>

                <div className="md:col-span-2">
                  <FormItem
                    label="Número de propiedad"
                    invalid={!!errors.property_number}
                    errorMessage={errors.property_number?.message}
                  >
                    <Controller
                      name="property_number"
                      control={control}
                      render={({ field }) => <Input autoComplete="off" {...field} />}
                    />
                  </FormItem>
                </div>

                <div className="md:col-span-2">
                  <FormItem
                    label="Piso"
                    invalid={!!errors.floor}
                    errorMessage={errors.floor?.message}
                  >
                    <Controller
                      name="floor"
                      control={control}
                      render={({ field }) => (
                        <Input type="number" inputMode="numeric" {...field} />
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

export default PropertiesForm
