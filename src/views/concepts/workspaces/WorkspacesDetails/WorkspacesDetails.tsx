import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { TbArrowLeft, TbPencil } from 'react-icons/tb'
import { apiGetLocationById } from '@/services/LocationsService'

const WorkspacesDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const workspaceId = useMemo(() => (id ? String(id).replace(/\/+$/, '') : ''), [id])

  const { data, isLoading } = useSWR(
    workspaceId ? ['workspaces:detail', workspaceId] : null,
    ([, currentId]) => apiGetLocationById(currentId as string),
    { revalidateOnFocus: false },
  )

  return (
    <Loading loading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3>Detalle de workspace</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Información general del workspace seleccionado.
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<TbArrowLeft />} onClick={() => navigate('/concepts/workspaces/workspaces-list')}>
              Volver
            </Button>
            {workspaceId ? (
              <Button
                variant="solid"
                icon={<TbPencil />}
                onClick={() => navigate(`/concepts/workspaces/workspaces-edit/${workspaceId}`)}
              >
                Editar
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Nombre</div>
              <div className="font-medium">{data?.name || 'Sin nombre'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Dirección</div>
              <div className="font-medium">{data?.address || 'Sin dirección'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">País</div>
              <div className="font-medium">{data?.country || 'Sin país'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Estado</div>
              <div className="font-medium">{data?.isActive === false ? 'Inactivo' : 'Activo'}</div>
            </div>
          </div>
        </Card>
      </div>
    </Loading>
  )
}

export default WorkspacesDetails
