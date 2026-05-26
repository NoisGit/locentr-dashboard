export type TabKey = 'users' | 'whitelist' | 'blacklist' | 'logs'

export type ListType = 'whitelist' | 'blacklist'

export type ScopeType = 'location' | 'company' | 'portfolio'

export type TabItem = {
    key: TabKey
    label: string
}

export type ScopeOption = {
    value: ScopeType
    label: string
}
