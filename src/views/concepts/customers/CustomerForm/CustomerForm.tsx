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

import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { apiGetRoles } from '@/services/RoleService'

export type CustomerFormSchema = {
  fullName: string
  phone: string
  email: string
  password: string
  roleId: number | string
}

type CustomerFormProps = {
  onFormSubmit: (values: CustomerFormSchema) => void | Promise<void>
  onDiscard?: () => void | Promise<void>
  submitting?: boolean
  defaultValues?: Partial<CustomerFormSchema>
  newCustomer?: boolean
} & CommonProps

const schema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  phone: z.string().min(1, { message: 'Phone is required' }),
  email: z.string().email({ message: 'Invalid email' }).min(1, { message: 'Email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  roleId: z.union([z.number(), z.string()]).refine((v) => `${v}`.length > 0, { message: 'Role is required' }),
})

type RoleOption = { label: string; value: number | string }
type RoleLike = { id?: number | string; name?: string; role_name?: string; title?: string }

function roleName(r: RoleLike): string {
  return (r.name ?? r.role_name ?? r.title ?? '').toString()
}
function pickRolesPayload(raw: unknown): RoleLike[] {
  if (Array.isArray(raw)) return raw as RoleLike[]
  const anyRaw = raw as Record<string, any> | null | undefined
  const candidates = [anyRaw?.roles, anyRaw?.data?.roles, anyRaw?.data, anyRaw?.items, anyRaw?.results]
  for (const c of candidates) if (Array.isArray(c)) return c as RoleLike[]
  return []
}
function isSuperAdminUser(user: unknown): boolean {
  const u = user as any
  const direct = (u?.role?.name ?? u?.role_name ?? u?.role)?.toString()?.toLowerCase?.()
  if (direct && direct.includes('super')) return true
  if (Array.isArray(u?.roles)) {
    return u.roles.some((rr: any) =>
      (rr?.name ?? rr?.role_name ?? rr)?.toString()?.toLowerCase?.().includes('super'),
    )
  }
  return Boolean(u?.isSuperAdmin)
}

const CustomerForm = (props: CustomerFormProps) => {
  const { onFormSubmit, onDiscard, submitting, defaultValues } = props
  const { user } = useAuth()

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
      password: '',
      roleId: '',
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
        const raw = await apiGetRoles()
        if (!mounted) return
        const list = pickRolesPayload(raw)
        const isSuper = isSuperAdminUser(user)

        const filtered = list.filter((r) => {
          const n = roleName(r).toLowerCase()
          return isSuper ? true : !n.includes('admin')
        })

        const opts = filtered.map<RoleOption>((r) => ({
          value: r.id ?? roleName(r),
          label: roleName(r),
        }))
        setRoleOptions(opts)
      } catch {
        if (mounted) setRoleOptions([])
      } finally {
        if (mounted) setRolesLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user])

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

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FormItem invalid={!!errors.fullName} errorMessage={errors.fullName?.message}>
              <Controller name="fullName" control={control}
                render={({ field }) => <Input autoComplete="off" placeholder="Full name" {...field} />} />
            </FormItem>
          </div>

          <FormItem invalid={!!errors.phone} errorMessage={errors.phone?.message}>
            <Controller name="phone" control={control}
              render={({ field }) => <Input autoComplete="off" placeholder="Phone" {...field} />} />
          </FormItem>

          <FormItem invalid={!!errors.email} errorMessage={errors.email?.message}>
            <Controller name="email" control={control}
              render={({ field }) => <Input type="email" autoComplete="off" placeholder="Email" {...field} />} />
          </FormItem>

          <FormItem invalid={!!errors.password} errorMessage={errors.password?.message}>
            <Controller name="password" control={control}
              render={({ field }) => <PasswordInput autoComplete="new-password" placeholder="Password (min. 6 chars)" {...field} />} />
          </FormItem>

          <FormItem invalid={!!errors.roleId} errorMessage={errors.roleId?.message}>
            <Controller name="roleId" control={control}
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
                Create
              </Button>
            </div>
          </div>
        </Container>
      </BottomStickyBar>
    </Form>
  )
}

export default CustomerForm
