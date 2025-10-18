import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import useAccessList from '../hooks/useAccessList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const departamentosList = [
    'Edificio A',
    'Edificio B',
    'Casa 1',
    'Casa 2',
    'Oficina Administración',
]

const validationSchema = z.object({
    motivo: z.string().optional(),
    departamentoVisitado: z.array(z.string()).optional(),
})

type FormSchema = z.infer<typeof validationSchema>

const AccessListTableFilter = () => {
    const [dialogIsOpen, setIsOpen] = useState(false)

    const { filterData, setFilterData } = useAccessList()

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    const { handleSubmit, reset, control } = useForm<FormSchema>({
        defaultValues: {
            motivo: filterData.motivo ?? '',
            departamentoVisitado: Array.isArray(filterData.departamentoVisitado)
                ? filterData.departamentoVisitado
                : [],
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setFilterData({
            motivo: values.motivo || '',
            departamentoVisitado: values.departamentoVisitado || [],
        })
        setIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={openDialog}>
                Filtrar
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h4 className="mb-4">Filtrar accesos</h4>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="Motivo de acceso">
                        <Controller
                            name="motivo"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Buscar por motivo"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Departamento o unidad">
                        <Controller
                            name="departamentoVisitado"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    vertical
                                    className="flex mt-4"
                                    {...field}
                                >
                                    {departamentosList.map((d, index) => (
                                        <Checkbox
                                            key={d + index}
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
                        <Button type="button" onClick={() => reset()}>
                            Limpiar
                        </Button>
                        <Button type="submit" variant="solid">
                            Aplicar
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default AccessListTableFilter
