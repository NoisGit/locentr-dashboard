// src/views/concepts/mailbox/MailboxDetails/MailboxDetails.tsx
import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import { apiGetMailbox, MAILBOX_BASE } from '@/services/MailboxService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'

type MailboxDetailsData = Record<string, any>

const MailboxDetails = () => {
  const { id } = useParams()

  const { data, isLoading } = useSWR(
    [MAILBOX_BASE, { id: id as string }],
    ([, params]) => apiGetMailbox<MailboxDetailsData, { id: string }>(params),
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  const m = data || {}

  const displayName =
    m?.recipientName ||
    m?.recipient_name ||
    m?.recipient ||
    m?.user?.full_name ||
    m?.user?.name ||
    m?.name ||
    'Recipient'

  const picture =
    m?.img || m?.image || m?.image_url || m?.photo_url || m?.picture || ''

  const tracking =
    m?.trackingNumber || m?.tracking_number || m?.tracking || m?.guide || '—'

  const company =
    m?.deliveryCompany || m?.company || m?.carrier || m?.courier || '—'

  const unit =
    m?.unit ||
    m?.department ||
    m?.apartment ||
    m?.property_number ||
    m?.property?.number ||
    m?.property ||
    '—'

  const deliveredAt =
    m?.deliveredAt || m?.delivered_at || m?.delivery_date || m?.fecha_entrega

  const receivedAt =
    m?.receivedAt || m?.received_at || m?.reception_date || m?.fecha_recepcion

  const receiver =
    m?.receivedBy || m?.receiver || m?.receiver_name || m?.receptor || '—'

  const notes = m?.notes || m?.note || m?.observations || m?.description || '—'

  const status =
    m?.status ??
    (typeof m?.delivered === 'boolean' ? (m.delivered ? 'Delivered' : 'Pending') : '—')

  return (
    <Loading loading={isLoading}>
      {!isEmpty(m) && (
        <div className="flex flex-col xl:flex-row gap-4">
          <Card className="w-full">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {picture ? (
                  <img
                    src={picture}
                    alt={displayName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : null}
                <div>
                  <h3 className="text-xl font-semibold">{displayName}</h3>
                  <p className="text-sm text-gray-500">{tracking}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Recipient</div>
                  <div className="text-base">{displayName}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Tracking number</div>
                  <div className="text-base">{tracking}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Delivery company</div>
                  <div className="text-base">{company}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Unit / Dept</div>
                  <div className="text-base">{unit}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Delivered at</div>
                  <div className="text-base">{deliveredAt ?? '—'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Received at</div>
                  <div className="text-base">{receivedAt ?? '—'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Received by</div>
                  <div className="text-base">{receiver}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                  <div className="text-base">{status}</div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Notes</div>
                  <div className="text-base">{notes}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">ID</div>
                  <div className="text-base">{String(m?.id ?? '—')}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Loading>
  )
}

export default MailboxDetails
