import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import IncidentListActionTools from './components/IncidentListActionTools'
import IncidentListTableTools from './components/IncidentListTableTools'
import IncidentListTable from './components/IncidentListTable'

const IncidentList = () => {
  return (
    <Container>
      <AdaptiveCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h3>Reporte de Problemas</h3>
            <IncidentListActionTools />
          </div>

          <IncidentListTableTools />

          <div className="space-y-8">
            <section>
              <h4 className="mb-3 font-semibold">
                Activos <span className="text-gray-500"></span>
              </h4>
              <IncidentListTable
                section="active"
                statusIn={['OPEN', 'PENDING', 'IN_PROGRESS']}
              />
            </section>

            <section>
              <h4 className="mb-3 font-semibold">Resueltos</h4>
              <IncidentListTable
                section="resolved"
                statusIn={['CLOSED', 'RESOLVED']}
              />
            </section>
          </div>
        </div>
      </AdaptiveCard>
    </Container>
  )
}

export default IncidentList
