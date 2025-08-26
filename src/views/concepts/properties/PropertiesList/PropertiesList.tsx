// src/views/concepts/properties/PropertiesList/PropertiesList.tsx
import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

import PropertiesListTable from './components/PropertiesListTable'
import PropertiesListActionTools from './components/PropertiesListActionTools'
import PropertiesListTableTools from './components/PropertiesListTableTools'
import PropertiesListSelected from './components/PropertiesListSelected'
import usePropertiesList from './hooks/usePropertiesList'

const PropertiesList = () => {
  const navigate = useNavigate()
  const { propertiesList, isLoading, error, mutate } = usePropertiesList()

  if (!isLoading && error) {
    const serverMsg =
      (error as any)?.response?.data?.message ||
      (error as any)?.response?.data?.detail ||
      (error as any)?.message ||
      'No se pudo cargar la lista de propiedades.'
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Error al cargar propiedades</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
            <div className="flex gap-3">
              <Button onClick={() => mutate()} variant="solid">Reintentar</Button>
              <Button onClick={() => navigate('/concepts/properties/properties-create')}>
                Crear propiedad
              </Button>
            </div>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  if (!isLoading && propertiesList.length === 0) {
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h3 className="text-lg font-semibold">Aún no has creado ninguna propiedad</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crea tu primera propiedad para comenzar a gestionarla.
            </p>
            <div className="flex gap-3">
              <Button variant="solid" onClick={() => navigate('/concepts/properties/properties-create')}>
                Crear propiedad
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
              <h3>Propiedades</h3>
              <PropertiesListActionTools />
            </div>
            <PropertiesListTableTools />
            <PropertiesListTable />
          </div>
        </AdaptiveCard>
      </Container>
      <PropertiesListSelected />
    </>
  )
}

export default PropertiesList
