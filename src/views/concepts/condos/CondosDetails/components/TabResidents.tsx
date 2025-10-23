type Props = {
  communityId?: number
  condoId?: number
}

/**
 * Placeholder listo para conectar a tu lista/servicio de Residentes.
 * Me pasas el componente/servicio y lo incrustamos tal cual, siguiendo el patrón de communityId ('' = todas).
 */
export default function TabResidents({ communityId }: Props) {
  return (
    <div className="text-sm text-gray-500">
      (Residentes) Conecta aquí la tabla existente. communityId = {communityId ?? 'todas'}
    </div>
  )
}
