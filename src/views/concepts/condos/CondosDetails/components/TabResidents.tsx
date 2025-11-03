// src/views/concepts/condos/CondosDetails/components/TabResidents.tsx
import { useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'

// Reutilizamos TODO del módulo de residentes
import ResidentsListTable from '@/views/concepts/residents/ResidentsList/components/ResidentsListTable'
import ResidentsListTableTools from '@/views/concepts/residents/ResidentsList/components/ResidentsListTableTools'
import ResidentsListActionTools from '@/views/concepts/residents/ResidentsList/components/ResidentsListActionTools'
import ResidentsListSelected from '@/views/concepts/residents/ResidentsList/components/ResidentsListSelected'
import useResidentsList from '@/views/concepts/residents/ResidentsList/hooks/useResidentsList'

type Props = {
  communityId?: number
  condoId?: number // reservado por si luego filtramos por condominio
}

export default function TabResidents({ communityId }: Props) {
  const {
    tableData,
    filterData,
    setTableData,
    mutate,
  } = useResidentsList()

  // Cuando cambia el communityId desde el header: solo reseteamos paginación.
  // El hook ya toma la comunidad desde useCommunitiesStore (sin tocar filterData).
  useEffect(() => {
    setTableData(prev => ({
      ...prev,
      pageIndex: 1,
    }))
  }, [communityId, setTableData])

  // Refresca la lista cuando ocurra un cambio externo (crear/editar/eliminar) sin F5
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('residents:changed', handler as EventListener)
    return () => window.removeEventListener('residents:changed', handler as EventListener)
  }, [mutate])

  // Clave estable para forzar re-montaje del DataTable y que el salto de página sea inmediato
  const tableKey = useMemo(() => {
    const sKey = tableData?.sort?.key ?? ''
    const sOrd = tableData?.sort?.order ?? ''
    const q = tableData?.query ?? ''
    // Solo campos existentes en el filtro (sin communityId aquí)
    const f: Record<string, unknown> = filterData as Record<string, unknown>
    const pid = f['propertyId'] ?? ''
    const uid = f['userId'] ?? ''
    const own = f['isOwner'] ?? ''
    const sd = f['startDateFrom'] ?? ''
    const ed = f['endDateTo'] ?? ''
    return [
      tableData?.pageIndex,
      tableData?.pageSize,
      sKey, sOrd,
      q, pid, uid, own, sd, ed,
      communityId ?? '', // la incluimos para que cambie la clave cuando cambia la comunidad
    ].join('|')
  }, [tableData, filterData, communityId])

  return (
    <div className="space-y-4">
      {/* Header: título + acciones (Download) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Residentes</h3>
        <ResidentsListActionTools />
      </div>

      {/* Buscador + Filtros */}
      <ResidentsListTableTools />

      {/* La tabla original */}
      <Card className="w-full">
        <div className="p-0">
          <div key={tableKey}>
            <ResidentsListTable />
          </div>
        </div>
      </Card>

      {/* Footer de selección */}
      <ResidentsListSelected />
    </div>
  )
}
