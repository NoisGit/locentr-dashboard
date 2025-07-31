/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '../MockAdapter'
import { helpListData } from '../data/helpData'
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy from '@/utils/sortBy'
import paginate from '@/utils/paginate'

const normalizeData = (list: any[]) => {
    return list.map((item) => ({
        ...item,
        // Asegura consistencia de campos
        title: item.title ?? item.subject ?? 'No Subject',
        content: item.content ?? '',
        subject: item.subject ?? item.title ?? 'No Subject',
        email: item.email ??
            (item.createdBy
                ? item.createdBy.toLowerCase().replace(/\s/g, '.') + '@mail.com'
                : 'user@mail.com'),
        status: item.status ?? 'pending',
        updateTime: item.updateTime ?? '1 hour ago',
        updateTimeStamp: item.updateTimeStamp ?? Date.now(),
        id: item.id ?? crypto.randomUUID(),
        replies: item.replies ?? [],
    }))
}

// Vista pública
mock.onGet(`/api/helps/list`).reply((config) => {
    const { topic, query } = config.params || {}

    const tickets = normalizeData(helpListData)

    if (query) {
        return [200, wildCardSearch(tickets, query)]
    }

    if (topic) {
        return [200, tickets.filter((ticket) => ticket.topic === topic)]
    }

    return [200, tickets]
})

// Vista detalle por ID
mock.onGet(new RegExp(`/api/helps/ticket/\\w+`)).reply((config) => {
    const id = config.url?.split('/')[4]

    const rawTicket = helpListData.find((t) => t.id === id)
    if (!rawTicket) {
        return [404, { message: 'Ticket not found' }]
    }

    const ticket = normalizeData([rawTicket])[0]
    return [200, ticket]
})

// Vista admin con paginación y filtros
mock.onGet(`/api/helps/manage/list`).reply((config) => {
    const { pageIndex, pageSize, sort, query, status } = config.params || {}
    const { order, key } = sort || {}

    let data = normalizeData(helpListData)
    let total = data.length

    if (key && order) {
        data.sort(
            sortBy(
                key,
                order === 'desc',
                key === 'updateTimeStamp' ? Number : String
            )
        )
    }

    if (query) {
        data = wildCardSearch(data, query)
        total = data.length
    }

    if (status) {
        data = data.filter((ticket) => status.includes(ticket.status))
    }

    data = paginate(data, pageSize, pageIndex)

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                200,
                {
                    list: data,
                    total,
                },
            ])
        }, 500)
    })
})
