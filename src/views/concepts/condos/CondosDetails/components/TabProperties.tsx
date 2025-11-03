// src/views/concepts/condos/CondosDetails/components/TabProperties.tsx
import { useEffect } from 'react'
import Card from '@/components/ui/Card'

// Reusamos TODO del módulo de propiedades
import PropertiesListTable from '@/views/concepts/properties/PropertiesList/components/PropertiesListTable'
import PropertiesListTableTools from '@/views/concepts/properties/PropertiesList/components/PropertiesListTableTools'
import PropertiesListActionTools from '@/views/concepts/properties/PropertiesList/components/PropertiesListActionTools'
import PropertiesListSelected from '@/views/concepts/properties/PropertiesList/components/PropertiesListSelected'
import usePropertiesList from '@/views/concepts/properties/PropertiesList/hooks/usePropertiesList'

type Props = {
  communityId?: number
  condoId?: number // (por ahora no se usa, pero lo dejamos por si luego filtramos por condominio)
}

export default function TabProperties({ communityId }: Props) {
  const { setFilterData, setTableData, mutate } = usePropertiesList()

  // Cuando cambia el communityId desde el header: aplicamos filtro, reseteamos paginación y refrescamos
  useEffect(() => {
    setFilterData(prev => ({
      ...prev,
      communityId: communityId == null ? '' : Number(communityId),
    }))
    setTableData(prev => ({
      ...prev,
      pageIndex: 1,
    }))
    // forzamos un refresh inmediato del SWR de la lista
    mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId])

  // 🔔 Escucha global: cuando se cree/edite/elimine una propiedad en otro componente,
  // disparamos 'properties:changed' y aquí ejecutamos mutate() para ver los cambios sin F5.
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('properties:changed', handler as EventListener)
    return () => window.removeEventListener('properties:changed', handler as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      {/* Header idéntico al módulo: título + acciones (Download) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Propiedades</h3>
        <PropertiesListActionTools />
      </div>

      {/* Buscador + Filtros (abre el mismo modal de filtros) */}
      <PropertiesListTableTools />

      {/* La tabla original con paginación, orden, selección, etc. */}
      <Card className="w-full">
        <div className="p-0">
          <PropertiesListTable />
        </div>
      </Card>

      {/* Footer de selección (Eliminar múltiple, etc.) */}
      <PropertiesListSelected />
    </div>
  )
}
