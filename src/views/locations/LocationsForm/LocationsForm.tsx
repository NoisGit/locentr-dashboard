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
import type { ReactNode } from 'react'

export type LocationFormSchema = {
    name: string
    address: string
    country?: string
    logo?: string
}

type LocationsFormProps = {
    mode?: 'create' | 'edit'
    submitLabel?: string
    submitting?: boolean
    defaultValues?: Partial<LocationFormSchema>
    children?: ReactNode
    onFormSubmit: (values: LocationFormSchema) => void
    onDiscard?: () => void
}

const validationSchema = z.object({
    name: z.string().min(1, { message: 'El nombre es obligatorio' }),
    address: z.string().min(1, { message: 'La dirección es obligatoria' }),
    country: z.string().optional(),
    logo: z.string().optional(),
})

const LocationsForm = ({
    mode = 'create',
    submitLabel,
    submitting,
    defaultValues,
    onFormSubmit,
    onDiscard,
}: LocationsFormProps) => {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LocationFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            address: '',
            country: '',
            logo: '',
            ...defaultValues,
        },
    })

    const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Guardar cambios' : 'Crear ubicación')

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
                            <FormItem label="Nombre" invalid={!!errors.name} errorMessage={errors.name?.message}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => <Input autoComplete="off" {...field} />}
                                />
                            </FormItem>
                        </div>

                        <div className="md:col-span-2">
                            <FormItem label="Dirección" invalid={!!errors.address} errorMessage={errors.address?.message}>
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => <Input autoComplete="off" {...field} />}
                                />
                            </FormItem>
                        </div>

                        <FormItem label="País" invalid={!!errors.country} errorMessage={errors.country?.message}>
                            <Controller
                                name="country"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" placeholder="Opcional" {...field} />}
                            />
                        </FormItem>

                        <FormItem label="Logo" invalid={!!errors.logo} errorMessage={errors.logo?.message}>
                            <Controller
                                name="logo"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" placeholder="Opcional" {...field} />}
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

export default LocationsForm
