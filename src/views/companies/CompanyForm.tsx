import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import useCompaniesList from './useCompaniesList'
import { optionalText, requiredText } from '@/utils/validation/schemas'

export type CompanyFormSchema = {
    name: string
    activity?: string
    id_number?: string
    type_document?: string
    parent_company_id?: string
}

type CompanyFormProps = {
    mode?: 'company' | 'subcompany'
    submitLabel?: string
    submitting?: boolean
    defaultValues?: Partial<CompanyFormSchema>
    onSubmit: (values: CompanyFormSchema) => void
    onCancel: () => void
}

const validationSchema = z.object({
    name: requiredText('El nombre de la empresa', 100),
    activity: optionalText('La actividad', 160),
    id_number: requiredText('El número de documento', 50),
    type_document: requiredText('El tipo de documento', 30),
    parent_company_id: optionalText('La empresa principal', 30),
})

const CompanyForm = ({
    mode = 'company',
    submitLabel = 'Guardar empresa',
    submitting,
    defaultValues,
    onSubmit,
    onCancel,
}: CompanyFormProps) => {
    const { companies, isLoading: companiesLoading } = useCompaniesList()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CompanyFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            activity: '',
            id_number: '',
            type_document: '',
            parent_company_id: '',
            ...defaultValues,
        },
    })

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <FormItem
                            asterisk
                            label="Nombre de la empresa"
                            invalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        >
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input autoComplete="off" {...field} />
                                )}
                            />
                        </FormItem>
                    </div>

                    <FormItem
                        label="Actividad"
                        invalid={!!errors.activity}
                        errorMessage={errors.activity?.message}
                    >
                        <Controller
                            name="activity"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    autoComplete="off"
                                    placeholder="Opcional"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        asterisk
                        label="Número de documento"
                        invalid={!!errors.id_number}
                        errorMessage={errors.id_number?.message}
                    >
                        <Controller
                            name="id_number"
                            control={control}
                            render={({ field }) => (
                                <Input autoComplete="off" {...field} />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        asterisk
                        label="Tipo de documento"
                        invalid={!!errors.type_document}
                        errorMessage={errors.type_document?.message}
                    >
                        <Controller
                            name="type_document"
                            control={control}
                            render={({ field }) => (
                                <select
                                    className="input input-md h-11"
                                    {...field}
                                >
                                    <option value="">Selecciona un tipo</option>
                                    <option value="RUT">RUT</option>
                                    <option value="NIT">NIT</option>
                                    <option value="RFC">RFC</option>
                                    <option value="CUIT">CUIT</option>
                                    <option value="RUC">RUC</option>
                                    <option value="TAX_ID">
                                        Identificación fiscal
                                    </option>
                                </select>
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Logotipo PNG"
                        extra=" La API todavía no entrega una URL firmada para subir el archivo."
                    >
                        <Button
                            className="w-full justify-start"
                            type="button"
                            disabled
                        >
                            Seleccionar archivo PNG
                        </Button>
                    </FormItem>

                    {mode === 'subcompany' ? (
                        <div className="md:col-span-2">
                            <FormItem
                                label="Empresa principal"
                                invalid={!!errors.parent_company_id}
                                errorMessage={errors.parent_company_id?.message}
                            >
                                <Controller
                                    name="parent_company_id"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            className="input input-md h-11"
                                            {...field}
                                        >
                                            <option value="">
                                                {companiesLoading
                                                    ? 'Cargando empresas...'
                                                    : 'Selecciona una empresa'}
                                            </option>
                                            {companies
                                                .filter(
                                                    (company) =>
                                                        !company.parent_company_id,
                                                )
                                                .map((company) => (
                                                    <option
                                                        key={company.id}
                                                        value={String(
                                                            company.id,
                                                        )}
                                                    >
                                                        {company.name}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                />
                            </FormItem>
                        </div>
                    ) : null}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={!!submitting}
                    >
                        {submitLabel}
                    </Button>
                </div>
            </Card>
        </Form>
    )
}

export default CompanyForm
