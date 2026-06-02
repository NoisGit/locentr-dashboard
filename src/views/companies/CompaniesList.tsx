import { Link, useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import useCompaniesList from './useCompaniesList'

const CompaniesList = () => {
    const navigate = useNavigate()
    const { companies, isLoading, error, mutate } = useCompaniesList()

    if (!isLoading && error) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <h3>Companies could not be loaded</h3>
                        <Button variant="solid" onClick={() => mutate()}>
                            Retry
                        </Button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h3>Companies</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage companies and subcompanies in Locentr.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => navigate('/companies/subcompany/create')}>
                                Create subcompany
                            </Button>
                            <Button variant="solid" onClick={() => navigate('/companies/create')}>
                                Create company
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading companies...</p>
                    ) : companies.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No companies found.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                            {companies.map((company) => (
                                <div
                                    key={company.id}
                                    className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                >
                                    <div className="flex flex-col gap-1">
                                        <Link
                                            to={`/companies/${company.id}`}
                                            className="font-semibold hover:text-primary"
                                        >
                                            {company.name}
                                        </Link>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {company.activity || 'No activity'}
                                            {company.id_number ? ` • ${company.id_number}` : ''}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag>{company.parent_company_id ? 'Subcompany' : 'Company'}</Tag>
                                            <Tag>{company.is_active === false ? 'Inactive' : 'Active'}</Tag>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => navigate(`/companies/${company.id}`)}>
                                            View
                                        </Button>
                                        <Button size="sm" onClick={() => navigate(`/companies/${company.id}/edit`)}>
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default CompaniesList
