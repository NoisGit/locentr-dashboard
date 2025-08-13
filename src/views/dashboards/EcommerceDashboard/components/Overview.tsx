import { useState, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import GrowShrinkValue from '@/components/shared/GrowShrinkValue'
import AbbreviateNumber from '@/components/shared/AbbreviateNumber'
import Chart from '@/components/shared/Chart'
import { useThemeStore } from '@/store/themeStore'
import classNames from '@/utils/classNames'
import { COLOR_1, COLOR_2, COLOR_4 } from '@/constants/chart.constant'
import { options } from '../constants'
import { NumericFormat } from 'react-number-format'
import { TbCoin, TbShoppingBagCheck, TbEye } from 'react-icons/tb'
import type { ReactNode } from 'react'
import type { StatisticData, Period, StatisticCategory } from '../types'

type StatisticCardProps = {
  title: string
  value: number | ReactNode
  icon: ReactNode
  growShrink: number
  iconClass: string
  label: StatisticCategory
  compareFrom: string
  active: boolean
  onClick: (label: StatisticCategory) => void
}

type StatisticGroupsProps = {
  data?: StatisticData | null
}

type Entry = {
  value: number
  growShrink: number
  comparePeriod: string
  chartData: { series: number[]; date: string[] }
}

const EMPTY_ENTRY: Entry = {
  value: 0,
  growShrink: 0,
  comparePeriod: '—',
  chartData: { series: [], date: [] },
}

const chartColors: Record<StatisticCategory, string> = {
  totalProfit: COLOR_1,
  totalOrder: COLOR_2,
  totalImpression: COLOR_4,
}

const StatisticCard = (props: StatisticCardProps) => {
  const {
    title,
    value,
    label,
    icon,
    growShrink,
    iconClass,
    active,
    compareFrom,
    onClick,
  } = props

  return (
    <button
      className={classNames(
        'p-4 rounded-2xl cursor-pointer ltr:text-left rtl:text-right transition duration-150 outline-hidden',
        active && 'bg-white dark:bg-gray-900 shadow-md',
      )}
      onClick={() => onClick(label)}
    >
      <div className="flex md:flex-col-reverse gap-2 2xl:flex-row justify-between relative">
        <div>
          <div className="mb-4 text-sm font-semibold">{title}</div>
          <h3 className="mb-1">{value}</h3>
          <div className="inline-flex items-center flex-wrap gap-1">
            <GrowShrinkValue
              className="font-bold"
              value={growShrink}
              suffix="%"
              positiveIcon="+"
              negativeIcon=""
            />
            <span>{compareFrom}</span>
          </div>
        </div>
        <div
          className={classNames(
            'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 text-gray-900 rounded-full text-2xl',
            iconClass,
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

type DataByPeriod = Partial<Record<Period, Entry>>
type SafeStatisticData = Partial<Record<StatisticCategory, DataByPeriod>>

function getEntry(
  d: SafeStatisticData,
  cat: StatisticCategory,
  period: Period,
): Entry {
  return d[cat]?.[period] ?? EMPTY_ENTRY
}

const Overview = ({ data }: StatisticGroupsProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<StatisticCategory>('totalProfit')
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('thisMonth')

  const sideNavCollapse = useThemeStore((state) => state.layout.sideNavCollapse)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!sideNavCollapse && isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!isFirstRender.current) {
      window.dispatchEvent(new Event('resize'))
    }
  }, [sideNavCollapse])

  const sd: SafeStatisticData = (data ?? {}) as SafeStatisticData

  const profit = getEntry(sd, 'totalProfit', selectedPeriod)
  const order = getEntry(sd, 'totalOrder', selectedPeriod)
  const impression = getEntry(sd, 'totalImpression', selectedPeriod)
  const selectedEntry = getEntry(sd, selectedCategory, selectedPeriod)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h4>Vista General</h4>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl p-3 bg-gray-100 dark:bg-gray-700 mt-4">
        <StatisticCard
          title="Total profit"
          value={
            <NumericFormat
              displayType="text"
              value={profit.value}
              prefix="$"
              thousandSeparator
            />
          }
          growShrink={profit.growShrink}
          iconClass="bg-[#d5ff24]"
          icon={<TbCoin />}
          label="totalProfit"
          active={selectedCategory === 'totalProfit'}
          compareFrom={profit.comparePeriod}
          onClick={setSelectedCategory}
        />

        <StatisticCard
          title="Total order"
          value={
            <NumericFormat
              displayType="text"
              value={order.value}
              thousandSeparator
            />
          }
          growShrink={order.growShrink}
          iconClass="bg-[#0039aa] text-white"
          icon={<TbShoppingBagCheck />}
          label="totalOrder"
          active={selectedCategory === 'totalOrder'}
          compareFrom={order.comparePeriod}
          onClick={setSelectedCategory}
        />

        <StatisticCard
          title="Impression"
          value={<AbbreviateNumber value={impression.value} />}
          growShrink={impression.growShrink}
          iconClass="bg-[#3290ff] text-white"
          icon={<TbEye />}
          label="totalImpression"
          active={selectedCategory === 'totalImpression'}
          compareFrom={impression.comparePeriod}
          onClick={setSelectedCategory}
        />
      </div>

      <Chart
        type="line"
        series={selectedEntry.chartData.series}
        xAxis={selectedEntry.chartData.date}
        height="410px"
        customOptions={{
          legend: { show: false },
          colors: [chartColors[selectedCategory]],
        }}
      />
    </Card>
  )
}

export default Overview
