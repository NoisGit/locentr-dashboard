// src/views/concepts/mailbox/MailboxList/types.ts

export type MailboxEntry = {
  id: string | number
  description?: string
  recipientName?: string
  trackingNumber?: string
  deliveryCompany?: string
  createdAt?: string
  isDelivered?: boolean
  deliveredAt?: string
  imageUrl?: string
  notes?: string
  communityId?: number | string
  propertyId?: number | string
  propertyNumber?: string
  status?: string
}

export type MailboxItem = MailboxEntry

export type GetMailboxListResponse = {
  list: MailboxEntry[]
  total: number
}

export type Filter = {
  folder?: string
  subject?: string
  tags?: string[]
  communityId?: number | string
  recipientName?: string
  trackingNumber?: string
  deliveryCompany?: string
  deliveredOnly?: boolean
}
