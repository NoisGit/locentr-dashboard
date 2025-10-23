type Props = {
  communityId?: number
  condoId?: number
}

/**
 * Placeholder para “Colaboradores” = Conserjes + Guardias.
 * Cuando me pases el servicio/lista de usuarios, lo filtro por roles:
 *   roles_in=['CONCIERGE','CONSERJE','GUARD','GUARDIA', ...]
 * Si la API no soporta roles_in, filtramos client-side por el campo de rol.
 */
export default function TabCollaborators({ communityId }: Props) {
  return (
    <div className="text-sm text-gray-500">
      (Colaboradores) Conecta aquí la tabla de usuarios filtrada a conserjes y guardias. communityId = {communityId ?? 'todas'}
    </div>
  )
}
