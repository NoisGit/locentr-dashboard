// src/views/concepts/logbook/LogbookList.tsx
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import LogbookListTableTools from './components/LogbookListTableTools'
import LogbookListTable from './components/LogbookListTable'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

type CommunitiesSlice = {
  selectedId?: string | number | null
  selectedName?: string | null
  selectedLabel?: string | null
  selectedTitle?: string | null
}

const LogbookList = () => {
  const store = useCommunitiesStore() as unknown as CommunitiesSlice

  const selectedId = store?.selectedId
  const communityName =
    store?.selectedName ?? store?.selectedLabel ?? store?.selectedTitle ?? ''

  const hasCommunity =
    selectedId !== undefined && selectedId !== null && String(selectedId) !== ''

  return (
    <Container>
      <AdaptiveCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3>Libro de novedades</h3>
            {hasCommunity && communityName ? (
              <div className="text-xs text-gray-500">
                <span className="mr-1">Comunidad</span>
                <span className="font-medium">{communityName}</span>
              </div>
            ) : null}
          </div>

          <LogbookListTableTools />
          <LogbookListTable />
        </div>
      </AdaptiveCard>
    </Container>
  )
}

export default LogbookList
