import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import LocationsForm, { type LocationFormSchema } from '../LocationsForm/LocationsForm'
import { apiGetLocationById, apiUpdateLocation } from '@/services/LocationsService'

const LocationsEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const locationId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, isLoading, mutate } = useSWR(
        locationId ? ['locations:detail', locationId] : null,
        ([, currentId]) => apiGetLocationById(currentId as string),
        { revalidateOnFocus: false },
    )

    const defaultValues = useMemo((): Partial<LocationFormSchema> => ({
        name: data?.name || '',
        address: data?.address || '',
        country: data?.country || '',
    }), [data])

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
            toast.push(<Notification type="success">Edificio actualizado correctamente.</Notification>, {
                placement: 'top-center',
            })
            await mutate()
            navigate('/buildings')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; detail?: string } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'No se pudo actualizar el edificio.'

            toast.push(<Notification type="danger">{message}</Notification>, {
                placement: 'top-center',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/buildings')
    }

    if (!isLoading && !data) return null

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
