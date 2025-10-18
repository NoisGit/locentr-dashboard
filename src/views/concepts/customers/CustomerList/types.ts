// src/views/concepts/users/CustomerList/types.ts

export type GetCustomersListResponse = {
  list: Customer[]
  total: number
}

export type Filter = {
  query?: string
  purchasedProducts: string
  purchaseChannel: string[]
}

export type Customer = {
  id: number | string
  name: string
  email: string
  phone?: string
  role?: string
  avatar?: string
  createdAt?: string | number
}
