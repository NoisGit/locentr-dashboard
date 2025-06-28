/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '../MockAdapter'
import { accessLogData } from '../data/accessLogData'

mock.onGet('/api/access/logs').reply((config) => {
    const { filter, activityIndex } = config.params as {
        filter?: string[]
        activityIndex: number
    }

    const maxGetItem = 3
    const count = (activityIndex - 1) * maxGetItem

    let logs = [...accessLogData]
    let loadable = true

    if (count >= logs.length) {
        loadable = false
    }

    logs = logs.slice(count, activityIndex * maxGetItem)

    if (filter && Array.isArray(filter)) {
        logs = logs.map((log) => {
            const filteredEvents = log.events.filter((event: any) =>
                filter.includes(event.type)
            )
            return {
                ...log,
                events: filteredEvents
            }
        })
    }

    const response = {
        data: logs,
        loadable
    }

    return [200, response]
})
