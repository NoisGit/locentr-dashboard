// src/views/concepts/invitations/InvitationsList/InvitationsList.tsx
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import InvitationsListTable from './components/InvitationsListTable'
import InvitationsListTableTools from './components/InvitationsListTableTools'

const InvitationsList = () => {
  return (
    <Container>
      <AdaptiveCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h3>Invitaciones</h3>
          </div>
          <InvitationsListTableTools />
          <InvitationsListTable />
        </div>
      </AdaptiveCard>
    </Container>
  )
}

export default InvitationsList
