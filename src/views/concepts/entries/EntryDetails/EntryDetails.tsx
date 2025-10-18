// src/views/concepts/entries/EntryDetails/EntryDetails.tsx
import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import { apiGetEntry, ENTRY_BASE } from '@/services/EntryService'
import useSWR from 'swr'
import { useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'

type EntryDetailsData = Record<string, any>

const EntryDetails = () => {
  const { id } = useParams()

  const { data, isLoading } = useSWR(
    [ENTRY_BASE, { id: id as string }],
    ([, params]) => apiGetEntry<EntryDetailsData, { id: string }>(params),
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  const e = data || {}

  return (
    <Loading loading={isLoading}>
      {!isEmpty(e) && (
        <div className="flex flex-col xl:flex-row gap-4">
          <Card className="w-full">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {e?.img ? (
                  <img
                    src={e.img}
                    alt={e?.fullName || e?.name || 'Visitante'}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : null}
                <div>
                  <h3 className="text-xl font-semibold">
                    {e?.fullName || `${e?.firstName ?? ''} ${e?.lastName ?? ''}`.trim() || 'Visitante'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {e?.rut || e?.document || '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Motivo</div>
                  <div className="text-base">{e?.motivo ?? e?.reason ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Fecha</div>
                  <div className="text-base">{e?.fecha ?? e?.date ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Hora</div>
                  <div className="text-base">{e?.hora ?? e?.time ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Unidad / Depto</div>
                  <div className="text-base">
                    {e?.departamentoVisitado ??
                      e?.unit ??
                      e?.property ??
                      e?.property_number ??
                      '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Estado</div>
                  <div className="text-base">{e?.status ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">ID</div>
                  <div className="text-base">{String(e?.id ?? '—')}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Loading>
  )
}

export default EntryDetails
