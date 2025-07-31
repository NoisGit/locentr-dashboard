// Tipos de categoría para tickets de soporte
export type HelpCategoryValue = 'technical' | 'billing' | 'feature' | 'other'

// Opciones disponibles para usar en selects u otros inputs
export const categoryOptions: Array<{ label: string; value: HelpCategoryValue }> = [
    { label: 'Technical issue', value: 'technical' },
    { label: 'Billing', value: 'billing' },
    { label: 'Feature request', value: 'feature' },
    { label: 'Other', value: 'other' },
]
