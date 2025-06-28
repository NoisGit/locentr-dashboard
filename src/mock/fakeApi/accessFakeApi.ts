/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { accessDetailData } from '../data/accessData'
import { accessActivityLog } from '../data/accessLogData'

// Lista paginada de accesos
mock.onGet(`/api/access`).reply((config) => {
    const { pageIndex, pageSize, sort, query } = config.params

    const { order, key } = sort

    const accesses = accessDetailData as any[]

    const sanitizeAccesses = accesses.filter((elm) => typeof elm !== 'function')
    let data = sanitizeAccesses
    let total = accesses.length

    if (key && order) {
        if (key !== 'totalSpending') {
            data.sort(
                sortBy(key, order === 'desc', (a) =>
                    (a as string).toUpperCase(),
                ),
            )
        } else {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        }
    }

    if (query) {
        data = wildCardSearch(data, query)
        total = data.length
    }

    data = paginate(data, pageSize, pageIndex)

    const responseData = {
        list: data,
        total: total,
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, responseData])
        }, 500)
    })
})

// Detalle de acceso por id
mock.onGet(new RegExp(`/api/access/[^/]+$`)).reply(function (config) {
    const id = config.url?.split('/')[3]

    const access = accessDetailData.find((item) => item.id === id)

    if (!access) {
        return [404, {}]
    }

    return [200, access]
})

// Log/actividad de acceso
mock.onGet(new RegExp(`/api/access/log`)).reply(() => {
    return [200, accessActivityLog]
})

