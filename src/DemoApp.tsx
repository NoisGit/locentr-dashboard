import { useEffect, useMemo, useState } from 'react'
import {
    PiChartLineUpDuotone,
    PiFolderOpenDuotone,
    PiGearSixDuotone,
    PiHeadsetDuotone,
    PiShieldCheckDuotone,
    PiUsersDuotone,
} from 'react-icons/pi'

type DemoSection =
    | 'Overview'
    | 'Users'
    | 'Projects'
    | 'Support Tickets'
    | 'Reports'
    | 'Settings'

type Metric = {
    label: string
    value: string
    change: string
    icon: typeof PiUsersDuotone
}

type ProgressItem = {
    label: string
    value: string
    progress: number
    status: string
}

const navigationItems: DemoSection[] = [
    'Overview',
    'Users',
    'Projects',
    'Support Tickets',
    'Reports',
    'Settings',
]

const metrics: Metric[] = [
    { label: 'Active users', value: '12,480', change: '+18.2%', icon: PiUsersDuotone },
    { label: 'Open projects', value: '86', change: '+7.4%', icon: PiFolderOpenDuotone },
    { label: 'Support tickets', value: '214', change: '-4.1%', icon: PiHeadsetDuotone },
    { label: 'Security score', value: '98%', change: '+2.5%', icon: PiShieldCheckDuotone },
]

const users = [
    ['Ava Johnson', 'Product Manager', 'Active'],
    ['Lucas Silva', 'Frontend Engineer', 'Active'],
    ['Mia Chen', 'Support Lead', 'Invited'],
    ['Noah Smith', 'Security Analyst', 'Active'],
    ['Emma Brown', 'QA Engineer', 'Active'],
    ['Liam Garcia', 'Backend Engineer', 'Invited'],
]

const projects: ProgressItem[] = [
    { label: 'Dashboard redesign', value: 'UX polish and mock data', progress: 72, status: 'In progress' },
    { label: 'API integration', value: 'Connect dashboard-base-api', progress: 28, status: 'Planning' },
    { label: 'Security review', value: 'Auth, token and route strategy', progress: 84, status: 'Active' },
    { label: 'Reporting module', value: 'Charts and export-ready layouts', progress: 12, status: 'Backlog' },
]

const tickets = [
    ['NX-TK-221', 'Session handling review', 'High'],
    ['NX-TK-220', 'Export report request', 'Medium'],
    ['NX-TK-219', 'Add user role visibility', 'Low'],
    ['NX-TK-218', 'Improve mobile sidebar', 'Medium'],
    ['NX-TK-217', 'Add Portuguese translations', 'Low'],
]

const activities = [
    ['#NX-2048', 'Workspace audit completed', 'Completed', 'Nexa Admin'],
    ['#NX-2047', 'New project created', 'In progress', 'Product Team'],
    ['#NX-2046', 'Support ticket triaged', 'Completed', 'Support Team'],
    ['#NX-2045', 'Role permissions reviewed', 'Blocked', 'Security Team'],
]

const reportCards = [
    ['Monthly growth', '+24%', 'Demo growth across workspace usage and feature adoption.', '8.4k events tracked'],
    ['Operational health', '98%', 'Mock reliability indicator for uptime and queue health.', '12 incidents prevented'],
    ['Customer success', '4.8', 'Portfolio-grade scorecard for satisfaction and feedback.', '184 responses analyzed'],
]

const settingsCards = [
    ['Security', 'Role-based access, secure sessions and protected routes are planned.', 'Ready'],
    ['Localization', 'Spanish, English and Portuguese support is on the roadmap.', 'Planned'],
    ['Theme', 'Light and dark mode are available for portfolio review.', 'Ready'],
    ['API', 'The future backend will live in dashboard-base-api.', 'Planned'],
]

const statusClass: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    Ready: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    'In progress': 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    Planning: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
    Planned: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
    Backlog: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600',
    Invited: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
    Blocked: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
    High: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
}

function ThemeButton({ isDark, onClick }: { isDark: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
            {isDark ? 'Light mode' : 'Dark mode'}
        </button>
    )
}

