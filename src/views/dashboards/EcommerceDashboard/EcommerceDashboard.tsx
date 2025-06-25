import Loading from '@/components/shared/Loading'
import Overview from './components/Overview'
import RecentOrder from './components/RecentOrder'
import SalesTarget from './components/SalesTarget'
import TopProduct from './components/TopProduct'
import { apiGetEcommerceDashboard, apiGetProjectDashboard } from '@/services/DashboardService'
import useSWR from 'swr'
import ProjectOverview from '../ProjectDashboard/components/ProjectOverview'
import Schedule from '../ProjectDashboard/components/Schedule'
import UpcomingSchedule from '../ProjectDashboard/components/UpcomingSchedule'
import CurrentTasks from '../ProjectDashboard/components/CurrentTasks'
import RecentActivity from '../ProjectDashboard/components/RecentActivity'
import TaskOverview from '../ProjectDashboard/components/TaskOverview'
import type { GetEcommerceDashboardResponse } from './types'
import type { GetProjectDashboardResponse } from '../ProjectDashboard/types'

const EcommerceDashboard = () => {
    const { data: dataEcommerce, isLoading: isLoadingEcommerce } = useSWR(
        ['/api/dashboard/ecommerce'],
        () => apiGetEcommerceDashboard<GetEcommerceDashboardResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        }
    )

    const { data: dataProject, isLoading: isLoadingProject } = useSWR(
        ['/api/dashboard/project'],
        () => apiGetProjectDashboard<GetProjectDashboardResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        }
    )

    return (
        <Loading loading={isLoadingEcommerce || isLoadingProject}>
            {dataEcommerce && (
                <div>
                    {/* Sección Panel/Ecommerce */}
                    <div className="flex flex-col gap-4 max-w-full overflow-x-hidden">
                        <div className="flex flex-col xl:flex-row gap-4">
                            <div className="flex flex-col gap-4 flex-1 xl:col-span-3">
                                <Overview data={dataEcommerce.statisticData} />
                            </div>
                            <div className="flex flex-col gap-4 2xl:min-w-[360px]">
                                <SalesTarget data={dataEcommerce.salesTarget} />
                                <TopProduct data={dataEcommerce.topProduct} />
                            </div>
                        </div>
                        <RecentOrder data={dataEcommerce.recentOrders} />
                    </div>

                    {/* Sección Proyecto */}
                    {dataProject && (
                        <div className="mt-10 flex flex-col gap-4">
                            <h2 className="text-2xl font-bold mb-2">Proyecto</h2>
                            <div className="flex flex-col xl:flex-row gap-4">
                                <div className="flex flex-col gap-4 flex-1 xl:max-w-[calc(100%-350px)]">
                                    <ProjectOverview data={dataProject.projectOverview} />
                                    <Schedule data={dataProject.schedule} />
                                </div>
                                <div>
                                    <UpcomingSchedule />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                <div className="md:col-span-1 xl:col-span-1 order-1">
                                    <CurrentTasks data={dataProject.currentTasks} />
                                </div>
                                <div className="md:col-span-1 xl:col-span-1 order-2 xl:order-3">
                                    <RecentActivity data={dataProject.recentActivity} />
                                </div>
                                <div className="md:col-span-2 xl:col-span-1 order-3 xl:order-2">
                                    <TaskOverview data={dataProject.taskOverview} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Loading>
    )
}

export default EcommerceDashboard
