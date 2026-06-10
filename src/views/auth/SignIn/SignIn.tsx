import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    disableSubmit?: boolean
}

export const SignInBase = ({
    forgetPasswordUrl = '/forgot-password',
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const mode = useThemeStore((state) => state.mode)

    return (
        <>
            <div className="mb-8">
                <Logo
                    type="full"
                    mode={mode}
                    disableLink
                    logoWidth={170}
                />
            </div>

            <div className="mb-9">
                <span className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Plataforma de operaciones
                </span>
                <h2 className="mb-3">Bienvenido a Locentr</h2>
                <p className="max-w-sm font-normal leading-6 text-gray-500 dark:text-gray-400">
                    Ingresa a tu espacio de trabajo para gestionar sedes, accesos y equipos.
                </p>
            </div>

            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}

            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={setMessage}
                passwordHint={
                    <div className="mb-7 mt-2 text-right">
                        <ActionLink
                            to={forgetPasswordUrl}
                            className="font-semibold text-primary hover:text-primary-deep"
                        >
                            ¿Olvidaste tu contraseña?
                        </ActionLink>
                    </div>
                }
            />
        </>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
