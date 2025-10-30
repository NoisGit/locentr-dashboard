// src/views/concepts/condos/CondosDetails/components/TabCollaborators.tsx
import { useEffect } from 'react'
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
  const { setTableData, mutate } = useCollaboratorsList()

  // Al cambiar comunidad: ir a pág. 1 (no forzamos remounts)
  useEffect(() => {
    setTableData(prev => ({ ...prev, pageIndex: 1 }))
  }, [communityId, setTableData])

  // Revalida cuando se disparen cambios externos
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('collaborators:changed', handler as EventListener)
    return () => window.removeEventListener('collaborators:changed', handler as EventListener)
  }, [mutate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Colaboradores</h3>
        <CollaboratorsListActionTools />
      </div>

      <CollaboratorsListTableTools />

      <Card className="w-full">
        <div className="p-0">
          <CollaboratorsListTable />
        </div>
      </Card>

      <CollaboratorsListSelected />
    </div>
  )
}
