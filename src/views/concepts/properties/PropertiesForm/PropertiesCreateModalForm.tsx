import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetMyCommunities, apiListCommunities, type Community } from '@/services/CommunitiesService'

export type CreatePropertySchema = {
  community_id: number
  property_number: string
  floor: number
  block?: string
}

type Props = {
  onSubmit: (values: CreatePropertySchema) => void
  hideCommunity?: boolean
  formId?: string
}

const validationSchema = z.object({
  community_id: z.coerce.number().int().gt(0, { message: 'Selecciona la comunidad' }),
  property_number: z.string().min(1, { message: 'Número requerido' }),
  floor: z.coerce.number().int().min(0, { message: 'Piso requerido' }),
  block: z.string().optional(),
})

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function readRoleTokens(user: unknown): string[] {
  if (!isRecord(user)) return []
  const src =
    (user as any).roles ??
    (user as any).role ??
    (user as any).authorities ??
    (user as any).authority ??
    []
  if (Array.isArray(src)) return src.map((x) => String(x).toLowerCase())
  if (src != null) return [String(src).toLowerCase()]
  return []
}
function isSuperAdminUser(user: unknown): boolean {
  const tokens = readRoleTokens(user)
  const set = new Set(tokens)
  const hits = ['superadmin', 'super-admin', 'super_admin', 'owner', 'root']
  return hits.some((t) => set.has(t) || tokens.some((x) => x.includes(t)))
}

type Option = { label: string; value: number }

export default function PropertiesCreateModalForm({
  onSubmit,
  hideCommunity = true,
  formId = 'create-property-form',
}: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<CreatePropertySchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: { community_id: 0, property_number: '', floor: 0, block: '' },
  })

  const { user } = useAuth()
  const superAdmin = isSuperAdminUser(user)
  const { selectedId: headerCommunityId } = useCommunitiesStore()

  const { data: communities, isLoading: loadingCommunities } = useSWR<Community[]>(
    superAdmin ? ['communities:all'] : ['communities:mine'],
    () => (superAdmin ? apiListCommunities({ pageIndex: 1, pageSize: 1000 }) : apiGetMyCommunities()),
    { revalidateOnFocus: false },
  )

  const communityOptions: Option[] = useMemo(
    () =>
      (communities ?? [])
        .map((c) => {
          const idNum = Number((c as Community).id)
          if (!Number.isFinite(idNum)) return null
          return { label: (c as Community).name || String((c as Community).id), value: idNum }
        })
        .filter(Boolean) as Array<Option>,
    [communities],
  )

  // Autoselecciona la comunidad del header cuando el campo está oculto
  useEffect(() => {
    if (hideCommunity && headerCommunityId != null && String(headerCommunityId) !== '') {
      setValue('community_id', Number(headerCommunityId), { shouldDirty: false })
    }
  }, [hideCommunity, headerCommunityId, setValue])

  return (
    <Form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {!hideCommunity && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Comunidad</label>
            <Controller
              name="community_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={communityOptions}
                  isSearchable={false}
                  isLoading={loadingCommunities}
                  isDisabled={loadingCommunities}
                  value={communityOptions.find((o) => Number(o.value) === Number(field.value)) ?? null}
                  placeholder="Selecciona comunidad"
                  onChange={(opt) => field.onChange(opt ? Number((opt as Option).value) : 0)}
                />
              )}
            />
            {errors.community_id && (
              <p className="mt-1 text-xs text-red-600">{errors.community_id.message}</p>
            )}
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Número de propiedad <span className="text-red-500">*</span>
          </label>
          <Controller
            name="property_number"
            control={control}
            render={({ field }) => <Input autoComplete="off" {...field} />}
          />
          {errors.property_number && (
            <p className="mt-1 text-xs text-red-600">{errors.property_number.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Piso <span className="text-red-500">*</span>
          </label>
          <Controller
            name="floor"
            control={control}
            render={({ field }) => <Input type="number" inputMode="numeric" {...field} />}
          />
          {errors.floor && <p className="mt-1 text-xs text-red-600">{errors.floor.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Torre</label>
          <Controller
            name="block"
            control={control}
            render={({ field }) => <Input autoComplete="off" placeholder="Opcional" {...field} />}
          />
        </div>
      </div>
    </Form>
  )
}
