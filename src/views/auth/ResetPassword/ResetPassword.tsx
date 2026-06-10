import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ResetPasswordForm from './components/ResetPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useNavigate, useSearchParams } from 'react-router'

type ResetPasswordProps = {
    signInUrl?: string
}

export const ResetPasswordBase = ({
    signInUrl = '/auth/sign-in',
}: ResetPasswordProps) => {
    const [resetComplete, setResetComplete] = useState(false)
    const [message, setMessage] = useTimeOutMessage()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const resetToken =
        searchParams.get('token') || searchParams.get('reset_token') || ''

    const handleContinue = () => {
        navigate(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {resetComplete ? (
                    <>
                        <h3 className="mb-1">Contraseña actualizada</h3>
                        <p className="font-semibold heading-text">
                            Tu contraseña fue restablecida correctamente.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-1">Crea una nueva contraseña</h3>
                        <p className="font-semibold heading-text">
                            Utiliza una contraseña segura y diferente a la
                            anterior.
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ResetPasswordForm
                resetToken={resetToken}
                resetComplete={resetComplete}
                setMessage={setMessage}
                setResetComplete={setResetComplete}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    Continuar
                </Button>
            </ResetPasswordForm>
            <div className="mt-4 text-center">
                <span>Volver a </span>
                <ActionLink
                    to={signInUrl}
                    className="heading-text font-bold"
                    themeColor={false}
                >
                    iniciar sesión
                </ActionLink>
            </div>
        </div>
    )
}

const ResetPassword = () => {
    return <ResetPasswordBase />
}

export default ResetPassword
