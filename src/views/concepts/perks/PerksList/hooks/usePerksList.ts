import { apiGetPerksList } from '@/services/PerksService'
import useSWR from 'swr'
import { usePerksListStore } from '../store/PerksListStore'
import type { GetPerksListResponse } from '../types'
import type { TableQueries } from '@/@types/common'

export default function usePerksList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedPerks,
        setSelectedPerks,
        setSelectAllPerks,
        setFilterData,
    } = usePerksListStore((state) => state)

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/perks', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetPerksList<GetPerksListResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
    )

    const perksList = data?.list || []
    const perksListTotal = data?.total || 0

    return {
        perksList,
        perksListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        selectedPerks,
        setSelectedPerks,
        setSelectAllPerks,
        setFilterData,
    }
}

