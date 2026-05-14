export type GetUsersListResponse = {
  list: User[]
  total: number
}

export type Filter = {
  query?: string
}

export type User = {
  id: number | string
  name: string
  email: string
  phone?: string
  role?: string
  avatar?: string
  createdAt?: string | number
}
