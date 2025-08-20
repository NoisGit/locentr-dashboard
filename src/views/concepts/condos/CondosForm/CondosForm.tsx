// src/views/concepts/condos/CondosForm/CondosForm.tsx
import { useEffect } from 'react'
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

const TYPE_OPTIONS = [
  { label: 'Edificio', value: 'edificio' },
  { label: 'Condominio', value: 'condominio' },
]

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
                  <FormItem
                    invalid={!!errors.type}
                    errorMessage={errors.type?.message}
                  >
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={TYPE_OPTIONS}
                          isSearchable={false}
                          value={
                            TYPE_OPTIONS.find((o) => `${o.value}` === `${field.value}`) ??
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
