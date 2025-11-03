// src/views/concepts/condos/CondosDetails/components/TabAccesspoints.tsx
import { useEffect } from 'react'
import Card from '@/components/ui/Card'

import AccessPointsListTable from '@/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListTable'
import AccessPointsListTableTools from '@/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListTableTools'
import AccessPointsListActionTools from '@/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListActionTools'
import AccessPointsListSelected from '@/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListSelected'
import useAccessPointsList from '@/views/concepts/accesspoints/AccessPointsList/hooks/useAccessPointsList'

type Props = {
  communityId?: number
  condoId?: number
}

export default function TabAccesspoints({ communityId }: Props) {
  const { setTableData, mutate } = useAccessPointsList()

  // Al cambiar comunidad: ir a pág. 1 (no forzamos remounts)
  useEffect(() => {
    setTableData(prev => ({ ...prev, pageIndex: 1 }))
  }, [communityId, setTableData])

  // Revalida cuando se disparen cambios externos (crear/editar/eliminar hardware)
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('accesspoints:changed', handler as EventListener)
    return () => window.removeEventListener('accesspoints:changed', handler as EventListener)
  }, [mutate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Access Points</h3>
        <AccessPointsListActionTools />
      </div>

      <AccessPointsListTableTools />

      <Card className="w-full">
        <div className="p-0">
          <AccessPointsListTable />
        </div>
      </Card>

      <AccessPointsListSelected />
    </div>
  )
}
