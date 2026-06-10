import useSWR from 'swr'
import {
    apiCreateLocationLogbookEntry,
    apiListLocationLogbookEntries,
} from '@/services/LocationLogbookService'
import { normalizeUserInput } from '@/utils/security/input'

type UseLogbookParams = {
    locationId: string
    pageIndex: number
    pageSize: number
}

export default function useLogbook({
    locationId,
    pageIndex,
    pageSize,
}: UseLogbookParams) {
    const swr = useSWR(
        locationId
            ? ['location-logbook:list', locationId, pageIndex, pageSize]
            : null,
        ([, currentLocationId]) =>
            apiListLocationLogbookEntries(currentLocationId, {
                page: pageIndex,
                size: pageSize,
            }),
        { revalidateOnFocus: false },
    )

    const createEntry = async (description: string) => {
        const safeDescription = normalizeUserInput(description, 1000)
        if (!safeDescription || !locationId) return

        await apiCreateLocationLogbookEntry({
            location_id: Number(locationId),
            description: safeDescription,
        })
        await swr.mutate()
    }

    return {
        ...swr,
        createEntry,
    }
}
