// src/views/concepts/invitations/InvitationsList/types.ts
export type ExternalPerson = {
  id: string | number
  full_name: string
  id_number: string
  contact_info: string | null
}

export type InvitedBy =
  | string
  | {
      id?: string | number
      full_name?: string
      name?: string
      email?: string
    }

export type InvitationEntry = {
  id: string | number
  external_person?: ExternalPerson
  created_by?: InvitedBy
  property_number?: string
  property_id?: string | number
  code?: string
  created_at?: string
  expiration_at?: string | null
  used?: boolean
  used_at?: string

  externalPersonId?: string | number
  externalPersonName?: string
  externalPersonIdNumber?: string
  externalPersonContact?: string | null
}

export type InvitationItem = InvitationEntry

export type GetInvitationsListResponse = {
  list: InvitationEntry[]
  total: number
}

export type Filter = {
  communityId?: number | string
  usedOnly?: boolean
  guestName?: string
}
