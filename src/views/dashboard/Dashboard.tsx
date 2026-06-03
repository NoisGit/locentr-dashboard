import { useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import { TbBuildingCommunity, TbUsers, TbShieldCheck } from 'react-icons/tb'

const Dashboard = () => {
    const navigate = useNavigate()

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h2>Locentr Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage multi-company and multi-location operations from one clean workspace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <TbUsers className="text-3xl text-primary" />
                                <div>
                                    <h5>Users</h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Manage user accounts and roles.
                                    </p>
                                </div>
                            </div>
                            <Button onClick={() => navigate('/users')}>Open users</Button>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <TbBuildingCommunity className="text-3xl text-primary" />
                                <div>
                                    <h5>Locations</h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Manage locations connected to companies.
                                    </p>
                                </div>
                            </div>
                            <Button onClick={() => navigate('/locations')}>Open locations</Button>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <TbShieldCheck className="text-3xl text-primary" />
                                <div>
                                    <h5>Security baseline</h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        CID and OWASP checks are tracked as project tasks.
                                    </p>
                                </div>
                            </div>
                            <Button disabled>Pending checklist</Button>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="flex flex-col gap-2">
                        <h4>Next Locentr modules</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Support tickets, documents, notifications, access logs and audit log will be added as API-aligned modules.
                        </p>
                    </div>
                </Card>
            </div>
        </Container>
    )
}

export default Dashboard
