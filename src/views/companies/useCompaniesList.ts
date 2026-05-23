import useSWR from 'swr'
import { apiListCompanies, type Company } from '@/services/CompaniesService'

export default function useCompaniesList() {
    const { data, error, isLoading, mutate } = useSWR(
        'companies:list',
        () => apiListCompanies<Company[]>({ pageIndex: 1, pageSize: 100 }),
        { revalidateOnFocus: false },
    )

    return {
        companies: data || [],
        error,
        isLoading,
        mutate,
    }
}
