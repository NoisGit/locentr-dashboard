import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import EmptyState from '@/components/shared/EmptyState'
import LocationsForm, { type LocationFormSchema } from '../LocationsForm/LocationsForm'
import { apiGetLocationById, apiUpdateLocation } from '@/services/LocationsService'
import { getApiErrorMessage } from '@/utils/apiError'

const LocationsEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const locationId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, error, isLoading, mutate } = useSWR(
        locationId ? ['locations:detail', locationId] : null,
        ([, currentId]) => apiGetLocationById(currentId as string),
        { revalidateOnFocus: false },
    )

    const defaultValues = useMemo(
        (): Partial<LocationFormSchema> => ({
        name: data?.name || '',
        address: data?.address || '',
        country: data?.country || '',
        }),
        [data],
    )

    const formKey = useMemo(
        () => `location-${locationId}-${data?.name ?? 'empty'}`,
        [locationId, data?.name],
    )

    const handleFormSubmit = async (values: LocationFormSchema) => {
        if (!locationId) return

        try {
            setIsSubmitting(true)
            await apiUpdateLocation(locationId, {
                name: values.name.trim(),
                address: values.address.trim(),
                country: values.country?.trim() || null,
            })
            toast.push(
                <Notification type="success">Edificio actualizado correctamente.</Notification>,
                {
                placement: 'top-center',
                },
            )
            await mutate()
            navigate('/buildings')
        } catch (error: unknown) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(error, 'No se pudo actualizar el edificio.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/buildings')
    }

    if (!isLoading && error) {
        return (
            <EmptyState
                title="No fue posible cargar el edificio"
                description={getApiErrorMessage(error, 'Revisa la conexión e intenta nuevamente.')}
                actionLabel="Volver a edificios"
                onAction={() => navigate('/buildings')}
            />
        )
    }

    return (
        <LocationsForm
            key={formKey}
            mode="edit"
            submitLabel="Guardar cambios"
            submitting={isSubmitting}
            defaultValues={defaultValues}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default LocationsEdit
