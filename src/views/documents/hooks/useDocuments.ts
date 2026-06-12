import useSWR from 'swr'
import {
    apiListAllDocuments,
    apiListMyCompanyDocuments,
} from '@/services/DocumentsService'

type UseDocumentsParams = {
    isSuperAdmin: boolean
    search: string
    pageIndex: number
    pageSize: number
}

export function useDocuments({
    isSuperAdmin,
    search,
    pageIndex,
    pageSize,
}: UseDocumentsParams) {
    return useSWR(
        ['documents:list', isSuperAdmin, search, pageIndex, pageSize],
        () =>
            isSuperAdmin
                ? apiListAllDocuments({ page: pageIndex, search, size: pageSize })
                : apiListMyCompanyDocuments({ page: pageIndex, search, size: pageSize }),
        { revalidateOnFocus: false },
    )
}
