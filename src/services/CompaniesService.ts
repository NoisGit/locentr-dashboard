import ApiService from '@/services/ApiService'

export const COMPANIES_BASE = '/api/v1/companies/'

export type Company = {
    id: string | number
    name: string
    activity?: string | null
    id_number?: string | null
    logo?: string | null
    type_document?: string | null
    is_active?: boolean
    parent_company_id?: number | null
    created_by?: number | null
    created_at?: string | null
}

export type CompanyCreateRequest = {
    name: string
    activity?: string | null
    id_number?: string | null
    logo?: string | null
    type_document?: string | null
}

export type SubCompanyCreateRequest = CompanyCreateRequest & {
    parent_company_id?: number | null
}

export type CompanyUpdateRequest = Partial<CompanyCreateRequest>

export type CompanyAssignUserRequest = {
    user_id: number
}

export type CompanyUserCreateRequest = {
    full_name: string
    email: string
    password: string
    phone?: string
    role_id: string | number
}

type ListCompaniesParams = {
    pageIndex?: number
    pageSize?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function toStr(value: unknown): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return ''
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && !Number.isNaN(value)) return value

    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value)
        return Number.isNaN(parsed) ? null : parsed
    }

    return null
}

function firstArrayCandidate(value: unknown): unknown[] {
    if (Array.isArray(value)) return value
    if (!isRecord(value)) return []

    const keys = ['items', 'companies', 'list', 'results', 'records', 'rows', 'content', 'data']
    for (const key of keys) {
        const candidate = value[key]
        if (Array.isArray(candidate)) return candidate
    }

    const data = value.data
    if (isRecord(data)) {
        for (const key of keys) {
            const candidate = data[key]
            if (Array.isArray(candidate)) return candidate
        }
    }

    return []
}

function unwrapRecord(value: unknown): unknown {
    if (!isRecord(value)) return value

    const data = value.data
    if (isRecord(data)) return data

    return value
}

function mapToCompany(value: unknown): Company | null {
    const record = unwrapRecord(value)
    if (!isRecord(record)) return null

    const id = record.id ?? record._id ?? record.company_id ?? record.companyId
    const name = toStr(record.name) || toStr(record.company_name) || toStr(record.label)

    if (id === undefined || id === null || !name) return null

    return {
        id: id as string | number,
        name,
        activity: toStr(record.activity) || null,
        id_number: toStr(record.id_number) || null,
        logo: toStr(record.logo) || null,
        type_document: toStr(record.type_document) || null,
        is_active: typeof record.is_active === 'boolean' ? record.is_active : undefined,
        parent_company_id: toNumber(record.parent_company_id ?? record.parentCompanyId),
        created_by: toNumber(record.created_by),
        created_at: toStr(record.created_at) || null,
    }
}

export async function apiListCompanies<T = Company[]>(
    params: ListCompaniesParams = {},
) {
    const { pageIndex = 1, pageSize = 200 } = params

    const response = await ApiService.fetchDataWithAxios<unknown>({
        url: COMPANIES_BASE,
        method: 'get',
        params: {
            page: pageIndex,
            size: pageSize,
        },
    })

    const rawList = firstArrayCandidate(response)
    const list = rawList.map(mapToCompany).filter((item): item is Company => item !== null)

    return list as T
}

export async function apiGetCompanyById<T = Company>(id: string | number) {
    const response = await ApiService.fetchDataWithAxios<unknown>({
        url: `${COMPANIES_BASE}${encodeURIComponent(String(id))}`,
        method: 'get',
    })

    const company = mapToCompany(response)
    return (company ?? ({ id, name: '' } as Company)) as T
}

export async function apiCreateCompany(data: CompanyCreateRequest) {
    return ApiService.fetchDataWithAxios<void, CompanyCreateRequest>({
        url: COMPANIES_BASE,
        method: 'post',
        data,
    })
}

export async function apiCreateSubCompany(data: SubCompanyCreateRequest) {
    return ApiService.fetchDataWithAxios<void, SubCompanyCreateRequest>({
        url: `${COMPANIES_BASE}subcompany`,
        method: 'post',
        data,
    })
}

export async function apiUpdateCompany(id: string | number, data: CompanyUpdateRequest) {
    return ApiService.fetchDataWithAxios<void, CompanyUpdateRequest>({
        url: `${COMPANIES_BASE}${encodeURIComponent(String(id))}`,
        method: 'put',
        data,
    })
}

export async function apiDeactivateCompany(id: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${COMPANIES_BASE}${encodeURIComponent(String(id))}`,
        method: 'delete',
    })
}

export async function apiAssignUserToCompany(
    companyId: string | number,
    data: CompanyAssignUserRequest,
) {
    return ApiService.fetchDataWithAxios<void, CompanyAssignUserRequest>({
        url: `${COMPANIES_BASE}${encodeURIComponent(String(companyId))}/users`,
        method: 'post',
        data,
    })
}

export async function apiCreateUserAndAssignToCompany(
    companyId: string | number,
    data: CompanyUserCreateRequest,
) {
    return ApiService.fetchDataWithAxios<void, CompanyUserCreateRequest>({
        url: `${COMPANIES_BASE}${encodeURIComponent(String(companyId))}/create-users`,
        method: 'post',
        data,
    })
}

const CompaniesApi = {
    apiListCompanies,
    apiGetCompanyById,
    apiCreateCompany,
    apiCreateSubCompany,
    apiUpdateCompany,
    apiDeactivateCompany,
    apiAssignUserToCompany,
    apiCreateUserAndAssignToCompany,
}

export default CompaniesApi
