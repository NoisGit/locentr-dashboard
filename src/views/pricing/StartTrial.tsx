import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import useAuth from '@/auth/useAuth'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import { apiStartTrial } from '@/services/SubscriptionsService'
import { getApiErrorMessage } from '@/utils/apiError'
import type { FormEvent } from 'react'

const StartTrial = () => {
    const { oAuthSignIn } = useAuth()
    const selectCompany = useCompaniesStore((state) => state.selectCompany)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        companyName: '',
        activity: '',
        idNumber: '',
        typeDocument: 'RUT',
        fullName: '',
        username: '',
        email: '',
        password: '',
        locationName: '',
        address: '',
        country: 'Chile',
    })

    const update = (field: keyof typeof form, value: string) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await apiStartTrial({
                company: {
                    name: form.companyName,
                    activity: form.activity || null,
                    id_number: form.idNumber,
                    type_document: form.typeDocument,
                },
                admin: {
                    username: form.username,
                    full_name: form.fullName,
                    email: form.email,
                    password: form.password,
                },
                location: {
                    name: form.locationName,
                    address: form.address,
                    country: form.country || null,
                },
            })
            oAuthSignIn(({ onSignIn, redirect }) => {
                onSignIn({
                    accessToken: `Bearer ${response.access_token}`,
                    refreshToken: response.refresh_token,
                })
                selectCompany({
                    id: response.company_id,
                    name: form.companyName,
                })
                redirect()
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(
                        error,
                        'No se pudo iniciar la prueba gratuita.',
                    )}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-5 py-10 dark:bg-gray-950">
            <Card className="mx-auto max-w-4xl">
                <div className="mb-7">
                    <p className="font-semibold text-primary">
                        Prueba gratuita de 14 días
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">
                        Crea tu espacio de operación
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Incluye una empresa, su primer administrador y la
                        primera ubicación. No requiere tarjeta.
                    </p>
                </div>

                <form className="space-y-7" onSubmit={handleSubmit}>
                    <section>
                        <h2 className="mb-3 font-semibold">Empresa</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                required
                                placeholder="Nombre de empresa"
                                value={form.companyName}
                                onChange={(event) =>
                                    update('companyName', event.target.value)
                                }
                            />
                            <Input
                                placeholder="Actividad"
                                value={form.activity}
                                onChange={(event) =>
                                    update('activity', event.target.value)
                                }
                            />
                            <Input
                                required
                                placeholder="RUT / identificador fiscal"
                                value={form.idNumber}
                                onChange={(event) =>
                                    update('idNumber', event.target.value)
                                }
                            />
                            <Input
                                required
                                placeholder="Tipo de documento"
                                value={form.typeDocument}
                                onChange={(event) =>
                                    update('typeDocument', event.target.value)
                                }
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-3 font-semibold">Administrador</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                required
                                placeholder="Nombre completo"
                                value={form.fullName}
                                onChange={(event) =>
                                    update('fullName', event.target.value)
                                }
                            />
                            <Input
                                required
                                placeholder="Usuario"
                                value={form.username}
                                onChange={(event) =>
                                    update('username', event.target.value)
                                }
                            />
                            <Input
                                required
                                type="email"
                                placeholder="Correo"
                                value={form.email}
                                onChange={(event) =>
                                    update('email', event.target.value)
                                }
                            />
                            <Input
                                required
                                type="password"
                                minLength={8}
                                placeholder="Contraseña segura"
                                value={form.password}
                                onChange={(event) =>
                                    update('password', event.target.value)
                                }
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-3 font-semibold">Primera ubicación</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                required
                                placeholder="Nombre de ubicación"
                                value={form.locationName}
                                onChange={(event) =>
                                    update('locationName', event.target.value)
                                }
                            />
                            <Input
                                required
                                placeholder="Dirección"
                                value={form.address}
                                onChange={(event) =>
                                    update('address', event.target.value)
                                }
                            />
                            <Input
                                placeholder="País"
                                value={form.country}
                                onChange={(event) =>
                                    update('country', event.target.value)
                                }
                            />
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                        <Link to="/pricing">
                            <Button type="button" variant="plain">
                                Volver a planes
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Crear prueba gratuita
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    )
}

export default StartTrial
