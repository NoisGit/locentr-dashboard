// src/views/concepts/users/CustomerList/components/CustomerListTableFilter.tsx
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import useCustomerList from '../hooks/useCustomerList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { initialFilterData } from '../store/customerListStore'

type FormSchema = {
  purchasedProducts: string
  purchaseChannel: Array<string>
}

const channelList = [
  'Retail Stores',
  'Online Retailers',
  'Resellers',
  'Mobile Apps',
  'Direct Sales',
]

const validationSchema: ZodType<FormSchema> = z.object({
  purchasedProducts: z.string(),
  purchaseChannel: z.array(z.string()),
})

const CustomerListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)

  const { filterData, setFilterData } = useCustomerList()

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: filterData,
    resolver: zodResolver(validationSchema),
  })

  const openDialog = () => {
    // cuando abres, sincroniza el form con lo que haya en el store
    reset(filterData)
    setIsOpen(true)
  }

  const onDialogClose = () => {
    setIsOpen(false)
  }

  const onSubmit = (values: FormSchema) => {
    setFilterData(values)
    setIsOpen(false)
  }

  const onResetAll = () => {
    reset(initialFilterData)
    setFilterData(initialFilterData)
  }

  return (
    <>
      <Button icon={<TbFilter />} onClick={openDialog}>
        Filter
      </Button>

      <Dialog
        isOpen={dialogIsOpen}
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <h4 className="mb-4">Filter</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Products">
            <Controller
              name="purchasedProducts"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="Search by purchased product"
                  {...field}
                />
              )}
            />
          </FormItem>

          <FormItem label="Purchase Channel">
            <Controller
              name="purchaseChannel"
              control={control}
              render={({ field }) => (
                <Checkbox.Group
                  vertical
                  className="flex mt-4"
                  value={field.value}
                  // Asegura array<string> controlado
                  onChange={(vals) => field.onChange(vals as string[])}
                >
                  {channelList.map((source) => (
                    <Checkbox
                      key={source}
                      name={field.name}
                      value={source}
                      className="justify-between flex-row-reverse heading-text"
                    >
                      {source}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              )}
            />
          </FormItem>

          <div className="flex justify-end items-center gap-2 mt-4">
            <Button type="button" onClick={onResetAll}>
              Reset
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

export default CustomerListTableFilter
