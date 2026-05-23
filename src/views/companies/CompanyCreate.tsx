import { useState } from 'react'
import { useNavigate } from 'react-router'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import { apiCreateCompany } from '@/services/CompaniesService'

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
                logo: cleanValue(values.logo),
            })

            toast.push(<Notification type="success">Company created successfully.</Notification>, {
                placement: 'top-center',
            })
            navigate('/companies')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Company could not be created.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <CompanyForm
            submitLabel="Create company"
            submitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/companies')}
        />
    )
}

export default CompanyCreate
