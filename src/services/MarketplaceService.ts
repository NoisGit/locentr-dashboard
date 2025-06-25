import ApiService from './ApiService'

// Listado paginado de marketplace
export async function apiGetMarketplaceList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/marketplace', 
        method: 'get',
        params,
    })
}

// Obtener un item individual por id
export async function apiGetMarketplace<T, U extends Record<string, unknown>>(
    params: U & { id: string }
) {
    // Separar el id y el resto de parámetros (por si algún filtro extra)
    const { id, ...otherParams } = params
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/marketplace/${id}`,
        method: 'get',
        params: otherParams, // así no se manda el id 2 veces
    })
}
