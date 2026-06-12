import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Notification from '@/components/ui/Notification'
import { apiVerifyEmail } from '@/services/LifecycleService'
import { getApiErrorMessage } from '@/utils/apiError'

const VerifyEmail = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''
    const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Verificando tu correo...')

    useEffect(() => {
        if (!token) {
            setState('error')
            setMessage('El enlace de verificación está incompleto.')
            return
        }
        void apiVerifyEmail(token)
            .then(() => {
                setState('success')
                setMessage('Tu correo quedó verificado correctamente.')
            })
            .catch((error) => {
                setState('error')
                setMessage(getApiErrorMessage(error, 'El enlace ya expiró o fue utilizado.'))
            })
    }, [token])

    return (
        <main className="min-h-screen bg-gray-50 px-5 py-20 dark:bg-gray-950">
            <Card className="mx-auto max-w-lg text-center">
                <p className="text-sm font-semibold text-primary">Seguridad de cuenta</p>
                <h1 className="mt-2 text-3xl font-bold">Verificación de correo</h1>
                <Notification
                    className="mt-6 text-left"
                    type={state === 'success' ? 'success' : state === 'error' ? 'danger' : 'info'}
                >
                    {message}
                </Notification>
                <Link className="mt-6 block text-sm font-semibold text-primary" to="/auth/sign-in">
                    Ir al inicio de sesión
                </Link>
            </Card>
        </main>
    )
}

export default VerifyEmail
