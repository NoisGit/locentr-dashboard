import useSWR from 'swr'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { apiListPlans } from '@/services/SubscriptionsService'

const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(cents / 100)

const Pricing = () => {
    const { data: plans = [] } = useSWR('public:plans', apiListPlans)

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-14 dark:bg-gray-950">
            <div className="mx-auto max-w-6xl">
                <div className="text-center">
                    <p className="font-semibold text-primary">
                        Locentr para operaciones empresariales
                    </p>
                    <h1 className="mt-3 text-4xl font-bold">
                        14 días para probar la operación completa
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
                        Empresas, ubicaciones, control de accesos, documentos
                        privados, auditoría y soporte en una sola plataforma.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card key={plan.code} className="flex h-full flex-col">
                            <h2 className="text-xl font-semibold">{plan.name}</h2>
                            <p className="mt-2 min-h-12 text-sm text-gray-500">
                                {plan.description}
                            </p>
                            <p className="mt-5 text-3xl font-bold">
                                {formatPrice(plan.monthly_price_cents)}
                                <span className="text-sm font-normal text-gray-500">
                                    {' '}
                                    / mes
                                </span>
                            </p>
                            <ul className="mt-6 flex-1 space-y-2 text-sm">
                                <li>{plan.qty_locations} ubicaciones</li>
                                <li>{plan.qty_admins} administradores</li>
                                <li>{plan.qty_operators} operadores</li>
                                <li>
                                    {plan.qty_daily_reads.toLocaleString('es-CL')}{' '}
                                    accesos diarios
                                </li>
                                <li>
                                    {Math.round(
                                        plan.qty_storage_bytes /
                                            1024 /
                                            1024 /
                                            1024,
                                    )}{' '}
                                    GB privados
                                </li>
                            </ul>
                            <Link className="mt-7" to="/start-trial">
                                <Button className="w-full">
                                    Comenzar prueba gratis
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>

                <div className="mt-10 text-center text-sm">
                    ¿Ya tienes una cuenta?{' '}
                    <Link className="font-semibold text-primary" to="/auth/sign-in">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default Pricing
