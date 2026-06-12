import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'
import type { CreatableUserRole } from '@/services/UsersService'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'
import {
    emailSchema,
    passwordSchema,
    requiredText,
    roleSchema,
    usernameSchema,
} from '@/utils/validation/schemas'

export type UserFormSchema = {
    username: string
    full_name: string
    email: string
    password?: string
    role: CreatableUserRole | ''
    status?: boolean
}

type UsersFormProps = {
    mode?: 'create' | 'edit'
    submitLabel?: string
    submitting?: boolean
    defaultValues?: Partial<UserFormSchema>
    onFormSubmit: (values: UserFormSchema) => void
    onDiscard?: () => void
}

const allCreatableRoleOptions = [
    { label: 'Administrador', value: Role.ADMIN },
    { label: 'Operador', value: Role.OPERATOR },
    { label: 'Cliente', value: Role.CLIENT },
]

const baseValidationSchema = z.object({
    username: usernameSchema,
    full_name: requiredText('El nombre', 160),
    email: emailSchema,
    password: z.string().optional(),
    role: roleSchema,
    status: z.boolean().optional(),
})

const createValidationSchema = baseValidationSchema.extend({
    password: passwordSchema,
})

const UsersForm = ({
    mode = 'create',
    submitLabel,
    submitting,
    defaultValues,
    onFormSubmit,
    onDiscard,
}: UsersFormProps) => {
    const currentRole = useSessionUser((state) => state.user.role)
    const roleOptions =
        currentRole === Role.ADMIN
            ? allCreatableRoleOptions.filter((option) => option.value !== Role.ADMIN)
            : allCreatableRoleOptions

    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserFormSchema>({
        resolver: zodResolver(mode === 'create' ? createValidationSchema : baseValidationSchema),
        defaultValues: {
            username: '',
            full_name: '',
            email: '',
            password: '',
            role: '',
            status: true,
            ...defaultValues,
        },
    })
    const username = watch('username')
    const loginEmail = mode === 'create' && username ? `${username}@locentr.com` : ''

    const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Guardar cambios' : 'Crear usuario')

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onFormSubmit)}
        >
            <Container>
                <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormItem
                            label="Usuario"
                            invalid={!!errors.username}
                            errorMessage={errors.username?.message}
                            extra="Este será el identificador de acceso del usuario."
                        >
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        autoComplete="off"
                                        placeholder="ej. javita"
                                        suffix="@locentr.com"
                                        readOnly={mode === 'edit'}
                                        {...field}
                                        onChange={(event) => {
                                            if (mode === 'edit') return
                                            const value = event.target.value
                                                .toLowerCase()
                                                .replace(/@locentr\.com$/i, '')
                                                .replace(/\s+/g, '')
                                            field.onChange(value)
                                            setValue('email', value ? `${value}@locentr.com` : '', {
                                                shouldValidate: true,
                                            })
                                        }}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Nombre"
                            invalid={!!errors.full_name}
                            errorMessage={errors.full_name?.message}
                        >
                            <Controller
                                name="full_name"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
                            />
                        </FormItem>

                        <FormItem
                            label="Correo de acceso"
                            invalid={!!errors.email}
                            errorMessage={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        readOnly={mode === 'create'}
                                        className={mode === 'create' ? 'cursor-default' : undefined}
                                        placeholder="usuario@locentr.com"
                                        {...field}
                                        value={loginEmail || field.value}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Rol"
                            invalid={!!errors.role}
                            errorMessage={errors.role?.message}
                        >
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={roleOptions}
                                        value={
                                            roleOptions.find(
                                                (option) => option.value === field.value,
                                            ) ?? null
                                        }
                                        onChange={(option) => field.onChange(option?.value ?? '')}
                                    />
                                )}
                            />
                        </FormItem>

                        {mode === 'create' ? (
                        <FormItem
                            label="Contraseña"
                            invalid={!!errors.password}
                            errorMessage={errors.password?.message}
                        >
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        autoComplete="new-password"
                                        type="password"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        ) : null}

                        <FormItem label="Estado">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        className="input input-md h-11"
                                        value={field.value === false ? 'false' : 'true'}
                                        onChange={(event) =>
                                            field.onChange(event.target.value === 'true')
                                        }
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Suspendido</option>
                                    </select>
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>
            </Container>

            <BottomStickyBar>
                <Container>
                    <div className="flex items-center justify-end px-8 gap-3">
                        <Button
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
                </Container>
            </BottomStickyBar>
        </Form>
    )
}

export default UsersForm
