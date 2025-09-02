import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Card from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import PasswordInput from '@/components/shared/PasswordInput'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'

import { apiGetRoles } from '@/services/RoleService'

export type CustomerFormSchema = {
  fullName: string
  phone: string
  email: string
  roleId: number | string
  password?: string
  newPassword?: string
}

type CustomerFormProps = {
  mode?: 'create' | 'edit'
  submitLabel?: string
  submitting?: boolean
  onFormSubmit: (values: CustomerFormSchema) => void
  onDiscard?: () => void
  defaultValues?: Partial<CustomerFormSchema>
}

type RoleOption = { label: string; value: number | string }

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/

const CustomerForm = ({
  mode = 'create',
  submitLabel,
  submitting,
  onFormSubmit,
  onDiscard,
  defaultValues,
}: CustomerFormProps) => {
  const baseSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required' }),
    phone: z.string().min(1, { message: 'Phone is required' }),
    email: z.string().email({ message: 'Invalid email' }).min(1, { message: 'Email is required' }),
    roleId: z.union([z.number(), z.string()]).refine((v) => `${v}`.length > 0, { message: 'Role is required' }),
  })

  const createSchema = baseSchema.extend({
    password: z.string().regex(passwordRegex, { message: 'Password must be 6+ chars, include 1 uppercase and 1 number' }),
  })

  const editSchema = baseSchema.extend({
    newPassword: z
      .string()
      .optional()
      .refine((v) => !v || passwordRegex.test(v), {
        message: 'New password must be 6+ chars, include 1 uppercase and 1 number',
      }),
  })

  const schema = mode === 'edit' ? editSchema : createSchema

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<CustomerFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      roleId: '',
      password: '',
      newPassword: '',
      ...defaultValues,
    },
  })

  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setRolesLoading(true)
      try {
        const list = await apiGetRoles()
        const opts = list.map<RoleOption>((r) => ({ value: r.id, label: r.name }))
        if (mounted) setRoleOptions(opts)
      } catch {
        if (mounted) setRoleOptions([])
      } finally {
        if (mounted) setRolesLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (defaultValues?.roleId != null && roleOptions.length > 0) {
      const exists = roleOptions.some((o) => `${o.value}` === `${defaultValues.roleId}`)
      if (!exists) setValue('roleId', '')
    }
  }, [defaultValues?.roleId, roleOptions, setValue])

  const submit = (values: CustomerFormSchema) => onFormSubmit?.(values)

  const selectValue = useMemo(
    () => (val: number | string) => roleOptions.find((o) => `${o.value}` === `${val}`) ?? null,
    [roleOptions],
  )

  const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Edit' : 'Create')

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(submit)}
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FormItem label="Full name" invalid={!!errors.fullName} errorMessage={errors.fullName?.message}>
              <Controller name="fullName" control={control} render={({ field }) => <Input autoComplete="off" {...field} />} />
            </FormItem>
          </div>

          <FormItem label="Phone" invalid={!!errors.phone} errorMessage={errors.phone?.message}>
            <Controller name="phone" control={control} render={({ field }) => <Input autoComplete="off" {...field} />} />
          </FormItem>

          <FormItem label="Email" invalid={!!errors.email} errorMessage={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input type="email" autoComplete="off" disabled={mode === 'edit'} {...field} />}
            />
          </FormItem>

          {mode === 'create' ? (
            <FormItem label="Password" invalid={!!errors.password} errorMessage={errors.password?.message}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <PasswordInput autoComplete="new-password" {...field} />}
              />
            </FormItem>
          ) : (
            <FormItem label="New password" invalid={!!errors.newPassword} errorMessage={errors.newPassword?.message}>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => <PasswordInput autoComplete="new-password" {...field} />}
              />
            </FormItem>
          )}

          <FormItem label="Role" invalid={!!errors.roleId} errorMessage={errors.roleId?.message}>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Select
                  isLoading={rolesLoading}
                  isSearchable={false}
                  options={roleOptions}
                  value={selectValue(field.value)}
                  placeholder="Role"
                  onChange={(opt) => field.onChange(opt ? (opt as RoleOption).value : '')}
                />
              )}
            />
          </FormItem>
        </div>
      </Card>

      <BottomStickyBar>
        <Container>
          <div className="flex items-center justify-between px-8">
            <span></span>
            <div className="flex items-center">
              <Button
                className="ltr:mr-3 rtl:ml-3"
                type="button"
                customColorClass={() =>
                  'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                }
                icon={<TbTrash />}
                onClick={onDiscard}
              >
                Discard
              </Button>
              <Button variant="solid" type="submit" loading={!!submitting}>
                {finalSubmitLabel}
              </Button>
            </div>
          </div>
        </Container>
      </BottomStickyBar>
    </Form>
  )
}

export default CustomerForm
