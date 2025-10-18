// ======= PRODUCTO PRINCIPAL (MARKETPLACE ITEM) =======
export type MarketplaceItem = {
    id: string
    name: string
    productCode: string
    img: string
    imgList: {
        id: string
        name: string
        img: string
    }[]
    category: string
    price: number
    stock: number
    status: number
    costPerItem: number
    bulkDiscountPrice: number
    taxRate: number | string
    tags: string[]
    brand: string
    vendor: string
    active: boolean
    sales: number
    salesPercentage: number
    description: string
}

// ======= SCHEMAS PARA FORMULARIOS =======
export type GeneralFields = {
    name: string
    productCode: string
    description: string
}

export type PricingFields = {
    price: number | string
    taxRate: number | string
    costPerItem: number | string
    bulkDiscountPrice: number | string
}

export type ImageFields = {
    imgList: {
        id: string
        name: string
        img: string
    }[]
}

export type AttributeFields = {
    category: string
    tags?: { label: string; value: string }[]
    brand?: string
}

// ======= SCHEMA DE FORMULARIO PARA CREAR/EDITAR =======
export type MarketplaceFormSchema = GeneralFields & PricingFields & ImageFields & AttributeFields

// Para usar con react-hook-form (props base de cada sección de formulario)
import type { Control, FieldErrors } from 'react-hook-form'
export type FormSectionBaseProps = {
    control: Control<MarketplaceFormSchema>
    errors: FieldErrors<MarketplaceFormSchema>
}

// ======= FILTRO DEL LISTADO =======
export type Filter = {
    minAmount: number | string
    maxAmount: number | string
    productStatus: string
    productType: string[]
}

// ======= RESPUESTA DE LISTADO PAGINADO =======
export type GetMarketplaceListResponse = {
    list: MarketplaceItem[]
    total: number
}

// ======= PARA COMPATIBILIDAD CON LISTAS SIMPLES =======
// (Si usas un listado más simple de "productos", puedes exportar también este alias)
export type Product = MarketplaceItem
export type GetProductListResponse = GetMarketplaceListResponse
