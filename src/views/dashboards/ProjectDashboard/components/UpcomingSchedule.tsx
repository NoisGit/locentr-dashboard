import { useState, useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Calendar from '@/components/ui/Calendar'
import ScrollBar from '@/components/ui/ScrollBar'
import CreateEventDialog, { eventTypes } from './CreateEventDialog'
import { eventGenerator, isToday } from '../utils'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import type { FormSchema as CreateEventPayload } from './CreateEventDialog'
import type { Event } from '../types'

type ScheduledEvent = {
    id: string
    type: Event
    label: string
    time?: Date
}

type ScheduledEventProps = ScheduledEvent

const ScheduledEvent = (props: ScheduledEventProps) => {
    const { type, label, time } = props
    const event = eventTypes[type]

    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3">
                <Avatar
                    className={classNames('text-gray-900', event?.color)}
                    icon={event?.icon}
                    shape="round"
                />
                <div>
                    <div className="font-bold heading-text">{label}</div>
                    <div className="font-normal">{event?.label}</div>
                </div>
            </div>
            <div>
                <span className="font-semibold heading-text">
                    {time && dayjs(time).format('hh:mm')}{' '}
                </span>
                <small>{time && dayjs(time).format('A')}</small>
            </div>
        </div>
    )
}

const UpcomingSchedule = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        dayjs().toDate(),
    )
    const [createdEventCache, setCreatedEventCache] = useState<
        Record<string, ScheduledEvent[]>
    >({})

    const eventList = useMemo(() => {
        const date = selectedDate
        const previousCreatedEvent =
            createdEventCache[dayjs(date).toISOString()] || []
        const eventList = [
            ...eventGenerator(date as Date),
            ...previousCreatedEvent,
        ]

        return eventList.sort((a, b) => {
            if (!a.time && !b.time) return 0
            if (!a.time) return 1
            if (!b.time) return -1
            return a.time.getTime() - b.time.getTime()
        })
    }, [selectedDate, createdEventCache])

    const handleCreateEvent = (value: CreateEventPayload & { id: string }) => {
        const payload = {
            id: value.id,
            label: value.label,
            type: value.type,
            time: dayjs(selectedDate)
                .set('hour', value.time)
                .set('minute', 0)
                .toDate(),
        }
        setCreatedEventCache((prev) => {
            const key = dayjs(selectedDate).toISOString()
            const updated = { ...prev }
            updated[key] = [...(prev[key] || []), payload]
            return updated
        })
    }

    return (
        <Card className="h-full flex flex-col">
            <div className="flex flex-col h-full">
                <div className="flex justify-center">
                    <Calendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                    />
                </div>
                <div className="flex-1 mt-4 flex flex-col">
                    <h5 className="mb-4">
                        Schedule{' '}
                        {isToday(selectedDate as Date)
                            ? 'today'
                            : dayjs(selectedDate).format('DD MMM')}
                    </h5>
                    <ScrollBar className="overflow-y-auto h-full">
                        <div className="flex flex-col gap-4">
                            {eventList.map((event) => (
                                <ScheduledEvent key={event.id} {...event} />
                            ))}
                        </div>
                    </ScrollBar>
                </div>
                <div className="mt-4">
                    <CreateEventDialog onCreateEvent={handleCreateEvent} />
                </div>
            </div>
        </Card>
    )
}

export default UpcomingSchedule
