import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiCreatePoliceLogbookAccess,
    resolvePoliceAccessUrl,
} from '@/services/LocationLogbookService'
import { getApiErrorMessage } from '@/utils/apiError'
import { captureEvent } from '@/services/TelemetryService'
import {
    TbCheck,
    TbCopy,
    TbExternalLink,
    TbQrcode,
    TbRefresh,
} from 'react-icons/tb'

type PoliceAccessPanelProps = {
    locationId: number
}

function formatExpiry(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Vencimiento no disponible'

    return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const PoliceAccessPanel = ({ locationId }: PoliceAccessPanelProps) => {
    const [accessUrl, setAccessUrl] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [copied, setCopied] = useState(false)

    const generateAccess = async () => {
        if (!Number.isFinite(locationId)) return

        try {
            setIsGenerating(true)
            setCopied(false)
            const response = await apiCreatePoliceLogbookAccess({
                location_id: locationId,
            })
            setAccessUrl(resolvePoliceAccessUrl(response.relative_path))
            setExpiresAt(response.expires_at)
            captureEvent('logbook.police_access_generated', {
                locationId,
                expiresAt: response.expires_at,
            })
            toast.push(
                <Notification type="success">
                    Acceso policial generado.
                </Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(
                        error,
                        'No se pudo generar el acceso policial.',
                    )}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsGenerating(false)
        }
    }

    const copyAccess = async () => {
        if (!accessUrl) return
        await navigator.clipboard.writeText(accessUrl)
        setCopied(true)
    }

    return (
        <section className="flex flex-col gap-5">
            <div>
                <h5>Acceso temporal para Carabineros de Chile</h5>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    El QR abre únicamente la vista pública del libro de
                    novedades. No entrega acceso al panel ni a otros módulos.
                </p>
            </div>

            {!accessUrl ? (
                <div className="border-y border-gray-200 py-5 dark:border-gray-700">
                    <Button
                        variant="solid"
                        icon={<TbQrcode />}
                        loading={isGenerating}
                        onClick={generateAccess}
                    >
                        Generar código QR
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 border-y border-gray-200 py-6 dark:border-gray-700 lg:grid-cols-[240px_1fr]">
                    <div className="flex items-center justify-center rounded-2xl bg-white p-5">
                        <QRCodeSVG
                            value={accessUrl}
                            size={196}
                            level="H"
                            marginSize={1}
                            title="QR de acceso policial al libro de novedades"
                        />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center gap-4">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Vigencia
                            </div>
                            <div className="mt-1 font-semibold">
                                Hasta {formatExpiry(expiresAt)}
                            </div>
                        </div>

                        <div className="break-all rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800">
                            {accessUrl}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                icon={copied ? <TbCheck /> : <TbCopy />}
                                onClick={copyAccess}
                            >
                                {copied ? 'Enlace copiado' : 'Copiar enlace'}
                            </Button>
                            <Button
                                icon={<TbExternalLink />}
                                onClick={() =>
                                    window.open(
                                        accessUrl,
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }
                            >
                                Abrir vista policial
                            </Button>
                            <Button
                                icon={<TbRefresh />}
                                loading={isGenerating}
                                onClick={generateAccess}
                            >
                                Consultar vigencia
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <p className="border-l-2 border-warning pl-3 text-sm text-gray-500 dark:text-gray-400">
                Seguridad actual de la API: el permiso vence en 30 minutos y
                puede reutilizarse durante ese plazo. La invalidación al primer
                escaneo debe implementarse en el backend.
            </p>
        </section>
    )
}

export default PoliceAccessPanel
