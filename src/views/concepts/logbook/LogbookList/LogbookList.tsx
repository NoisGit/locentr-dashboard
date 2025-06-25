import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import LogbookListActionTools from './components/LogbookListActionTools'
import LogbookListTableTools from './components/LogbookListTableTools'
import LogbookListTable from './components/LogbookListTable'
import LogbookListSelected from './components/LogbookListSelected'

const LogbookList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Libro de novedades</h3>
                            <LogbookListActionTools />
                        </div>
                        <LogbookListTableTools />
                        <LogbookListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <LogbookListSelected />
        </>
    )
}

export default LogbookList
