import { apiGetAccessList } from '@/services/AccessService'
import useSWR from 'swr'
import { useAccessListStore } from '../store/AccessListStore' // ✅ Ruta corregida
import type { GetAccessListResponse } from '../types'
import type { TableQueries } from '@/@types/common'

export default function useAccessList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedAccess,
        setSelectedAccess,
        setSelectAllAccess,
        setFilterData,
    } = useAccessListStore((state) => state)

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/accesses', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetAccessList<GetAccessListResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
    )

    const accessList = data?.list || []

    const accessListTotal = data?.total || 0

    return {
        accessList,
        accessListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        selectedAccess,
        setSelectedAccess,
        setSelectAllAccess,
        setFilterData,
    }
}

