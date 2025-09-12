// src/views/concepts/properties/PropertiesForm/PropertiesForm.tsx
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import Card from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import FormItem from '@/components/ui/Form/FormItem'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import isEmpty from 'lodash/isEmpty'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import {
  apiGetMyCommunities,
  apiListCommunities,
  type Community,
} from '@/services/CommunitiesService'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

export type PropertiesFormSchema = {
  community_id: number
  property_number: string
  floor: number
}

type PropertiesFormProps = {
  onFormSubmit: (values: PropertiesFormSchema) => void
  defaultValues?: Partial<PropertiesFormSchema>
  children?: ReactNode
} & CommonProps

const validationSchema = z.object({
  community_id: z.coerce.number().int().gt(0, { message: 'Selecciona la comunidad' }),
  property_number: z.string().min(1, { message: 'Número requerido' }),
  floor: z.coerce.number().int().min(0, { message: 'Piso requerido' }),
})

/** Lee tokens de rol del usuario (authority/roles/etc.) y detecta SuperAdmin */
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

const PropertiesForm = (props: PropertiesFormProps) => {
  const { onFormSubmit, defaultValues = {}, children } = props

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    getValues,
  } = useForm<PropertiesFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      community_id: 0,
      property_number: '',
      floor: 0,
      ...defaultValues,
    },
  })

  const { user } = useAuth()
  const superAdmin = isSuperAdminUser(user)
  const { selectedId: headerCommunityId } = useCommunitiesStore()

  const { data: communities, isLoading: loadingCommunities } = useSWR<Community[]>(
    superAdmin ? ['communities:all'] : ['communities:mine'],
    () => (superAdmin ? apiListCommunities({ pageIndex: 1, pageSize: 1000 }) : apiGetMyCommunities()),
    { revalidateOnFocus: false }
  )

  const communityOptions = useMemo(
    () =>
      (communities ?? [])
        .map((c) => {
          const idNum = Number((c as Community).id)
          if (!Number.isFinite(idNum)) return null
          return { label: (c as Community).name || String((c as Community).id), value: idNum }
        })
        .filter(Boolean) as Array<{ label: string; value: number }>,
    [communities]
  )

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        community_id: Number(defaultValues.community_id ?? 0),
        property_number: defaultValues.property_number ?? '',
        floor:
          defaultValues.floor === undefined || defaultValues.floor === null
            ? 0
            : Number(defaultValues.floor as unknown),
      })
      return
    }
    if (communityOptions.length > 0 && headerCommunityId != null && headerCommunityId !== '') {
      const formVal = getValues()
      if (!formVal.community_id || Number.isNaN(Number(formVal.community_id))) {
        const headerIdNum = Number(headerCommunityId)
        const exists = communityOptions.some((o) => o.value === headerIdNum)
        if (exists) {
          reset({ ...formVal, community_id: headerIdNum })
        }
      }
    }
  }, [JSON.stringify(defaultValues), communityOptions, headerCommunityId, reset, getValues])

  const onSubmit = (values: PropertiesFormSchema) => onFormSubmit?.(values)

  return (
    <Form
      className="flex w-full h-full"
      containerClassName="flex flex-col w-full justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Container>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="gap-4 flex flex-col flex-auto">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <FormItem
                    label="Comunidad"
                    invalid={!!errors.community_id}
                    errorMessage={errors.community_id?.message}
                  >
                    <Controller
                      name="community_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={communityOptions}
                          isSearchable={false}
                          isLoading={loadingCommunities}
                          isDisabled={loadingCommunities}
                          value={
                            communityOptions.find(
                              (o) => Number(o.value) === Number(field.value)
                            ) ?? null
                          }
                          placeholder="Selecciona comunidad"
                          onChange={(opt) =>
                            field.onChange(opt ? Number((opt as any).value) : 0)
                          }
                        />
                      )}
                    />
                  </FormItem>
                </div>

                <div className="md:col-span-2">
                  <FormItem
                    label="Número de propiedad"
                    invalid={!!errors.property_number}
                    errorMessage={errors.property_number?.message}
                  >
                    <Controller
                      name="property_number"
                      control={control}
                      render={({ field }) => <Input autoComplete="off" {...field} />}
                    />
                  </FormItem>
                </div>

                <div className="md:col-span-2">
                  <FormItem
                    label="Piso"
                    invalid={!!errors.floor}
                    errorMessage={errors.floor?.message}
                  >
                    <Controller
                      name="floor"
                      control={control}
                      render={({ field }) => (
                        <Input type="number" inputMode="numeric" {...field} />
                      )}
                    />
                  </FormItem>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      <BottomStickyBar>{children}</BottomStickyBar>
    </Form>
  )
}

export default PropertiesForm
