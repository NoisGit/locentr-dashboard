// src/views/concepts/condos/CondosDetails/components/TabCollaborators.tsx
import { useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'

// Reutilizamos TODO del módulo de colaboradores
import CollaboratorsListTable from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTable'
import CollaboratorsListTableTools from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTableTools'
import CollaboratorsListActionTools from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListActionTools'
import CollaboratorsListSelected from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListSelected'
import useCollaboratorsList from '@/views/concepts/collaborators/CollaboratorsList/hooks/useCollaboratorsList'
import { useCollaboratorsListStore } from '@/views/concepts/collaborators/CollaboratorsList/store/CollaboratorsListStore'

type Props = {
  communityId?: number
  condoId?: number
}

export default function TabCollaborators({ communityId }: Props) {
  const {
    tableData,
    filterData,
    setFilterData,
    mutate,
  } = useCollaboratorsList()

  // Acción atómica para volver a página 1 y limpiar selección (debe existir en el store)
  const resetForCommunity = useCollaboratorsListStore(s => s.resetForCommunity)

  // Ajustar el filtro solo si realmente cambió la comunidad.
  // Nada de mutate(): SWR refetchea al cambiar su clave.
  useEffect(() => {
    const nextCid = communityId == null ? '' : Number(communityId)
    const prevCid = (filterData?.communityId ?? '') as number | ''
    if (prevCid !== nextCid) {
      setFilterData(prev => ({ ...prev, communityId: nextCid }))
      resetForCommunity()
    }
  }, [communityId, filterData?.communityId, setFilterData, resetForCommunity])

  // Refrescar ante cambios externos (crear/editar/eliminar)
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('collaborators:changed', handler as EventListener)
    return () => window.removeEventListener('collaborators:changed', handler as EventListener)
  }, [mutate])

  // Clave estable para re-montar la tabla (evita quedarse en páginas vacías)
  const tableKey = useMemo(() => {
    const sKey   = tableData?.sort?.key ?? ''
    const sOrd   = tableData?.sort?.order ?? ''
    const q      = tableData?.query ?? ''
    const role   = (filterData?.role ?? '') as string
    const active = (filterData?.active ?? '') as string | boolean
    return [
      tableData?.pageIndex,
      tableData?.pageSize,
      sKey, sOrd,
      q, role, String(active),
      communityId ?? '',
    ].join('|')
  }, [tableData, filterData, communityId])

  return (
    <div className="space-y-4">
      {/* Header: título + acciones (Download) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Colaboradores</h3>
        <CollaboratorsListActionTools />
      </div>

      {/* Buscador + Filtros */}
      <CollaboratorsListTableTools />

      {/* Tabla */}
      <Card className="w-full">
        <div className="p-0">
          <div key={tableKey}>
            <CollaboratorsListTable />
          </div>
        </div>
      </Card>

      {/* Footer de selección */}
      <CollaboratorsListSelected />
    </div>
  )
}
