/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { perksDetailData } from '../data/perksData' // 👈 Asegúrate de tener este archivo

// Lista paginada de perks
mock.onGet('/api/perks').reply((config) => {
    const { pageIndex = 1, pageSize = 10, sort = {}, query = '' } = config.params || {}

    const { order = '', key = '' } = sort

    let data = [...perksDetailData] as any[]
    data = data.filter((elm) => typeof elm !== 'function')

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

// Detalle de perk por id
mock.onGet(new RegExp('/api/perks/[^/]+$')).reply((config) => {
    const id = config.url?.split('/').pop()
    const perk = perksDetailData.find((item) => item.id === id)

    if (!perk) {
        return [404, { message: 'Perk not found' }]
    }

    return [200, perk]
})
