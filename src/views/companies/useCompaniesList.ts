import useSWR from 'swr'
import {
    apiGetCompaniesPage,
    filterCompaniesForUser,
} from '@/services/CompaniesService'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'

type UseCompaniesListParams = {
    pageIndex?: number
    pageSize?: number
}

export default function useCompaniesList({
    pageIndex = 1,
    pageSize = 100,
}: UseCompaniesListParams = {}) {
    const role = useSessionUser((state) => state.user.role)
    const companyId = useSessionUser((state) => state.user.company_id)
    const isSuperAdmin = role === Role.SUPERADMIN
    const requestPageIndex = isSuperAdmin ? pageIndex : 1
    const requestPageSize = isSuperAdmin ? pageSize : 200

    const { data, error, isLoading, mutate } = useSWR(
        ['companies:list', requestPageIndex, requestPageSize, role, companyId],
        () =>
            apiGetCompaniesPage({
                pageIndex: requestPageIndex,
                pageSize: requestPageSize,
            }),
        { revalidateOnFocus: false },
    )
    const allVisibleCompanies = filterCompaniesForUser(
        data?.items ?? [],
        role,
        companyId,
    )
    const visibleCompanies = isSuperAdmin
        ? allVisibleCompanies
        : allVisibleCompanies.slice(
              (pageIndex - 1) * pageSize,
              pageIndex * pageSize,
          )

    return {
        companies: visibleCompanies,
        total: isSuperAdmin ? (data?.total ?? 0) : allVisibleCompanies.length,
        error,
        isLoading,
        mutate,
    }
}
