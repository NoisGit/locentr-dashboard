import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'

export type CompanyFormSchema = {
    name: string
    activity?: string
    id_number?: string
    type_document?: string
    logo?: string
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
    name: z.string().min(1, { message: 'Company name is required' }),
    activity: z.string().optional(),
    id_number: z.string().optional(),
    type_document: z.string().optional(),
    logo: z.string().optional(),
    parent_company_id: z.string().optional(),
})

const CompanyForm = ({
    mode = 'company',
    submitLabel = 'Save company',
    submitting,
    defaultValues,
    onSubmit,
    onCancel,
}: CompanyFormProps) => {
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
            logo: '',
            parent_company_id: '',
            ...defaultValues,
        },
    })

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <FormItem label="Company name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => <Input autoComplete="off" {...field} />}
                            />
                        </FormItem>
                    </div>

                    <FormItem label="Activity" invalid={!!errors.activity} errorMessage={errors.activity?.message}>
                        <Controller
                            name="activity"
                            control={control}
                            render={({ field }) => <Input autoComplete="off" placeholder="Optional" {...field} />}
                        />
                    </FormItem>

                    <FormItem label="ID number" invalid={!!errors.id_number} errorMessage={errors.id_number?.message}>
                        <Controller
                            name="id_number"
                            control={control}
                            render={({ field }) => <Input autoComplete="off" placeholder="Optional" {...field} />}
                        />
                    </FormItem>

                    <FormItem label="Document type" invalid={!!errors.type_document} errorMessage={errors.type_document?.message}>
                        <Controller
                            name="type_document"
                            control={control}
                            render={({ field }) => <Input autoComplete="off" placeholder="Optional" {...field} />}
                        />
                    </FormItem>

                    <FormItem label="Logo URL" invalid={!!errors.logo} errorMessage={errors.logo?.message}>
                        <Controller
                            name="logo"
                            control={control}
                            render={({ field }) => <Input autoComplete="off" placeholder="Optional" {...field} />}
                        />
                    </FormItem>

                    {mode === 'subcompany' ? (
                        <div className="md:col-span-2">
                            <FormItem
                                label="Parent company ID"
                                invalid={!!errors.parent_company_id}
                                errorMessage={errors.parent_company_id?.message}
                            >
                                <Controller
                                    name="parent_company_id"
                                    control={control}
                                    render={({ field }) => <Input autoComplete="off" placeholder="Optional" {...field} />}
                                />
                            </FormItem>
                        </div>
                    ) : null}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="solid" type="submit" loading={!!submitting}>
                        {submitLabel}
                    </Button>
                </div>
            </Card>
        </Form>
    )
}

export default CompanyForm
