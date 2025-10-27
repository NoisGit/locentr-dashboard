// src/views/concepts/condos/CondosDetails/components/TabCollaborators.tsx
import { useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'

// Reutilizamos TODO del módulo de colaboradores
import CollaboratorsListTable from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTable'
import CollaboratorsListTableTools from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTableTools'
import CollaboratorsListActionTools from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListActionTools'
import CollaboratorsListSelected from '@/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListSelected'
import useCollaboratorsList from '@/views/concepts/collaborators/CollaboratorsList/hooks/useCollaboratorsList'

type Props = {
  communityId?: number
  condoId?: number
}

export default function TabCollaborators({ communityId }: Props) {
  const {
    tableData,
    filterData,
    setFilterData,
    setTableData,
    mutate,
  } = useCollaboratorsList()

  // Cuando cambia el communityId: aplicamos filtro, volvemos a page 1 y refrescamos
  useEffect(() => {
    setFilterData(prev => ({
      ...prev,
      communityId: communityId == null ? '' : Number(communityId),
    }))
    setTableData(prev => ({ ...prev, pageIndex: 1 }))
    void mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId])

  // Refrescar automáticamente ante cambios externos (crear/editar/eliminar)
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('collaborators:changed', handler as EventListener)
    return () => window.removeEventListener('collaborators:changed', handler as EventListener)
  }, [mutate])

  // Clave estable para re-montar la tabla (evita quedarse en páginas vacías)
  const tableKey = useMemo(() => {
    const sKey = tableData?.sort?.key ?? ''
    const sOrd = tableData?.sort?.order ?? ''
    const q    = tableData?.query ?? ''
    const f: Record<string, unknown> = (filterData ?? {}) as any
    const role   = f['role'] ?? ''
    const active = f['active'] ?? ''
    return [
      tableData?.pageIndex,
      tableData?.pageSize,
      sKey, sOrd,
      q, role, active,
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
