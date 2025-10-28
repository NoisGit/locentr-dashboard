// src/views/concepts/condos/CondosDetails/components/TabCollaborators.tsx
import { useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'

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
    setTableData,
    mutate,
  } = useCollaboratorsList()

  // Al cambiar la comunidad: reset a pág. 1 (el hook ya toma communityId desde el store global)
  useEffect(() => {
    setTableData(prev => ({ ...prev, pageIndex: 1 }))
  }, [communityId, setTableData])

  // Refrescar ante cambios externos (crear/editar/eliminar)
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('collaborators:changed', handler as EventListener)
    return () => window.removeEventListener('collaborators:changed', handler as EventListener)
  }, [mutate])

  // Clave estable para forzar re-montaje del DataTable cuando cambian filtros/paginación/comunidad
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
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Colaboradores</h3>
        <CollaboratorsListActionTools />
      </div>

      <CollaboratorsListTableTools />

      <Card className="w-full">
        <div className="p-0">
          <div key={tableKey}>
            <CollaboratorsListTable />
          </div>
        </div>
      </Card>

      <CollaboratorsListSelected />
    </div>
  )
}
