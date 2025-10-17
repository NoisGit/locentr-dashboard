import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import SpaceSignBoard from '@/assets/svg/SpaceSignBoard'

const AccessDenied = () => {
    const navigate = useNavigate()

    const handleGoBack = () => {
        // Intentar ir hacia atrás, si no hay historial, ir al home
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    const handleGoHome = () => {
        navigate('/')
    }

    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <SpaceSignBoard height={280} width={280} />
                <div className="mt-10 text-center">
                    <h3 className="mb-2">¡Acceso Denegado!</h3>
                    <p className="text-base mb-6">
                        No tienes permiso para acceder a esta página
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="solid"
                            onClick={handleGoBack}
                        >
                            Volver Atrás
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleGoHome}
                        >
                            Ir al Inicio
                        </Button>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default AccessDenied
