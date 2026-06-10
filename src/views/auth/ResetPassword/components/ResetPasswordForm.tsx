import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { apiResetPassword } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import { passwordSchema } from '@/utils/validation/schemas'

interface ResetPasswordFormProps extends CommonProps {
    resetToken: string
    resetComplete: boolean
    setResetComplete?: (compplete: boolean) => void
    setMessage?: (message: string) => void
}

type ResetPasswordFormSchema = {
    newPassword: string
    confirmPassword: string
}

const validationSchema: ZodType<ResetPasswordFormSchema> = z
    .object({
        newPassword: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const {
        className,
        resetToken,
        setMessage,
        setResetComplete,
        resetComplete,
        children,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onResetPassword = async (values: ResetPasswordFormSchema) => {
        const { newPassword, confirmPassword } = values

        if (!resetToken) {
            setMessage?.(
                'El enlace de recuperación no contiene un token válido. Solicita uno nuevo.',
            )
            return
        }

        try {
            setSubmitting(true)
            await apiResetPassword<void>({
                reset_token: resetToken,
                new_password: newPassword,
                confirm_new_password: confirmPassword,
            })
            setResetComplete?.(true)
        } catch (errors) {
            setMessage?.(
                typeof errors === 'string'
                    ? errors
                    : 'No fue posible restablecer la contraseña',
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            {!resetComplete ? (
                <Form onSubmit={handleSubmit(onResetPassword)}>
                    <FormItem
                        label="Nueva contraseña"
                        invalid={Boolean(errors.newPassword)}
                        errorMessage={errors.newPassword?.message}
                    >
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="new-password"
                                    placeholder="••••••••••••"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Confirmar contraseña"
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="new-password"
                                    placeholder="Repite tu contraseña"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        disabled={!resetToken}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
                    </Button>
                    {!resetToken ? (
                        <p className="mt-3 text-sm text-error">
                            Solicita un nuevo enlace de recuperación para
                            continuar.
                        </p>
                    ) : null}
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ResetPasswordForm
