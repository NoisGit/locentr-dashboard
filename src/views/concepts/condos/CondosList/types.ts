import type { Control, FieldErrors } from 'react-hook-form'

export type PersonalInfo = {
  location: string
  title: string
  birthday: string
  phoneNumber: string
  dialCode: string
  address: string
  postcode: string
  city: string
  country: string
  facebook: string
  twitter: string
  pinterest: string
  linkedIn: string
}

export type OrderHistory = {
  id: string
  item: string
  status: string
  amount: number
  date: number
}

export type PaymentMethod = {
  cardHolderName: string
  cardType: string
  expMonth: string
  expYear: string
  last4Number: string
  primary: boolean
}

export type Subscription = {
  plan: string
  status: string
  billing: string
  nextPaymentDate: number
  amount: number
}

export type Condo = {
  id: string | number
  name: string
  address?: string
  type?: string
  img?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  lastOnline?: number
  status?: string
  personalInfo?: PersonalInfo
  orderHistory?: OrderHistory[]
  paymentMethod?: PaymentMethod[]
  subscription?: Subscription[]
  totalSpending?: number
  tags?: Array<{ value: string; label: string }>
}

export type GetCondosListResponse = {
  list: Condo[]
  total: number
}

export type Filter = {
  typeId?: number | ''
  departamento?: string[]
  motivo?: string
}

export type OverviewFields = {
  firstName: string
  lastName: string
  email: string
  dialCode: string
  phoneNumber: string
  img: string
}

export type AddressFields = {
  country: string
  address: string
  postcode: string
  city: string
}

export type ProfileImageFields = {
  img: string
}

export type TagsFields = {
  tags: Array<{ value: string; label: string }>
}

export type AccountField = {
  banAccount?: boolean
  accountVerified?: boolean
}

export type CondosFormSchema =
  & OverviewFields
  & AddressFields
  & ProfileImageFields
  & TagsFields
  & AccountField

export type FormSectionBaseProps = {
  control: Control<CondosFormSchema>
  errors: FieldErrors<CondosFormSchema>
}
