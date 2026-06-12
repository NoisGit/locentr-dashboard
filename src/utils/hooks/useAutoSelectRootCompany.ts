import { useEffect } from 'react'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import type { Company } from '@/services/CompaniesService'

const useAutoSelectRootCompany = (companies: Company[], enabled: boolean) => {
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const selectCompany = useCompaniesStore((state) => state.selectCompany)

    useEffect(() => {
        if (!enabled || companies.length === 0) return

        const hasValidSelection = companies.some(
            (company) => String(company.id) === String(selectedCompanyId),
        )
        if (!hasValidSelection) {
            const firstCompany = companies[0]
            selectCompany({
                id: firstCompany.id,
                name: firstCompany.name,
            })
        }
    }, [companies, enabled, selectCompany, selectedCompanyId])
}

export default useAutoSelectRootCompany
