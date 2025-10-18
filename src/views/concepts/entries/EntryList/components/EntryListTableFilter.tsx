// src/views/concepts/entries/EntryList/components/EntryListTableFilter.tsx
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import useEntryList from '../hooks/useEntryList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const departmentsList = ['Building A', 'Building B', 'House 1', 'House 2', 'Admin Office']

const validationSchema = z.object({
  motivo: z.string().optional(),
  departamentoVisitado: z.array(z.string()).optional(),
})

type FormSchema = z.infer<typeof validationSchema>

const EntryListTableFilter = () => {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const { filterData, setFilterData } = useEntryList()

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const { handleSubmit, reset, control } = useForm<FormSchema>({
    defaultValues: {
      motivo: (filterData as any)?.motivo ?? '',
      departamentoVisitado: Array.isArray((filterData as any)?.departamentoVisitado)
        ? (filterData as any).departamentoVisitado
        : [],
    },
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = (values: FormSchema) => {
    setFilterData((prev: any) => ({
      ...prev,
      motivo: (values.motivo ?? '').trim(),
      departamentoVisitado: values.departamentoVisitado ?? [],
    }))
    setIsOpen(false)
  }

  const onClear = () => {
    reset({ motivo: '', departamentoVisitado: [] })
    setFilterData((prev: any) => ({ ...prev, motivo: '', departamentoVisitado: [] }))
    setIsOpen(false)
  }

  return (
    <>
      <Button icon={<TbFilter />} onClick={openDialog}>
        Filter
      </Button>

      <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
        <h4 className="mb-4">Filter entries</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem label="Entry reason">
            <Controller
              name="motivo"
              control={control}
              render={({ field }) => (
                <Input type="text" autoComplete="off" placeholder="Search by reason" {...field} />
              )}
            />
          </FormItem>

          <FormItem label="Department or unit">
            <Controller
              name="departamentoVisitado"
              control={control}
              render={({ field }) => (
                <Checkbox.Group vertical className="flex mt-4" {...field}>
                  {departmentsList.map((d) => (
                    <Checkbox
                      key={d}
                      name={field.name}
                      value={d}
                      className="justify-between flex-row-reverse heading-text"
                    >
                      {d}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
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

export default EntryListTableFilter
