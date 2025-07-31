import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import { useManageHelpStore } from '../store/manageHelpStore'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    status: Array<'pending' | 'in_progress' | 'resolved'>
}

const validationSchema: ZodType<FormSchema> = z.object({
    status: z.array(z.enum(['pending', 'in_progress', 'resolved'])),
})

const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
]

const HelpTableFilter = () => {
    const [filterIsOpen, setFilterIsOpen] = useState(false)
    const filterData = useManageHelpStore((state) => state.filterData)
    const setFilterData = useManageHelpStore((state) => state.setFilterData)

    const { handleSubmit, control } = useForm<FormSchema>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setFilterData(values)
        setFilterIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setFilterIsOpen(true)}>
                Filter
            </Button>
            <Drawer
                title="Filter"
                isOpen={filterIsOpen}
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form
                    className="h-full"
                    containerClassName="flex flex-col justify-between h-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div>
                        <FormItem label="Filter by status">
                            <div className="mt-4">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Group
                                            vertical
                                            className="flex flex-col gap-2"
                                            {...field}
                                        >
                                            {statusOptions.map((opt) => (
                                                <Checkbox
                                                    key={opt.value}
                                                    name={field.name}
                                                    value={opt.value}
                                                    className="justify-between flex-row-reverse heading-text"
                                                >
                                                    {opt.label}
                                                </Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                    )}
                                />
                            </div>
                        </FormItem>
                    </div>
                    <Button variant="solid" type="submit">
                        Apply Filters
                    </Button>
                </Form>
            </Drawer>
        </>
    )
}

export default HelpTableFilter
