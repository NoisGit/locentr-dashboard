import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import ProfileSection from './ProfileSection'
import BillingSection from './BillingSection'
import ActivitySection from './ActivitySection'
import { apiGetCondo } from '@/services/CondosService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import type { Condos } from '../CondosList/types'

const { TabNav, TabList, TabContent } = Tabs

const CondosDetails = () => {
    const { id } = useParams()

    const { data, isLoading } = useSWR(
        id ? `/api/condos/${id}` : null,
        () => apiGetCondo<Condos>(id as string),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        },
    )

    const isDataReady = data && !isEmpty(data)

    return (
        <Loading loading={isLoading}>
            {isDataReady ? (
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
                                        condosName={data?.name ?? 'N/A'}
                                        id={id as string}
                                    />
                                </TabContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            ) : (
                <div className="text-center text-gray-500 p-4">
                    No se pudo cargar la información del condominio.
                </div>
            )}
        </Loading>
    )
}

export default CondosDetails
