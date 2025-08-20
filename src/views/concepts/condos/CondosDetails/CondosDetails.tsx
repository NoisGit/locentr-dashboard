// src/views/concepts/condos/CondosDetails/index.tsx
import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import { apiGetCondoById } from '@/services/CondosService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import type { Condo } from '../CondosList/types'

const CondosDetails = () => {
  const { id } = useParams()

  const { data, isLoading, error } = useSWR<Condo>(
    id ? ['/api/v1/communities/id', id] : null,
    ([, _id]) => apiGetCondoById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  )

  const isDataReady = !!data && !isEmpty(data) && !error

  return (
    <Loading loading={isLoading}>
      {isDataReady ? (
        <Card className="w-full">
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {data?.img ? (
                <img
                  src={data.img}
                  alt={data.name ?? 'Comunidad'}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : null}
              <div>
                <h3 className="text-xl font-semibold">
                  {data?.name ?? 'Sin nombre'}
                </h3>
                <p className="text-sm text-gray-500">
                  {data?.type ?? 'Tipo no definido'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Dirección
                </div>
                <div className="text-base">
                  {data?.address && data.address.trim() !== '' ? data.address : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  ID
                </div>
                <div className="text-base">{String(data?.id ?? '—')}</div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center text-gray-500 p-4">
          No se pudo cargar la información de la comunidad.
        </div>
      )}
    </Loading>
  )
}

export default CondosDetails
