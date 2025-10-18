import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import sleep from '@/utils/sleep'
import dayjs from 'dayjs'
import isEmpty from 'lodash/isEmpty'
import {
    PiEyeDuotone,
    PiCloudCheckDuotone,
    PiCreditCardDuotone,
    PiTicketDuotone,
    PiPhoneOutgoingDuotone,
} from 'react-icons/pi'

const ActivitySection = ({
    perkName,
}: {
    perkName: string
    id?: string
}) => {
    const [fetchData, setfetchData] = useState(false)
    const [showNoMoreData, setShowNoMoreData] = useState(false)

    const handleLoadMore = async () => {
        setfetchData(true)
        await sleep(500)
        setShowNoMoreData(true)
        setfetchData(false)
    }

    return (
        <Loading loading={false}>
            <div className="text-center py-10">
                <span className="font-semibold text-gray-500">
                    No activity log disponible para este perk.
                </span>
            </div>
            <div className="text-center">
                {showNoMoreData ? (
                    <span className="font-semibold h-[40px] flex items-center justify-center">
                        No more activities
                    </span>
                ) : (
                    <Button loading={fetchData} onClick={handleLoadMore}>
                        Load More
                    </Button>
                )}
            </div>
        </Loading>
    )
}

export default ActivitySection