function StatusBadge({ value }: { value: string }) {
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass[value] ?? statusClass.Backlog}`}>
            {value}
        </span>
    )
}

function MetricGrid({ items }: { items: Metric[] }) {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {items.map((metric) => {
                const Icon = metric.icon
                return (
                    <article key={metric.label} className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl shrink-0 dark:bg-indigo-500/15 dark:text-indigo-300">
                                <Icon />
                            </div>
                            <span className="rounded-full bg-emerald-50 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-emerald-700 whitespace-nowrap dark:bg-emerald-500/15 dark:text-emerald-300">
                                {metric.change}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{metric.label}</div>
                        <div className="text-2xl sm:text-3xl font-bold mt-1 text-slate-950 dark:text-white">{metric.value}</div>
                    </article>
                )
            })}
        </section>
    )
}

function DemoTable({
    title,
    description,
    headers,
    rows,
}: {
    title: string
    description: string
    headers: string[]
    rows: string[][]
}) {
    return (
        <section className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
                <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{description}</p>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[640px]">
                    <thead className="text-slate-500 dark:text-slate-400">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} className="py-3 pr-4">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.join('-')} className="border-t border-slate-100 dark:border-slate-800">
                                {row.map((cell, index) => (
                                    <td key={`${cell}-${index}`} className="py-4 pr-4">
                                        {index === row.length - 1 ? (
                                            <StatusBadge value={cell} />
                                        ) : index === 0 ? (
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-300">{cell}</span>
                                        ) : (
                                            <span className="text-slate-700 dark:text-slate-300">{cell}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {rows.map((row) => (
                    <article key={row.join('-')} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{headers[0]}</div>
                                <div className="font-semibold text-indigo-600 break-words dark:text-indigo-300">{row[0]}</div>
                            </div>
                            <StatusBadge value={row[row.length - 1]} />
                        </div>
                        <div className="grid gap-2 text-sm">
                            {row.slice(1, -1).map((cell, index) => (
                                <div key={`${cell}-${index}`} className="flex flex-col gap-1">
                                    <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{headers[index + 1]}</span>
                                    <span className="text-slate-700 break-words dark:text-slate-300">{cell}</span>
                                </div>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

function ProgressList({ items }: { items: ProgressItem[] }) {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => (
                <article key={item.label} className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">{item.label}</h2>
                            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{item.value}</p>
                        </div>
                        <StatusBadge value={item.status} />
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.progress}% complete</div>
                </article>
            ))}
        </section>
    )
}

function OverviewContent({ chartBars }: { chartBars: number[] }) {
    return (
        <>
            <MetricGrid items={metrics} />
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <article className="xl:col-span-2 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">Workspace activity</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Mock activity trend for the current month.</p>
                        </div>
                        <PiChartLineUpDuotone className="text-2xl sm:text-3xl text-indigo-500 shrink-0 dark:text-indigo-300" />
                    </div>
                    <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-64 lg:h-72">
                        {chartBars.map((height, index) => (
                            <div key={index} className="flex-1 rounded-t-xl sm:rounded-t-2xl bg-indigo-100 relative overflow-hidden min-w-0 dark:bg-indigo-500/10">
                                <div className="absolute bottom-0 left-0 right-0 rounded-t-xl sm:rounded-t-2xl bg-indigo-500" style={{ height: `${height}%` }} />
                            </div>
                        ))}
                    </div>
                </article>
                <article className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-950 dark:text-white">Goal progress</h2>
                    <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">Operational completion rate.</p>
                    <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-full border-[14px] sm:border-[18px] border-indigo-500 border-r-indigo-100 mx-auto flex items-center justify-center dark:border-indigo-400 dark:border-r-slate-800">
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white">76%</div>
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Completed</div>
                        </div>
                    </div>
                </article>
            </section>
            <div className="mt-4 sm:mt-6">
                <DemoTable title="Recent activity" description="Latest platform updates and operational events." headers={['ID', 'Activity', 'Status', 'Owner']} rows={activities} />
            </div>
        </>
    )
}

function ReportsContent({ chartBars }: { chartBars: number[] }) {
    return (
        <section className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {reportCards.map(([title, value, description, trend]) => (
                    <article key={title} className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl mb-5 dark:bg-indigo-500/15 dark:text-indigo-300">
                            <PiChartLineUpDuotone />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
                        <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">{description}</p>
                        <div className="text-3xl sm:text-4xl font-bold text-slate-950 mt-6 dark:text-white">{value}</div>
                        <p className="text-sm text-indigo-600 font-semibold mt-2 dark:text-indigo-300">{trend}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}

function SettingsContent() {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {settingsCards.map(([title, description, status]) => (
                <article key={title} className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl shrink-0 dark:bg-indigo-500/15 dark:text-indigo-300">
                            <PiGearSixDuotone />
                        </div>
                        <StatusBadge value={status} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-950 mt-5 dark:text-white">{title}</h2>
                    <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">{description}</p>
                </article>
            ))}
        </section>
    )
}

function SectionContent({ section, chartBars }: { section: DemoSection; chartBars: number[] }) {
    if (section === 'Overview') return <OverviewContent chartBars={chartBars} />
    if (section === 'Users') {
        return (
            <section className="space-y-4 sm:space-y-6">
                <MetricGrid items={[
                    { label: 'Total users', value: '1,284', change: '+12%', icon: PiUsersDuotone },
                    { label: 'Active roles', value: '8', change: '+2', icon: PiShieldCheckDuotone },
                    { label: 'Invitations', value: '24', change: '+6', icon: PiHeadsetDuotone },
                    { label: 'Teams', value: '16', change: '+4', icon: PiFolderOpenDuotone },
                ]} />
                <DemoTable title="User management" description="Mock user directory prepared for future API integration." headers={['Name', 'Role', 'Status']} rows={users} />
            </section>
        )
    }
    if (section === 'Projects') return <ProgressList items={projects} />
    if (section === 'Support Tickets') {
        return (
            <section className="space-y-4 sm:space-y-6">
                <MetricGrid items={[
                    { label: 'Open tickets', value: '214', change: '-4.1%', icon: PiHeadsetDuotone },
                    { label: 'High priority', value: '18', change: '+3', icon: PiShieldCheckDuotone },
                    { label: 'Avg response', value: '2.4h', change: '-18%', icon: PiChartLineUpDuotone },
                    { label: 'Resolved today', value: '42', change: '+9', icon: PiUsersDuotone },
                ]} />
                <DemoTable title="Support tickets" description="Prioritized support queue for the demo workspace." headers={['Ticket', 'Subject', 'Priority']} rows={tickets} />
            </section>
        )
    }
    if (section === 'Reports') return <ReportsContent chartBars={chartBars} />
    return <SettingsContent />
}

function DemoApp() {
    const [signedIn, setSignedIn] = useState(false)
    const [activeSection, setActiveSection] = useState<DemoSection>('Overview')
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return true
        return window.localStorage.getItem('nexa-demo-theme') !== 'light'
    })
    const chartBars = useMemo(() => [46, 62, 51, 78, 69, 88, 74, 92], [])

    useEffect(() => {
        window.localStorage.setItem('nexa-demo-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    if (!signedIn) {
        return (
            <main className={`${isDark ? 'dark bg-[radial-gradient(circle_at_top_left,_#312e81,_#020617_50%,_#020617)]' : 'bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_#f8fafc_48%,_#eef2ff)]'} min-h-screen text-slate-950 dark:text-white flex items-center justify-center px-4 py-8 sm:px-6`}>
                <section className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/95 p-5 sm:p-8 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:text-white">
                    <div className="flex items-center justify-between gap-3 mb-8">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-lg shadow-indigo-950/30 shrink-0">N</div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">Nexa Admin</h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-200">Portfolio demo dashboard</p>
                            </div>
                        </div>
                        <ThemeButton isDark={isDark} onClick={() => setIsDark((value) => !value)} />
                    </div>
                    <div className="space-y-2 mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">Welcome back</h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed dark:text-slate-200">This public version runs in demo mode while the real API repository is being prepared.</p>
                    </div>
                    <button className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-indigo-400" onClick={() => setSignedIn(true)}>Open dashboard demo</button>
                </section>
            </main>
        )
    }

    return (
        <main className={`${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} min-h-screen`}>
            <div className="flex min-h-screen">
                <aside className="hidden lg:flex w-72 flex-col bg-slate-950 text-white p-6 shrink-0 dark:border-r dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-11 w-11 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-lg text-white">N</div>
                        <div>
                            <div className="font-bold text-lg text-white">Nexa Admin</div>
                            <div className="text-xs text-slate-300">Demo workspace</div>
                        </div>
                    </div>
                    <nav className="space-y-2 text-sm">
                        {navigationItems.map((item) => (
                            <button key={item} type="button" onClick={() => setActiveSection(item)} className={`w-full text-left rounded-xl px-4 py-3 transition ${activeSection === item ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}>{item}</button>
                        ))}
                    </nav>
                </aside>
                <section className="flex-1 min-w-0 p-4 sm:p-5 md:p-8">
                    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-300">Portfolio dashboard</p>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-950 break-words dark:text-white">{activeSection === 'Overview' ? 'Nexa Admin Overview' : activeSection}</h1>
                            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl dark:text-slate-400">A responsive SaaS-style admin dashboard mockup ready for API integration.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <ThemeButton isDark={isDark} onClick={() => setIsDark((value) => !value)} />
                            <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white w-full sm:w-auto dark:bg-white dark:text-slate-950" onClick={() => setSignedIn(false)}>Sign out</button>
                        </div>
                    </header>
                    <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
                        <div className="flex gap-2 min-w-max pb-1">
                            {navigationItems.map((item) => (
                                <button key={item} type="button" onClick={() => setActiveSection(item)} className={`rounded-xl px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${activeSection === item ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300'}`}>{item}</button>
                            ))}
                        </div>
                    </div>
                    <SectionContent section={activeSection} chartBars={chartBars} />
                </section>
            </div>
        </main>
    )
}

export default DemoApp
