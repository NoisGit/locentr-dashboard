import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import ProfileSection from './ProfileSection'
import BillingSection from './BillingSection'
import ActivitySection from './ActivitySection'
import { apiGetCondos } from '@/services/CondosService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import type { Condos } from '../CondosList/types'

const { TabNav, TabList, TabContent } = Tabs

const CondosDetails = () => {
    const { id } = useParams()

    const { data, isLoading } = useSWR(
        ['/api/condos', { id: id as string }],
        ([_, params]) => apiGetCondos<Condos, { id: string }>(params),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        },
    )

    return (
        <Loading loading={isLoading}>
            {!isEmpty(data) && (
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="min-w-[330px] 2xl:min-w-[400px]">
                        <ProfileSection data={data} />
                    </div>
                    <Card className="w-full">
                        <Tabs defaultValue="billing">
                            <TabList>
                                <TabNav value="billing">Billing</TabNav>
                                <TabNav value="activity">Activity</TabNav>
                            </TabList>
                            <div className="p-4">
                                <TabContent value="billing">
                                    <BillingSection data={data} />
                                </TabContent>
                                <TabContent value="activity">
                                    <ActivitySection
                                        condosName={data.name}
                                        id={id as string}
                                    />
                                </TabContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            )}
        </Loading>
    )
}

export default CondosDetails
