import { useEffect, useRef } from 'react'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

export default function useSyncCommunityFromCondo(
  communityId?: string | number | null,
  communityName?: string | null,
  force?: boolean,
) {
  const { selectedId, selectCommunity } = useCommunitiesStore()
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current && !force) return

    const hasId =
      communityId !== undefined &&
      communityId !== null &&
      String(communityId).trim() !== ''

    if (!hasId) return

    if (force || String(selectedId ?? '') !== String(communityId)) {
      selectCommunity({
        id: communityId as string | number,
        name: String(communityName ?? ''),
      })
    }

    doneRef.current = true
  }, [communityId, communityName, selectedId, selectCommunity, force])
}
