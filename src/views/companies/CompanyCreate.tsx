import { useState } from 'react'
import { useNavigate } from 'react-router'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import { apiCreateCompany } from '@/services/CompaniesService'
import { getApiErrorMessage } from '@/utils/apiError'

function cleanValue(value?: string) {
    const trimmed = value?.trim()
    return trimmed || undefined
}

const CompanyCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: CompanyFormSchema) => {
        try {
            setIsSubmitting(true)
            await apiCreateCompany({
                name: values.name.trim(),
                activity: cleanValue(values.activity),
                id_number: cleanValue(values.id_number),
                type_document: cleanValue(values.type_document),
            })

            toast.push(<Notification type="success">Empresa creada correctamente.</Notification>, {
                placement: 'top-center',
            })
            navigate('/companies')
        } catch (error: unknown) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(error, 'No fue posible crear la empresa.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <CompanyForm
            submitLabel="Crear empresa"
            submitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/companies')}
        />
    )
}

export default CompanyCreate
