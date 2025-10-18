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

export type Entry = {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    img: string
    role: string
    lastOnline: number
    status: string
    personalInfo: PersonalInfo
    tags?: Array<{ value: string; label: string }>
}

export type GetEntryListResponse = {
    list: Entry[]
    total: number
}

export type Filter = {
    motivo: string
    departamento: Array<string>
}

// Formulario (EntryForm)
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

export type EntryFormSchema = OverviewFields &
    AddressFields &
    ProfileImageFields &
    TagsFields &
    AccountField

export type FormSectionBaseProps = {
    control: Control<EntryFormSchema>
    errors: FieldErrors<EntryFormSchema>
}
