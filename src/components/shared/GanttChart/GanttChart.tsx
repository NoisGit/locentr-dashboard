import { ViewMode, Gantt } from 'gantt-task-react'
import TaskListTable from './TaskListTable'
import TaskListHeader from './TaskListHeader'
import TooltipContent from './TooltipContent'
import tasksPreProcess from './tasksPreProcess'
import { PatternLines } from '@visx/pattern'
import type { ExtraCell } from './TaskListTable'
import type { ExtraHeader } from './TaskListHeader'
import type { Task, GanttProps } from 'gantt-task-react'

export type ExtendedTask<T extends Record<string, unknown> = Record<string, never>> =
    Task & {
        barVariant?: string
    } & T

type GanttChartProps<T extends Record<string, unknown>> = GanttProps & {
    extraColumns?: Array<{
        header: ExtraHeader
        cell: ExtraCell
    }>
    tasks?: ExtendedTask<T>[] | null
    colorsMap?: Record<string, string>
    showArrow?: boolean
}

function toValidDate(v: unknown): Date | null {
    if (v instanceof Date) {
        return isNaN(v.getTime()) ? null : v
    }
    if (typeof v === 'string' || typeof v === 'number') {
        const d = new Date(v)
        return isNaN(d.getTime()) ? null : d
    }
    return null
}

function sanitizeTasks<T extends Record<string, unknown>>(
    raw: Array<ExtendedTask<T>> | null | undefined,
): Array<ExtendedTask<T>> {
    if (!Array.isArray(raw)) return []
    const out: Array<ExtendedTask<T>> = []
    for (let i = 0; i < raw.length; i++) {
        const t = raw[i]
        if (!t) continue

        const start = toValidDate(t.start)
        const end = toValidDate(t.end)
        if (!start || !end) continue

        const s = start.getTime() <= end.getTime() ? start : end
        const e = start.getTime() <= end.getTime() ? end : start

        out.push({
            ...t,
            start: s,
            end: e,
            type: (t.type as Task['type']) ?? 'task',
            progress: typeof t.progress === 'number' ? t.progress : 0,
        })
    }
    return out
}

const GanttChart = <T extends Record<string, unknown>>(props: GanttChartProps<T>) => {
    const {
        tasks = [],
        viewMode = ViewMode.Day,
        extraColumns,
        colorsMap = {},
        showArrow,
        ...rest
    } = props

    const safeTasks = sanitizeTasks(tasks)

    if (safeTasks.length === 0) {
        return (
            <>
                <div className="p-6 text-center">
                    <div className="font-semibold">Sin datos del cronograma</div>
                    <div className="text-sm opacity-70">
                        Proporcione tareas con <code>start</code> y <code>end</code> válidos.
                    </div>
                </div>
                <svg className="h-0 w-0">
                    <PatternLines
                        id="horzLines"
                        height={10}
                        width={10}
                        className="stroke-gray-200 dark:stroke-gray-700"
                        strokeWidth={1.5}
                        background="transparent"
                        orientation={['diagonal']}
                    />
                </svg>
            </>
        )
    }

    return (
        <>
            <Gantt
                tasks={tasksPreProcess(safeTasks, colorsMap)}
                viewMode={viewMode}
                listCellWidth={'200px'}
                columnWidth={65}
                barProgressColor={'#3380fa'}
                barProgressSelectedColor={'#3380fa'}
                barBackgroundColor={'#e2e8f0'}
                barBackgroundSelectedColor={'#e2e8f0'}
                projectProgressColor={'#6299f1'}
                projectProgressSelectedColor={'#6299f1'}
                projectBackgroundColor="#3380fa"
                projectBackgroundSelectedColor="#3380fa"
                milestoneBackgroundColor="#3380fa"
                milestoneBackgroundSelectedColor="#3380fa"
                todayColor="url(#horzLines)"
                rowHeight={50}
                TaskListHeader={(p) => (
                    <TaskListHeader
                        {...p}
                        extraHeaders={extraColumns?.map((col) => col.header)}
                    />
                )}
                TaskListTable={(p) => (
                    <TaskListTable
                        {...p}
                        extraCells={extraColumns?.map((col) => col.cell)}
                    />
                )}
                TooltipContent={TooltipContent}
                barCornerRadius={6}
                {...(!showArrow ? { arrowColor: 'transparent' } : {})}
                {...rest}
            />
            <svg className="h-0 w-0">
                <PatternLines
                    id="horzLines"
                    height={10}
                    width={10}
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth={1.5}
                    background="transparent"
                    orientation={['diagonal']}
                />
            </svg>
        </>
    )
}

export type { Task }
export default GanttChart
