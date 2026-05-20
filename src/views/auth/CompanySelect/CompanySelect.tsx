import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiListCompanies, type Company } from '@/services/CompaniesService'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'

type CompanyOption = {
  label: string
  value: string | number
}

const WORKSPACES_LIST_PATH = '/workspaces'

const CompanySelect = () => {
  const navigate = useNavigate()
  const { setCompanies, selectCompany, selectedId } = useCompaniesStore()

  const [companies, setLocalCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadCompanies = async () => {
      setLoading(true)
      try {
        const list = await apiListCompanies({ pageIndex: 1, pageSize: 200 })
        if (!mounted) return

        setLocalCompanies(list)
        setCompanies(list, 'all', { autoSelectIfSingle: false })

        const current = list.find((company) => String(company.id) === String(selectedId))
        if (current) {
          setSelectedCompany({ value: current.id, label: current.name })
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string; detail?: string } } }
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'No se pudieron cargar las empresas.'

        toast.push(<Notification type="danger">{message}</Notification>, {
          placement: 'top-center',
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCompanies()

    return () => {
      mounted = false
    }
  }, [selectedId, setCompanies])

  const options = companies.map<CompanyOption>((company) => ({
    value: company.id,
    label: company.name || String(company.id),
  }))

  const handleContinue = () => {
    if (!selectedCompany) {
      toast.push(<Notification type="warning">Selecciona una empresa.</Notification>, {
        placement: 'top-center',
      })
      return
    }

    selectCompany({ id: selectedCompany.value, name: selectedCompany.label })
    navigate(WORKSPACES_LIST_PATH, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div>
            <h3>Selecciona empresa</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Elige la empresa con la que quieres trabajar en Coredeck.
            </p>
          </div>

          <Select
            isLoading={loading}
            isDisabled={loading}
            options={options}
            value={selectedCompany}
            placeholder="Selecciona empresa"
            onChange={(option) => setSelectedCompany(option as CompanyOption | null)}
          />

          <Button variant="solid" loading={loading} onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CompanySelect
