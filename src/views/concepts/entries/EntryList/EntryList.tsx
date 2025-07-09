import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import EntryListTable from './components/EntryListTable'
import EntryListActionTools from './components/EntryListActionTools'
import EntryListTableTools from './components/EntryListTableTools'
import EntryListSelected from './components/EntryListSelected'

const EntryList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Entries</h3>
                            <EntryListActionTools />
                        </div>
                        <EntryListTableTools />
                        <EntryListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <EntryListSelected />
        </>
    )
}

export default EntryList
