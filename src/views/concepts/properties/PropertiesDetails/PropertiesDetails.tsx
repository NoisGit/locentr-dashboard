import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import { apiGetPropertyById } from '@/services/PropertiesService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import type { Property } from '@/views/concepts/properties/PropertiesList/types'

const PropertiesDetails = () => {
  const { id } = useParams()

  const { data, isLoading, error } = useSWR<Property>(
    id ? ['/api/v1/communities/properties/id', id] : null,
    ([, _id]) => apiGetPropertyById(String(_id)),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  )

  const isDataReady = !!data && !isEmpty(data) && !error

  const title =
    (data as any)?.name ||
    (data as any)?.propertyNumber ||
    (data as any)?.number ||
    (data as any)?.property_number ||
    'Propiedad'

  const community =
    (data as any)?.communityName ||
    (data as any)?.community_name ||
    (data as any)?.tower ||
    ''

  const propertyNumber =
    (data as any)?.propertyNumber ||
    (data as any)?.number ||
    (data as any)?.property_number ||
    ''

  const floor =
    (data as any)?.floor ?? ''

  return (
    <Loading loading={isLoading}>
      {isDataReady ? (
        <Card className="w-full">
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {(data as any)?.img ? (
                <img
                  src={(data as any).img}
                  alt={title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : null}
              <div>
                <h3 className="text-xl font-semibold">
                  {title || 'Propiedad'}
                </h3>
                <p className="text-sm text-gray-500">
                  {community || 'Comunidad no definida'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Número
                </div>
                <div className="text-base">
                  {propertyNumber ? String(propertyNumber) : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Piso
                </div>
                <div className="text-base">
                  {floor === '' || floor === undefined || floor === null ? '—' : String(floor)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Comunidad
                </div>
                <div className="text-base">
                  {community || '—'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center text-gray-500 p-4">
          No se pudo cargar la información de la propiedad.
        </div>
      )}
    </Loading>
  )
}

export default PropertiesDetails
