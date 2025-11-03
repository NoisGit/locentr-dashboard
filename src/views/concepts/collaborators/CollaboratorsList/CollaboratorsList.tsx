import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'

import CollaboratorsListTable from './components/CollaboratorsListTable'
import CollaboratorsListActionTools from './components/CollaboratorsListActionTools'
import CollaboratorsListTableTools from './components/CollaboratorsListTableTools'
import CollaboratorsListSelected from './components/CollaboratorsListSelected'
import useCollaboratorsList from './hooks/useCollaboratorsList'
import { useEffect } from 'react'

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null

function extractServerMessage(err: unknown): string {
  if (!err) return 'No se pudo cargar la lista de colaboradores.'
  if (typeof err === 'string') return err

  if (isRec(err)) {
    const response = isRec(err.response) ? (err.response as Rec) : undefined
    const data = response && isRec(response.data) ? (response.data as Rec) : undefined
    const candidates = [
      data?.message,
      data?.detail,
      data?.msg,
      data?.error,
      (err as any)?.message,
    ]
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c
    }
  }

  return 'No se pudo cargar la lista de colaboradores.'
}

const CollaboratorsList = () => {
  const {
    list: collaboratorsList = [],
    isLoading,
    error,
    mutate,
  } = useCollaboratorsList()

  // 🔔 Escucha global: cuando alguien edite/cree/elim., revalida altiro
  useEffect(() => {
    const handler = () => { void mutate() }
    window.addEventListener('collaborators:changed', handler as EventListener)
    return () => window.removeEventListener('collaborators:changed', handler as EventListener)
  }, [mutate])

  if (!isLoading && error) {
    const serverMsg = extractServerMessage(error)
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <h3 className="text-lg font-semibold">Error al cargar colaboradores</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
            <div className="flex gap-3">
              <Button variant="solid" onClick={() => mutate()}>
                Reintentar
              </Button>
            </div>
          </div>
        </AdaptiveCard>
      </Container>
    )
  }

  if (!isLoading && collaboratorsList.length === 0) {
    return (
      <Container>
        <AdaptiveCard>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <h3 className="text-lg font-semibold">Aún no hay colaboradores</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cuando se creen o asignen colaboradores, aparecerán aquí.
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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3>Colaboradores</h3>
              <CollaboratorsListActionTools />
            </div>
            <CollaboratorsListTableTools />
            <CollaboratorsListTable />
          </div>
        </AdaptiveCard>
      </Container>
      <CollaboratorsListSelected />
    </>
  )
}

export default CollaboratorsList
