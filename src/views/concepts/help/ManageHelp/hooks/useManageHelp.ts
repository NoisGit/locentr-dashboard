import { useManageHelpStore } from '../store/manageHelpStore'
import { apiGetHelpManageList } from '@/services/HelpService'
import useSWR from 'swr'
import type { TableQueries } from '@/@types/common'
import type { GetHelpListResponse, HelpFilter } from '../types'

// --- Util para serializar query params ---
const serializeParams = (params: TableQueries & HelpFilter) => {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => query.append(key, v))
        } else {
            query.append(key, String(value))
        }
    })

    return query.toString()
}

const useManageHelp = () => {
    const tableData = useManageHelpStore((state) => state.tableData)
    const filterData = useManageHelpStore((state) => state.filterData)

    const params: TableQueries & HelpFilter = { ...tableData, ...filterData }
    const queryString = serializeParams(params)

    const { data, isLoading, mutate } = useSWR(
        `/helps/manage/list?${queryString}`,
        () => apiGetHelpManageList<GetHelpListResponse, typeof params>(params),
        {
            revalidateOnFocus: false,
        }
    )

    return {
        helpList: data?.list || [],
        helpTotal: data?.total || 0,
        isLoading,
        mutate,
    }
}

export default useManageHelp
