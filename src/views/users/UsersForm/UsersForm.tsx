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
import type { UserRole } from '@/services/UsersService'

export type UserFormSchema = {
    username: string
    full_name: string
    email: string
    password?: string
    role: UserRole | string
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

const roleOptions = [
    { label: 'SUPERADMIN', value: 'SUPERADMIN' },
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'OPERATOR', value: 'OPERATOR' },
    { label: 'CLIENT', value: 'CLIENT' },
]

const validationSchema = z.object({
    username: z.string().min(1, { message: 'El username es obligatorio' }),
    full_name: z.string().min(1, { message: 'El nombre es obligatorio' }),
    email: z.string().email({ message: 'Ingresa un email válido' }),
    password: z.string().optional(),
    role: z.string().min(1, { message: 'El rol es obligatorio' }),
    status: z.boolean().optional(),
})

const UsersForm = ({
    mode = 'create',
    submitLabel,
    submitting,
    defaultValues,
    onFormSubmit,
    onDiscard,
}: UsersFormProps) => {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<UserFormSchema>({
        resolver: zodResolver(validationSchema),
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
                        <FormItem label="Username" invalid={!!errors.username} errorMessage={errors.username?.message}>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
                            />
                        </FormItem>

                        <FormItem label="Nombre" invalid={!!errors.full_name} errorMessage={errors.full_name?.message}>
                            <Controller
                                name="full_name"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
                            />
                        </FormItem>

                        <FormItem label="Email" invalid={!!errors.email} errorMessage={errors.email?.message}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
                            />
                        </FormItem>

                        <FormItem label="Rol" invalid={!!errors.role} errorMessage={errors.role?.message}>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={roleOptions}
                                        value={roleOptions.find((option) => option.value === field.value) ?? null}
                                        onChange={(option) => field.onChange(option?.value ?? '')}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem label="Contraseña" invalid={!!errors.password} errorMessage={errors.password?.message}>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        autoComplete="new-password"
                                        type="password"
                                        placeholder={mode === 'edit' ? 'Opcional' : ''}
                                        {...field}
                                    />
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
