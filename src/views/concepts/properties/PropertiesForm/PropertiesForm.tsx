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
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { apiListCompanies, type Company } from '@/services/CompaniesService'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

export type PropertiesFormSchema = {
  community_id: number
  property_number: string
  floor: number
  block?: string
}

type PropertiesFormProps = {
  onFormSubmit: (values: PropertiesFormSchema) => void
  defaultValues?: Partial<PropertiesFormSchema>
  children?: ReactNode
  hideCommunity?: boolean
  title?: string
} & CommonProps

const validationSchema = z.object({
  community_id: z.coerce.number().int().gt(0, { message: 'Selecciona la empresa' }),
  property_number: z.string().min(1, { message: 'Número requerido' }),
  floor: z.coerce.number().int().min(0, { message: 'Piso requerido' }),
  block: z.string().optional(),
})

type Option = { label: string; value: number }

const PropertiesForm = (props: PropertiesFormProps) => {
  const {
    onFormSubmit,
    defaultValues = {},
    children,
    hideCommunity = true,
    title = 'Editar propiedad',
  } = props

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<PropertiesFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      community_id: 0,
      property_number: '',
      floor: 0,
      block: '',
      ...defaultValues,
    },
  })

  const { selectedId: headerCompanyId } = useCompaniesStore()

  const { data: companies, isLoading: loadingCompanies } = useSWR<Company[]>(
    ['companies:all'],
    () => apiListCompanies({ pageIndex: 1, pageSize: 10000 }),
    { revalidateOnFocus: false }
  )

  const companyOptions: Option[] = useMemo(
    () =>
      (companies ?? [])
        .map((company) => {
          const idNum = Number(company.id)
          if (!Number.isFinite(idNum)) return null
          return { label: company.name || String(company.id), value: idNum }
        })
        .filter(Boolean) as Array<Option>,
    [companies]
  )

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        community_id: Number(defaultValues.community_id ?? 0),
        property_number: defaultValues.property_number ?? '',
        floor:
          defaultValues.floor === undefined || defaultValues.floor === null
            ? 0
            : Number(defaultValues.floor as unknown),
        block: defaultValues.block ?? '',
      })
      return
    }
    if (headerCompanyId != null && String(headerCompanyId) !== '') {
      const formVal = getValues()
      if (hideCommunity || !formVal.community_id || Number.isNaN(Number(formVal.community_id))) {
        const headerIdNum = Number(headerCompanyId)
        reset({ ...formVal, community_id: headerIdNum })
      }
    }
  }, [JSON.stringify(defaultValues), headerCompanyId, hideCommunity, reset, getValues])

  useEffect(() => {
    if (hideCommunity && headerCompanyId != null && String(headerCompanyId) !== '') {
      setValue('community_id', Number(headerCompanyId), { shouldDirty: false })
    }
  }, [hideCommunity, headerCompanyId, setValue])

  const onSubmit = (values: PropertiesFormSchema) => onFormSubmit?.(values)

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Container>
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="gap-4 flex flex-col flex-auto">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!hideCommunity && (
                  <div className="md:col-span-2">
                    <FormItem
                      label="Empresa"
                      invalid={!!errors.community_id}
                      errorMessage={errors.community_id?.message}
                    >
                      <Controller
                        name="community_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            options={companyOptions}
                            isSearchable={false}
                            isLoading={loadingCompanies}
                            isDisabled={loadingCompanies}
                            value={
                              companyOptions.find(
                                (option) => Number(option.value) === Number(field.value),
                              ) ?? null
                            }
                            placeholder="Selecciona empresa"
                            onChange={(option) =>
                              field.onChange(option ? Number((option as Option).value) : 0)
                            }
                          />
                        )}
                      />
                    </FormItem>
                  </div>
                )}

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

                <div className="md:col-span-2">
                  <FormItem label="Torre" invalid={false}>
                    <Controller
                      name="block"
                      control={control}
                      render={({ field }) => (
                        <Input autoComplete="off" placeholder="Opcional" {...field} />
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
