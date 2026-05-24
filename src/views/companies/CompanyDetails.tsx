import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbArrowLeft, TbPencil, TbPower } from 'react-icons/tb'
import {
    apiDeactivateCompany,
    apiGetCompanyById,
    type Company,
} from '@/services/CompaniesService'

const CompanyDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const companyId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isDeactivating, setIsDeactivating] = useState(false)

    const { data, isLoading } = useSWR(
        companyId ? ['companies:detail', companyId] : null,
        ([, currentId]) => apiGetCompanyById<Company>(currentId as string),
        { revalidateOnFocus: false },
    )

    const handleDeactivate = async () => {
        if (!companyId) return

        const confirmed = window.confirm(
            'This company will be deactivated. Its history will remain available if the account is reactivated later.',
        )

        if (!confirmed) return

        try {
            setIsDeactivating(true)
            await apiDeactivateCompany(companyId)

            toast.push(<Notification type="success">Company deactivated successfully.</Notification>, {
                placement: 'top-center',
            })
            navigate('/companies')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Company could not be deactivated.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsDeactivating(false)
        }
    }

    return (
        <Loading loading={isLoading}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3>{data?.name || 'Company details'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Company profile and Coredeck metadata.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button icon={<TbArrowLeft />} onClick={() => navigate('/companies')}>
                            Back
                        </Button>
                        {companyId ? (
                            <Button
                                variant="solid"
                                icon={<TbPencil />}
                                onClick={() => navigate(`/companies/${companyId}/edit`)}
                            >
                                Edit
                            </Button>
                        ) : null}
                        {companyId ? (
                            <Button
                                icon={<TbPower />}
                                loading={isDeactivating}
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                onClick={handleDeactivate}
                            >
                                Deactivate
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
                            <div className="font-medium">{data?.name || 'No name'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                            <div>
                                <Tag>{data?.is_active === false ? 'Inactive' : 'Active'}</Tag>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                            <div className="font-medium">
                                {data?.parent_company_id ? 'Subcompany' : 'Company'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Parent company ID</div>
                            <div className="font-medium">{data?.parent_company_id || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Activity</div>
                            <div className="font-medium">{data?.activity || 'No activity'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID number</div>
                            <div className="font-medium">{data?.id_number || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Document type</div>
                            <div className="font-medium">{data?.type_document || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Created at</div>
                            <div className="font-medium">{data?.created_at || 'N/A'}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </Loading>
    )
}

export default CompanyDetails
