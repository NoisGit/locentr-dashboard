import { useState } from 'react'
import { useNavigate } from 'react-router'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import { apiCreateSubCompany } from '@/services/CompaniesService'

function cleanValue(value?: string) {
    const trimmed = value?.trim()
    return trimmed || undefined
}

function toOptionalNumber(value?: string) {
    const trimmed = value?.trim()
    if (!trimmed) return undefined

    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? undefined : parsed
}

const CompanySubCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: CompanyFormSchema) => {
        try {
            setIsSubmitting(true)
            await apiCreateSubCompany({
                name: values.name.trim(),
                activity: cleanValue(values.activity),
                id_number: cleanValue(values.id_number),
                type_document: cleanValue(values.type_document),
                logo: cleanValue(values.logo),
                parent_company_id: toOptionalNumber(values.parent_company_id),
            })

            toast.push(<Notification type="success">Subcompany created successfully.</Notification>, {
                placement: 'top-center',
            })
            navigate('/companies')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Subcompany could not be created.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <CompanyForm
            mode="subcompany"
            submitLabel="Create subcompany"
            submitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/companies')}
        />
    )
}

export default CompanySubCreate
