import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { apiGetCondoById } from '@/services/CondosService'
import useSWR from 'swr'
import { useNavigate, useParams } from 'react-router'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import type { Condo } from '../CondosList/types'

const CondosDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedName } = useCompaniesStore()

  const { data, isLoading, error } = useSWR<Condo>(
    id ? ['condos:detail', id] : null,
    ([, currentId]) => apiGetCondoById(String(currentId)),
    { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false },
  )

  const title = data?.name || `Condo ${id ?? ''}`.trim()

  return (
    <Loading loading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3>Detalle de condo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedName ? `Empresa: ${selectedName}` : 'Información general del condo.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/concepts/condos/condos-list')}>
              Volver
            </Button>
            {id ? (
              <Button
                variant="solid"
                onClick={() => navigate(`/concepts/condos/condos-edit/${id}`)}
              >
                Editar
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <Card>
            <div className="text-red-600 dark:text-red-400">
              No se pudo cargar el condo.
            </div>
          </Card>
        ) : (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Nombre</div>
                <div className="font-medium">{title || 'Sin nombre'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">ID</div>
                <div className="font-medium">{String(data?.id ?? id ?? '-')}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Loading>
  )
}

export default CondosDetails
