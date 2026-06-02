import Button from '@/components/ui/Button'
import { TbArrowLeft, TbPencil } from 'react-icons/tb'

type LocationDetailsHeaderProps = {
    title?: string
    locationId: string
    onBack: () => void
    onEdit: () => void
}

const LocationDetailsHeader = ({
    title,
    locationId,
    onBack,
    onEdit,
}: LocationDetailsHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <h3>{title || 'Detalle de ubicación'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Seguridad, accesos y controles operacionales de esta ubicación.
                </p>
            </div>
            <div className="flex gap-2">
                <Button icon={<TbArrowLeft />} onClick={onBack}>
                    Volver
                </Button>
                {locationId ? (
                    <Button variant="solid" icon={<TbPencil />} onClick={onEdit}>
                        Editar
                    </Button>
                ) : null}
            </div>
        </div>
    )
}

export default LocationDetailsHeader
