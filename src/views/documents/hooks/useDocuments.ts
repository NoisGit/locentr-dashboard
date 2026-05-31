import useSWR from 'swr'
import {
    apiListAllDocuments,
    apiListMyCompanyDocuments,
} from '@/services/DocumentsService'

type UseDocumentsParams = {
    isSuperAdmin: boolean
    search: string
}

export function useDocuments({ isSuperAdmin, search }: UseDocumentsParams) {
    return useSWR(
        ['documents:list', isSuperAdmin, search],
        () =>
            isSuperAdmin
                ? apiListAllDocuments({ page: 1, search, size: 10 })
                : apiListMyCompanyDocuments({ page: 1, search, size: 10 }),
        { revalidateOnFocus: false },
    )
}
