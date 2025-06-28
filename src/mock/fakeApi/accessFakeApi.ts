/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { accessDetailData } from '../data/accessData'
import { accessActivityLog } from '../data/accessLogData'

// Lista paginada de accesos
mock.onGet('/api/access').reply((config) => {
    const { pageIndex = 1, pageSize = 10, sort = {}, query = '' } = config.params || {}

    const { order = '', key = '' } = sort

    let data = [...accessDetailData] as any[]
    data = data.filter((elm) => typeof elm !== 'function') // Sanitiza si hay funciones

    if (key && order) {
        data.sort(
            sortBy(
                key,
                order === 'desc',
                key === 'totalSpending' ? (parseInt as Primer) : (a => (a as string).toUpperCase())
            )
        )
    }

    if (query) {
        data = wildCardSearch(data, query)
    }

    const total = data.length
    const paginatedData = paginate(data, pageSize, pageIndex)

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([200, { list: paginatedData, total }])
        }, 500)
    })
})

// Detalle de acceso por id
mock.onGet(new RegExp('/api/access/[^/]+$')).reply((config) => {
    const id = config.url?.split('/').pop()
    const access = accessDetailData.find((item) => item.id === id)

    if (!access) {
        return [404, { message: 'Access not found' }]
    }

    return [200, access]
})

// Log/actividad de acceso
mock.onGet('/api/access/log').reply(() => {
    return [200, accessActivityLog]
})
