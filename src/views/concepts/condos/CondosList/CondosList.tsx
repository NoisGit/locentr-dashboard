// src/views/concepts/condos/CondosList/index.tsx
import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import CondosListTable from './components/CondosListTable'
import CondosListActionTools from './components/CondosListActionTools'
import CondosListTableTools from './components/CondosListTableTools'
import CondosListSelected from './components/CondosListSelected'
import useCondosList from './hooks/useCondosList'

type ErrShape = { message?: string; response?: { data?: { message?: string; detail?: string } } }

function getServerMessage(err: unknown): string {
  const fallback = 'No se pudo cargar la lista de comunidades.'
  if (typeof err === 'string') return err || fallback
  if (err && typeof err === 'object') {
    const e = err as ErrShape
    return e.response?.data?.message ?? e.response?.data?.detail ?? e.message ?? fallback
  }
  return fallback
}

const CondosList = () => {
  const navigate = useNavigate()
  const { condosList, isLoading, error, mutate } = useCondosList()

  if (!isLoading && error) {
    const serverMsg = getServerMessage(error)
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Error al cargar comunidades</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
            <div className="flex gap-3">
              <Button onClick={() => mutate()} variant="solid">Reintentar</Button>
              <Button onClick={() => navigate('/concepts/condos/condos-create')}>Crear comunidad</Button>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Crea tu primera comunidad para comenzar a gestionarla.</p>
            <div className="flex gap-3">
              <Button variant="solid" onClick={() => navigate('/concepts/condos/condos-create')}>Crear comunidad</Button>
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
