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

export type UserFormSchema = {
  fullName: string
  phone: string
  email: string
  roleId: number | string
  password?: string
  newPassword?: string
}

type UsersFormProps = {
  mode?: 'create' | 'edit'
  submitLabel?: string
  submitting?: boolean
  onFormSubmit: (values: UserFormSchema) => void
  onDiscard?: () => void
  defaultValues?: Partial<UserFormSchema>
}

type RoleOption = { label: string; value: number | string }

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/

const UsersForm = ({
  mode = 'create',
  submitLabel,
  submitting,
  onFormSubmit,
  onDiscard,
  defaultValues,
}: UsersFormProps) => {
  const baseSchema = z.object({
    fullName: z.string().min(1, { message: 'El nombre es obligatorio' }),
    phone: z.string().min(1, { message: 'El teléfono es obligatorio' }),
    email: z.string().email({ message: 'Correo inválido' }).min(1, { message: 'El correo es obligatorio' }),
    roleId: z.union([z.number(), z.string()]).refine((v) => `${v}`.length > 0, { message: 'El rol es obligatorio' }),
  })

  const createSchema = baseSchema.extend({
    password: z.string().regex(passwordRegex, { message: 'La contraseña debe tener 6+ caracteres, 1 mayúscula y 1 número' }),
  })

  const editSchema = baseSchema.extend({
    newPassword: z
      .string()
      .optional()
      .refine((v) => !v || passwordRegex.test(v), {
        message: 'La nueva contraseña debe tener 6+ caracteres, 1 mayúscula y 1 número',
      }),
  })

  const schema = mode === 'edit' ? editSchema : createSchema

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<UserFormSchema>({
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
        const opts = list.map<RoleOption>((role) => ({ value: role.id, label: role.name }))
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
      const exists = roleOptions.some((option) => `${option.value}` === `${defaultValues.roleId}`)
      if (!exists) setValue('roleId', '')
    }
  }, [defaultValues?.roleId, roleOptions, setValue])

  const submit = (values: UserFormSchema) => onFormSubmit?.(values)

  const selectValue = useMemo(
    () => (value: number | string) => roleOptions.find((option) => `${option.value}` === `${value}`) ?? null,
    [roleOptions],
  )

  const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Guardar cambios' : 'Crear usuario')

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(submit)}
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FormItem label="Nombre completo" invalid={!!errors.fullName} errorMessage={errors.fullName?.message}>
              <Controller name="fullName" control={control} render={({ field }) => <Input autoComplete="off" {...field} />} />
            </FormItem>
          </div>

          <FormItem label="Teléfono" invalid={!!errors.phone} errorMessage={errors.phone?.message}>
            <Controller name="phone" control={control} render={({ field }) => <Input autoComplete="off" {...field} />} />
          </FormItem>

          <FormItem label="Correo" invalid={!!errors.email} errorMessage={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input type="email" autoComplete="off" disabled={mode === 'edit'} {...field} />}
            />
          </FormItem>

          {mode === 'create' ? (
            <FormItem label="Contraseña" invalid={!!errors.password} errorMessage={errors.password?.message}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <PasswordInput autoComplete="new-password" {...field} />}
              />
            </FormItem>
          ) : (
            <FormItem label="Nueva contraseña" invalid={!!errors.newPassword} errorMessage={errors.newPassword?.message}>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => <PasswordInput autoComplete="new-password" {...field} />}
              />
            </FormItem>
          )}

          <FormItem label="Rol" invalid={!!errors.roleId} errorMessage={errors.roleId?.message}>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Select
                  isLoading={rolesLoading}
                  isSearchable={false}
                  options={roleOptions}
                  value={selectValue(field.value)}
                  placeholder="Selecciona un rol"
                  onChange={(option) => field.onChange(option ? (option as RoleOption).value : '')}
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
                Descartar
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

export default UsersForm
