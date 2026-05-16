import { useEffect, useMemo, useState } from 'react'
import Select from '@/components/ui/Select'
import { apiListCompanies, type Company } from '@/services/CompaniesService'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'

type CompanyOption = {
  label: string
  value: string | number
}

type CompanySwitcherProps = {
  className?: string
}

const CompanySwitcher = ({ className }: CompanySwitcherProps) => {
  const { companies, selectedId, setCompanies, selectCompany } = useCompaniesStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    if (companies.length > 0) return

    const loadCompanies = async () => {
      setLoading(true)
      try {
        const list = await apiListCompanies({ pageIndex: 1, pageSize: 200 })
        if (mounted) setCompanies(list, 'all', { autoSelectIfSingle: true })
      } catch {
        if (mounted) setCompanies([], 'all', { autoSelectIfSingle: false })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCompanies()

    return () => {
      mounted = false
    }
  }, [companies.length, setCompanies])

  const options = useMemo(
    () =>
      companies.map<CompanyOption>((company: Company) => ({
        value: company.id,
        label: company.name || String(company.id),
      })),
    [companies],
  )

  const value = options.find((option) => String(option.value) === String(selectedId)) ?? null

  if (options.length === 0 && !loading) return null

  return (
    <div className={className}>
      <Select
        className="min-w-[220px]"
        size="sm"
        isSearchable={false}
        isLoading={loading}
        options={options}
        value={value}
        placeholder="Empresa"
        onChange={(option) => {
          const selected = option as CompanyOption | null
          if (!selected) return
          selectCompany({ id: selected.value, name: selected.label })
        }}
      />
    </div>
  )
}

export default CompanySwitcher
