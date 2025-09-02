// src/views/concepts/mailbox/MailboxList/components/MailboxListTableFilter.tsx
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
import useMailboxList from '../hooks/useMailboxList'
import type { Filter as StoreFilter } from '../types'

const validationSchema = z.object({
  recipientName: z.string().optional(),
  trackingNumber: z.string().optional(),
  deliveryCompany: z.string().optional(),
  deliveredOnly: z.boolean().optional(),
})
type FormSchema = z.infer<typeof validationSchema>

type ExtraFilterFields = {
  recipientName?: string
  trackingNumber?: string
  deliveryCompany?: string
  deliveredOnly?: boolean
}

const MailboxListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const { filterData, setFilterData } = useMailboxList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const fd = filterData as StoreFilter & Partial<ExtraFilterFields>

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: {
      recipientName: fd.recipientName ?? '',
      trackingNumber: fd.trackingNumber ?? '',
      deliveryCompany: fd.deliveryCompany ?? '',
      deliveredOnly: Boolean(fd.deliveredOnly),
    },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    const updates: Partial<StoreFilter> & ExtraFilterFields = {
      recipientName: (values.recipientName ?? '').trim(),
      trackingNumber: (values.trackingNumber ?? '').trim(),
      deliveryCompany: (values.deliveryCompany ?? '').trim(),
      deliveredOnly: Boolean(values.deliveredOnly),
    }
    setFilterData((prev) => ({ ...(prev as StoreFilter), ...updates }))
    setIsOpen(false)
  }

  const onClear = () => {
    reset({ recipientName: '', trackingNumber: '', deliveryCompany: '', deliveredOnly: false })
    const updates: Partial<StoreFilter> & ExtraFilterFields = {
      recipientName: '',
      trackingNumber: '',
      deliveryCompany: '',
      deliveredOnly: false,
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
        <h4 className="mb-4">Filter mailbox</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Recipient">
            <Controller
              name="recipientName"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="Search by recipient"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/^\s+/, '').replace(/\s{2,}/g, ' '))
                  }
                />
              )}
            />
          </FormItem>

          <FormItem label="Tracking number">
            <Controller
              name="trackingNumber"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="Search by tracking number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.trim())}
                />
              )}
            />
          </FormItem>

          <FormItem label="Delivery company">
            <Controller
              name="deliveryCompany"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="Search by company"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/^\s+/, '').replace(/\s{2,}/g, ' '))
                  }
                />
              )}
            />
          </FormItem>

          <FormItem>
            <Controller
              name="deliveredOnly"
              control={control}
              render={({ field }) => (
                <Checkbox
                  className="justify-start"
                  checked={field.value}
                  onChange={(v) => field.onChange(v)}
                >
                  Delivered only
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

export default MailboxListTableFilter
