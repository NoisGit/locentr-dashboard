export type LogbookEntry = {
  id: number | string
  description?: string
  created_at?: string
  updated_at?: string

  community_id?: number | string | null
  community_name?: string | null

  property_id?: number | string | null
  property_number?: string | number | null

  user_id?: number | string | null
  user_name?: string | null
  user_email?: string | null

  media_url?: string | null

  entry_type?: string | null
  entry_status?: string | null
}

export type Filter = {
  query?: string
}
