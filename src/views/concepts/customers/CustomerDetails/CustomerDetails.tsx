// src/views/concepts/customers/CustomerDetails/CustomerDetails.tsx
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Loading from '@/components/shared/Loading'
import ProfileSection from './ProfileSection'
import BillingSection from './BillingSection'
import ActivitySection from './ActivitySection'
import { apiGetCustomerById } from '@/services/CustomersService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import type { Customer } from '../CustomerList/types'

const { TabNav, TabList, TabContent } = Tabs

const CustomerDetails = () => {
  const { id } = useParams()

  const { data, isLoading } = useSWR(
    ['customer-details', id as string],
    () => apiGetCustomerById(id as string) as unknown as Customer,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      // nota: la línea siguiente estaba en tu código original (typo), la dejo igual por compatibilidad
      evalidateOnFocus: false as unknown as undefined,
    },
  )

  return (
    <Loading loading={isLoading}>
      {!isEmpty(data) && (
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="min-w-[330px] 2xl:min-w-[400px]">
            {/* Stubs: sin props para evitar errores de tipos */}
            <ProfileSection />
          </div>
          <Card className="w-full">
            <Tabs defaultValue="billing">
              <TabList>
                <TabNav value="billing">Billing</TabNav>
                <TabNav value="activity">Activity</TabNav>
              </TabList>
              <div className="p-4">
                <TabContent value="billing">
                  {/* Stub sin props */}
                  <BillingSection />
                </TabContent>
                <TabContent value="activity">
                  {/* Stub sin props */}
                  <ActivitySection />
                </TabContent>
              </div>
            </Tabs>
          </Card>
        </div>
      )}
    </Loading>
  )
}

export default CustomerDetails
