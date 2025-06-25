/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { marketplaceData } from '../data/marketplaceData'

// === GET /api/marketplace (Listado paginado y filtrado) ===
mock.onGet('/api/marketplace').reply((config) => {
    const { pageIndex, pageSize, sort, query } = config.params
    const { order, key } = sort

    const items = marketplaceData as any[]

    // Asegúrate de que ningún elemento sea una función (protección por si acaso)
    const sanitized = items.filter((elm) => typeof elm !== 'function')
    let data = sanitized
    let total = data.length

    // Ordenar por campo si corresponde
    if (key && order) {
        if (key === 'category' || key === 'name') {
            data.sort(sortBy(key, order === 'desc', (a) => (a as string).toUpperCase()))
        } else {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        }
    }

    // Filtro de búsqueda rápido (por nombre)
    if (query) {
        data = wildCardSearch(data, query, 'name')
        total = data.length
    }

    // Paginación
    data = paginate(data, pageSize, pageIndex)

    const responseData = {
        list: data,
        total: total,
    }

    // Simulación de retardo (como si fuera una API real)
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, responseData])
        }, 500)
    })
})

// === GET /api/marketplace/:id (Obtener un solo item por ID) ===
mock.onGet(/\/api\/marketplace\/\w+/).reply(function (config) {
    const match = config.url?.match(/\/api\/marketplace\/(.+)/)
    const id = match ? match[1] : undefined
    const item = marketplaceData.find((item) => item.id === id)

    if (!item) {
        return [404, {}]
    }

    return [200, item]
})
