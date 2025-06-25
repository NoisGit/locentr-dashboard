/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { logbookData } from '../data/logbookData' // <-- usa tu mock de logbook

// === GET /api/logbook (Paginated & filtered logbook list) ===
mock.onGet('/api/logbook').reply((config) => {
    const { pageIndex, pageSize, sort, query } = config.params
    const { order, key } = sort

    const items = logbookData as any[]

    // Ensure no item is a function (safety)
    const sanitized = items.filter((elm) => typeof elm !== 'function')
    let data = sanitized
    let total = data.length

    // Sort if needed
    if (key && order) {
        if (key === 'date' || key === 'title' || key === 'responsible') {
            data.sort(sortBy(key, order === 'desc', (a) => (a as string).toUpperCase()))
        } else {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        }
    }

    // Quick search filter (by title)
    if (query) {
        data = wildCardSearch(data, query, 'title')
        total = data.length
    }

    // Pagination
    data = paginate(data, pageSize, pageIndex)

    const responseData = {
        list: data,
        total: total,
    }

    // Simulate delay (like real API)
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, responseData])
        }, 500)
    })
})

// === GET /api/logbook/:id (Get single logbook item by ID) ===
mock.onGet(/\/api\/logbook\/\w+/).reply(function (config) {
    const match = config.url?.match(/\/api\/logbook\/(.+)/)
    const id = match ? match[1] : undefined
    const item = logbookData.find((item) => item.id === id)

    if (!item) {
        return [404, {}]
    }

    return [200, item]
})
