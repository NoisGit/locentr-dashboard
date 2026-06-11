import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import { apiGetCompanyById, apiUpdateCompany, type Company } from '@/services/CompaniesService'
import { getApiErrorMessage } from '@/utils/apiError'

function cleanValue(value?: string) {
    const trimmed = value?.trim()
    return trimmed || undefined
}

const CompanyEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const companyId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, error, isLoading } = useSWR(
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
            })

            toast.push(
                <Notification type="success">Empresa actualizada correctamente.</Notification>,
                {
                placement: 'top-center',
                },
            )
            navigate(`/companies/${companyId}`)
        } catch (error: unknown) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(error, 'No fue posible actualizar la empresa.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isLoading && error) {
        return (
            <EmptyState
                title="No fue posible cargar la empresa"
                description={getApiErrorMessage(error, 'Revisa la conexión e intenta nuevamente.')}
                actionLabel="Volver a empresas"
                onAction={() => navigate('/companies')}
            />
        )
    }

    return (
        <Loading loading={isLoading}>
            <CompanyForm
                submitLabel="Guardar cambios"
                submitting={isSubmitting}
                defaultValues={{
                    name: data?.name || '',
                    activity: data?.activity || '',
                    id_number: data?.id_number || '',
                    type_document: data?.type_document || '',
                }}
                onSubmit={handleSubmit}
                onCancel={() => navigate(companyId ? `/companies/${companyId}` : '/companies')}
            />
        </Loading>
    )
}

export default CompanyEdit
