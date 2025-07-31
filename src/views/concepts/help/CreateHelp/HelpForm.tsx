import { useForm } from 'react-hook-form'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import Checkbox from '@/components/ui/Checkbox'
import type { HelpTicket } from '../ManageHelp/types'
import { useEffect, useState, cloneElement } from 'react'

type Props = {
    defaultValues: HelpTicket
    onFormSubmit: (data: HelpTicket) => void
    children?: React.ReactNode
}

const HelpForm = ({ defaultValues, onFormSubmit, children }: Props) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<HelpTicket>({ defaultValues })

    const acceptTermsChecked = watch('acceptTerms')
    const [isDisabled, setIsDisabled] = useState(true)

    useEffect(() => {
        setIsDisabled(!acceptTermsChecked)
    }, [acceptTermsChecked])

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
            <FormContainer className="max-w-[1400px] mx-auto px-6 space-y-6">
                <h2 className="text-xl font-semibold">Create Support Ticket</h2>

                <FormItem
                    label="Email"
                    invalid={!!errors.email}
                    errorMessage={errors.email?.message}
                >
                    <Input
                        className="rounded-xl"
                        placeholder="you@example.com"
                        {...register('email', { required: 'Email is required' })}
                    />
                </FormItem>

                <FormItem
                    label="Subject"
                    invalid={!!errors.subject}
                    errorMessage={errors.subject?.message}
                >
                    <Input
                        className="rounded-xl"
                        placeholder="Brief summary of your issue"
                        {...register('subject', { required: 'Subject is required' })}
                    />
                </FormItem>

                <FormItem label="Message">
                    <RichTextEditor
                        content={defaultValues.message}
                        onChange={({ html }) => setValue('message', html)}
                        editorContentClass="min-h-[220px]"
                    />
                </FormItem>

                <FormItem
                    label=" "
                    invalid={!!errors.acceptTerms}
                    errorMessage={errors.acceptTerms?.message}
                >
                    <div className="flex items-start gap-2">
                        <Checkbox
                            {...register('acceptTerms', {
                                required: 'Please accept the terms',
                            })}
                        />
                        <p className="text-sm text-gray-700 leading-snug">
                            Acepto que este ticket será enviado al equipo de soporte y no podrá
                            cancelarse una vez enviado.
                        </p>
                    </div>
                </FormItem>

                <div className="flex justify-end gap-4 mt-10">
                    {children &&
                        Array.isArray(children)
                            ? children.map((child, index) =>
                                  index === children.length - 1
                                      ? cloneElement(child as React.ReactElement, {
                                            disabled: isDisabled,
                                        })
                                      : child
                              )
                            : children}
                </div>
            </FormContainer>
        </form>
    )
}

export default HelpForm
