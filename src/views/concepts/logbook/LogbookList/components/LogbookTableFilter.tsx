import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { components } from 'react-select'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import useLogbookList from '../hooks/useLogbookList'
import { TbFilter, TbMinus } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { ControlProps, OptionProps } from 'react-select'
import classNames from '@/utils/classNames'

type FormSchema = {
    minAmount: number | string
    maxAmount: number | string
    logbookStatus: string
    logbookType: Array<string>
}

type Option = {
    value: string
    label: string
    className: string
}

const { Control } = components

const logbookStatusOption: Option[] = [
    { value: 'open', label: 'Open', className: 'bg-emerald-500' },
    { value: 'closed', label: 'Closed', className: 'bg-red-500' },
    { value: 'pending', label: 'Pending', className: 'bg-amber-500' },
    { value: 'archived', label: 'Archived', className: 'bg-gray-400' },
]

const logbookTypeList = ['Incident', 'Maintenance', 'Visitor', 'Delivery', 'Other']

const CustomSelectOption = (props: OptionProps<Option>) => {
    return (
        <DefaultOption<Option>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Badge className={data.className} />
                    <span className="ml-2 rtl:mr-2">{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Badge className={classNames('ml-4', selected.className)} />
            )}
            {children}
        </Control>
    )
}

const validationSchema: ZodType<FormSchema> = z.object({
    minAmount: z.union([z.string(), z.number()]),
    maxAmount: z.union([z.string(), z.number()]),
    logbookStatus: z.string(),
    logbookType: z.array(z.string()),
})

const LogbookTableFilter = () => {
    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const { filterData, setFilterData } = useLogbookList()

    const { handleSubmit, control, getValues } = useForm<FormSchema>({
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
                        <FormItem label="Logbook amount">
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="minAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericInput
                                            thousandSeparator
                                            type="text"
                                            inputPrefix="$"
                                            autoComplete="off"
                                            placeholder="0.00"
                                            value={field.value}
                                            max={getValues('maxAmount')}
                                            isAllowed={(values) => {
                                                const { floatValue } = values
                                                return (
                                                    (floatValue || 0) <=
                                                    (getValues(
                                                        'maxAmount',
                                                    ) as number)
                                                )
                                            }}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                        />
                                    )}
                                />
                                <span>
                                    <TbMinus />
                                </span>
                                <Controller
                                    name="maxAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericInput
                                            thousandSeparator
                                            type="text"
                                            inputPrefix="$"
                                            autoComplete="off"
                                            placeholder="0.00"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        </FormItem>
                        <FormItem label="Logbook status">
                            <Controller
                                name="logbookStatus"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        options={logbookStatusOption}
                                        {...field}
                                        value={logbookStatusOption.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                            Control: CustomControl,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label="Logbook type">
                            <div className="mt-4">
                                <Controller
                                    name="logbookType"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Group
                                            vertical
                                            className="flex"
                                            {...field}
                                        >
                                            {logbookTypeList.map(
                                                (type, index) => (
                                                    <Checkbox
                                                        key={type + index}
                                                        name={field.name}
                                                        value={type}
                                                        className="justify-between flex-row-reverse heading-text"
                                                    >
                                                        {type}
                                                    </Checkbox>
                                                ),
                                            )}
                                        </Checkbox.Group>
                                    )}
                                />
                            </div>
                        </FormItem>
                    </div>
                    <Button variant="solid" type="submit">
                        Query
                    </Button>
                </Form>
            </Drawer>
        </>
    )
}

export default LogbookTableFilter
