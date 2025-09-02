// src/views/concepts/mailbox/MailboxList/MailboxList.tsx
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import MailboxListTable from './components/MailboxListTable'
import MailboxListTableTools from './components/MailboxListTableTools'

const MailboxList = () => {
  return (
    <Container>
      <AdaptiveCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h3>Mailbox</h3>
          </div>
          <MailboxListTableTools />
          <MailboxListTable />
        </div>
      </AdaptiveCard>
    </Container>
  )
}

export default MailboxList
