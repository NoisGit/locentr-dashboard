import { useState } from 'react'
import Card from '@/components/ui/Card'
import TabProperties from './TabProperties'
import TabResidents from './TabResidents'
import TabCollaborators from './TabCollaborators'

type Props = {
  communityId?: number
  condoId?: number
}

const tabs = [
  { key: 'properties', label: 'Propiedades' },
  { key: 'residents', label: 'Residentes' },
  { key: 'collaborators', label: 'Colaboradores' }, // conserjes + guardias
] as const

type TabKey = typeof tabs[number]['key']

export default function CondoTabs({ communityId, condoId }: Props) {
  const [active, setActive] = useState<TabKey>('properties')

  return (
    <Card className="mt-6 w-full">
      {/* centrado sin tocar tamaños */}
      <div className="px-4 pt-4 flex justify-center">
        <div className="inline-flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {tabs.map(t => {
            const on = active === t.key
            return (
              <button
                key={t.key}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  on
                    ? 'bg-primary text-white shadow ring-1 ring-primary/30'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                ].join(' ')}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4">
        {active === 'properties' && <TabProperties communityId={communityId} condoId={condoId} />}
        {active === 'residents' && <TabResidents communityId={communityId} condoId={condoId} />}
        {active === 'collaborators' && <TabCollaborators communityId={communityId} condoId={condoId} />}
      </div>
    </Card>
  )
}
