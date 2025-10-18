import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useInvitationsList from '../hooks/useInvitationsList'
import type { Filter as StoreFilter } from '../types'

const validationSchema = z.object({
  code: z.string().optional(),
  usedOnly: z.boolean().optional(),
})
type FormSchema = z.infer<typeof validationSchema>

type ExtraFilterFields = {
  code?: string
  usedOnly?: boolean
}

const InvitationsListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const { filterData, setFilterData } = useInvitationsList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const fd = filterData as StoreFilter & Partial<ExtraFilterFields>

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: {
      code: fd.code ?? '',
      usedOnly: Boolean(fd.usedOnly),
    },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    const updates: Partial<StoreFilter> & ExtraFilterFields = {
      code: (values.code ?? '').trim(),
      usedOnly: Boolean(values.usedOnly),
    }
    setFilterData((prev) => ({ ...(prev as StoreFilter), ...updates }))
    setIsOpen(false)
  }

  const onClear = () => {
    reset({ code: '', usedOnly: false })
    const updates: Partial<StoreFilter> & ExtraFilterFields = {
      code: '',
      usedOnly: false,
    }
    setFilterData((prev) => ({ ...(prev as StoreFilter), ...updates }))
    setIsOpen(false)
  }

  return (
    <>
      <Button icon={<TbFilter />} onClick={openDialog}>
        Filter
      </Button>

      <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
        <h4 className="mb-4">Filter invitations</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Code">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="Search by code"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.trim())}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <Controller
              name="usedOnly"
              control={control}
              render={({ field }) => (
                <Checkbox
                  className="justify-start"
                  checked={field.value}
                  onChange={(v) => field.onChange(v)}
                >
                  Used only
                </Checkbox>
              )}
            />
          </FormItem>

          <div className="flex justify-end items-center gap-2 mt-4">
            <Button type="button" onClick={onClear}>
              Clear
            </Button>
            <Button type="submit" variant="solid">
              Apply
            </Button>
          </div>
        </Form>
      </Dialog>
    </>
  )
}

export default InvitationsListTableFilter
