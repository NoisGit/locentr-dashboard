import { useNavigate, useParams } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'

const UserEditView = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div>
                        <h3>Edit user</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {id}</p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => navigate('/users')}>Back</Button>
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default UserEditView
