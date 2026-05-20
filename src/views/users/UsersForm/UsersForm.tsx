import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import Input from '@/components/ui/Input'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { TbTrash } from 'react-icons/tb'

export type UserFormSchema = {
    full_name: string
    email: string
    phone?: string
    password?: string
    role_id: string
}

type UsersFormProps = {
    mode?: 'create' | 'edit'
    submitLabel?: string
    submitting?: boolean
    defaultValues?: Partial<UserFormSchema>
    onFormSubmit: (values: UserFormSchema) => void
    onDiscard?: () => void
}

const validationSchema = z.object({
    full_name: z.string().min(1, { message: 'El nombre es obligatorio' }),
    email: z.string().email({ message: 'Ingresa un email válido' }),
    phone: z.string().optional(),
    password: z.string().optional(),
    role_id: z.string().min(1, { message: 'El rol es obligatorio' }),
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
            full_name: '',
            email: '',
            phone: '',
            password: '',
            role_id: '',
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
                        <div className="md:col-span-2">
                            <FormItem label="Nombre" invalid={!!errors.full_name} errorMessage={errors.full_name?.message}>
                                <Controller
                                    name="full_name"
                                    control={control}
                                    render={({ field }) => <Input autoComplete="off" {...field} />}
                                />
                            </FormItem>
                        </div>

                        <FormItem label="Email" invalid={!!errors.email} errorMessage={errors.email?.message}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
                            />
                        </FormItem>

                        <FormItem label="Teléfono" invalid={!!errors.phone} errorMessage={errors.phone?.message}>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" placeholder="Opcional" {...field} />}
                            />
                        </FormItem>

                        <FormItem label="Rol ID" invalid={!!errors.role_id} errorMessage={errors.role_id?.message}>
                            <Controller
                                name="role_id"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
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
