import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import EntryListTable from './components/EntryListTable'
import EntryListTableTools from './components/EntryListTableTools'

const EntryList = () => {
  return (
    <Container>
      <AdaptiveCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h3>Entradas</h3>
          </div>
          <EntryListTableTools />
          <EntryListTable />
        </div>
      </AdaptiveCard>
    </Container>
  )
}

export default EntryList
