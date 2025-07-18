import { apiGetCondosList } from '@/services/CondosService'
import useSWR from 'swr'
import { useCondosListStore } from '../store/CondosListStore'
import type { GetCondosListResponse } from '../types'
import type { TableQueries } from '@/@types/common'

export default function useCondosList() {
    const {
        tableData,
        filterData,
        selectedCondo,
        selectedCondos,
        setTableData,
        setSelectedCondo,
        setSelectedCondos,
        setSelectAllCondos,
        setFilterData,
    } = useCondosListStore((state) => state)

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/condos', { ...tableData, ...filterData }],
        ([_, params]) =>
            apiGetCondosList<GetCondosListResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
    )

    const condosList = data?.list || []
    const condosListTotal = data?.total || 0

    return {
        condosList,
        condosListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        selectedCondo,
        selectedCondos,
        mutate,
        setTableData,
        setSelectedCondo,
        setSelectedCondos,
        setSelectAllCondos,
        setFilterData,
    }
}
