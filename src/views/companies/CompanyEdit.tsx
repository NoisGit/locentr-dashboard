import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import {
    apiGetCompanyById,
    apiUpdateCompany,
    type Company,
} from '@/services/CompaniesService'

function cleanValue(value?: string) {
    const trimmed = value?.trim()
    return trimmed || undefined
}

const CompanyEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const companyId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, isLoading } = useSWR(
        companyId ? ['companies:detail', companyId] : null,
        ([, currentId]) => apiGetCompanyById<Company>(currentId as string),
        { revalidateOnFocus: false },
    )

    const handleSubmit = async (values: CompanyFormSchema) => {
        if (!companyId) return

        try {
            setIsSubmitting(true)
            await apiUpdateCompany(companyId, {
                name: values.name.trim(),
                activity: cleanValue(values.activity),
                id_number: cleanValue(values.id_number),
                type_document: cleanValue(values.type_document),
                logo: cleanValue(values.logo),
            })

            toast.push(<Notification type="success">Company updated successfully.</Notification>, {
                placement: 'top-center',
            })
            navigate(`/companies/${companyId}`)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Company could not be updated.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Loading loading={isLoading}>
            <CompanyForm
                submitLabel="Save changes"
                submitting={isSubmitting}
                defaultValues={{
                    name: data?.name || '',
                    activity: data?.activity || '',
                    id_number: data?.id_number || '',
                    type_document: data?.type_document || '',
                    logo: data?.logo || '',
                }}
                onSubmit={handleSubmit}
                onCancel={() => navigate(companyId ? `/companies/${companyId}` : '/companies')}
            />
        </Loading>
    )
}

export default CompanyEdit
