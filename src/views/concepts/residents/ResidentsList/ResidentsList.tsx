// src/views/concepts/residents/ResidentsList/ResidentsList.tsx
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

import ResidentsListTable from './components/ResidentsListTable'
import ResidentsListActionTools from './components/ResidentsListActionTools'
import ResidentsListTableTools from './components/ResidentsListTableTools'
import ResidentsListSelected from './components/ResidentsListSelected'
import useResidentsList from './hooks/useResidentsList'

const ResidentsList = () => {
  const { residentsList = [], isLoading, error, mutate } = useResidentsList()

  if (!isLoading && error) {
    const serverMsg =
      (error as any)?.response?.data?.message ||
      (error as any)?.response?.data?.detail ||
      (error as any)?.message ||
      'No se pudo cargar la lista de residentes.'
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Error al cargar residentes</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
            <div className="flex gap-3">
              <Button onClick={() => mutate()} variant="solid">Reintentar</Button>
            </div>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  if (!isLoading && residentsList.length === 0) {
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Aún no hay residentes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cuando se asigne un residente a una propiedad, aparecerá aquí.
            </p>
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
              <h3>Residentes</h3>
              <ResidentsListActionTools />
            </div>
            <ResidentsListTableTools />
            <ResidentsListTable />
          </div>
        </AdaptiveCard>
      </Container>
      <ResidentsListSelected />
    </>
  )
}

export default ResidentsList
