import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import useAuth from '@/auth/useAuth'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { apiAcceptInvitation } from '@/services/TeamsService'
import { getApiErrorMessage } from '@/utils/apiError'
import type { FormEvent } from 'react'

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''
    const { oAuthSignIn } = useAuth()
    const selectCompany = useCompaniesStore((state) => state.selectCompany)
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (password !== confirmation) {
            setError('Las contraseñas no coinciden.')
            return
        }
        setIsSubmitting(true)
        setError('')
        try {
            const response = await apiAcceptInvitation(token, password)
            oAuthSignIn(({ onSignIn, redirect }) => {
                onSignIn({
                    accessToken: `Bearer ${response.access_token}`,
                    refreshToken: response.refresh_token,
                })
                selectCompany({
                    id: response.company_id,
                    name: 'Mi empresa',
                })
                redirect()
            })
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'La invitación no es válida o ya expiró.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-5 py-16 dark:bg-gray-950">
            <Card className="mx-auto max-w-lg">
                <p className="text-sm font-semibold text-primary">Invitación a Locentr</p>
                <h1 className="mt-2 text-3xl font-bold">Activa tu acceso</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Define una contraseña segura para ingresar al espacio de tu empresa.
                </p>
                {!token ? (
                    <Notification className="mt-6" type="danger">
                        El enlace no contiene un token de invitación.
                    </Notification>
                ) : (
                    <form className="mt-7 space-y-4" onSubmit={submit}>
                        {error ? <Notification type="danger">{error}</Notification> : null}
                        <Input
                            required
                            type="password"
                            minLength={8}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        <Input
                            required
                            type="password"
                            minLength={8}
                            placeholder="Confirmar contraseña"
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                        />
                        <Button block type="submit" variant="solid" loading={isSubmitting}>
                            Aceptar invitación
                        </Button>
                    </form>
                )}
                <Link
                    className="mt-6 block text-center text-sm font-semibold text-primary"
                    to="/auth/sign-in"
                >
                    Volver al inicio de sesión
                </Link>
            </Card>
        </main>
    )
}

export default AcceptInvitation
