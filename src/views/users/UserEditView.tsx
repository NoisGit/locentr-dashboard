import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'

const UserEditView = () => {
    const navigate = useNavigate()

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div>
                        <h3>Editar usuario</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Actualiza la información, el rol y el acceso del usuario.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => navigate('/users')}>Volver</Button>
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default UserEditView
