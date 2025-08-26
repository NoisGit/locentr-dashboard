import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

import CondosListTable from './components/CondosListTable'
import CondosListActionTools from './components/CondosListActionTools'
import CondosListTableTools from './components/CondosListTableTools'
import CondosListSelected from './components/CondosListSelected'
import useCondosList from './hooks/useCondosList'

const CondosList = () => {
  const navigate = useNavigate()
  const { condosList, isLoading, error, mutate } = useCondosList()

  if (!isLoading && error) {
    const serverMsg =
      (error as any)?.response?.data?.message ||
      (error as any)?.response?.data?.detail ||
      (error as any)?.message ||
      'No se pudo cargar la lista de comunidades.'
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Error al cargar comunidades</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
            <div className="flex gap-3">
              <Button onClick={() => mutate()} variant="solid">Reintentar</Button>
              <Button onClick={() => navigate('/concepts/condos/condos-create')}>
                Crear comunidad
              </Button>
            </div>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  if (!isLoading && condosList.length === 0) {
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Aún no has creado ninguna comunidad</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crea tu primera comunidad para comenzar a gestionarla.
            </p>
            <div className="flex gap-3">
              <Button variant="solid" onClick={() => navigate('/concepts/condos/condos-create')}>
                Crear comunidad
              </Button>
            </div>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  return (
    <>
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h3>Comunidades</h3>
              <CondosListActionTools />
            </div>
            <CondosListTableTools />
            <CondosListTable />
          </div>
        </AdaptiveCard>
      </Container>
      <CondosListSelected />
    </>
  )
}

export default CondosList
