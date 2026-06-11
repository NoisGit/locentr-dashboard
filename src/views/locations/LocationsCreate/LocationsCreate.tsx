import { useState } from 'react'
import { useNavigate } from 'react-router'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import LocationsForm, { type LocationFormSchema } from '../LocationsForm/LocationsForm'
import { apiCreateLocation } from '@/services/LocationsService'
import { getApiErrorMessage } from '@/utils/apiError'

const LocationsCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFormSubmit = async (values: LocationFormSchema) => {
        try {
            setIsSubmitting(true)
            await apiCreateLocation({
                name: values.name.trim(),
                address: values.address.trim(),
                country: values.country?.trim() || null,
            })
            toast.push(<Notification type="success">Edificio creado correctamente.</Notification>, {
                placement: 'top-center',
            })
            navigate('/buildings')
        } catch (error: unknown) {
            toast.push(
                <Notification type="danger">
                    {getApiErrorMessage(error, 'No se pudo crear el edificio.')}
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

    return (
        <LocationsForm
            mode="create"
            submitting={isSubmitting}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default LocationsCreate
