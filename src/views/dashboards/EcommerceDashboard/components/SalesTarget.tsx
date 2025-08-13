import { useState } from 'react'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import Select from '@/components/ui/Select'
import AbbreviateNumber from '@/components/shared/AbbreviateNumber'
import { options } from '../constants'
import type { SalesTargetData, Period } from '../types'

type SalesTargetProps = {
  data?: SalesTargetData | null
}

const periodLabel: Record<Period, string> = {
  thisMonth: 'month',
  thisWeek: 'week',
  thisYear: 'year',
}

const EMPTY = { achieved: 0, target: 0, percentage: 0 }

const SalesTarget = ({ data }: SalesTargetProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('thisMonth')

  const entry = (data?.[selectedPeriod] ?? EMPTY)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h4>Género de Visitantes</h4>
        <Select
          className="w-[120px]"
          size="sm"
          placeholder="Select period"
          value={options.filter((option) => option.value === selectedPeriod)}
          options={options}
          isSearchable={false}
          onChange={(option) => {
            if (option?.value) setSelectedPeriod(option.value as Period)
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="flex flex-col">
          <h2>
            <AbbreviateNumber value={entry.achieved} />
            <span className="opacity-60 text-base font-bold">
              {' / '}
              <AbbreviateNumber value={entry.target} /> Units
            </span>
          </h2>
          <div className="mt-1">Made this {periodLabel[selectedPeriod]} year</div>
        </div>
        <div>
          <Progress
            percent={entry.percentage}
            width={80}
            variant="circle"
            strokeWidth={8}
          />
        </div>
      </div>
    </Card>
  )
}

export default SalesTarget
