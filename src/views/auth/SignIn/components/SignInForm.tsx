// src/views/auth/SignIn/components/SignInForm.tsx
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { apiSignIn } from '@/services/authService'
import { useSessionUser, useToken } from '@/store/authStore'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z.string().min(1, { message: 'Please enter your email' }),
    password: z.string().min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const { setToken, setRefreshToken } = useToken()
    const { setUser, setSessionSignedIn } = useSessionUser()

    const onSignIn = async (values: SignInFormSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        setMessage?.('')

        try {
            // Enviamos email y password al endpoint real
            const res = await apiSignIn({
                email: values.email,
                password: values.password,
            })

            // Tu backend devuelve access_token, refresh_token y token_type
            const accessToken = res.access_token
            const refreshToken = res.refresh_token
            const tokenType = res.token_type || 'bearer'

            if (accessToken && refreshToken) {
                // Guardamos tokens en Zustand
                setToken(`${tokenType} ${accessToken}`)
                setRefreshToken(refreshToken)

                // Si tu API tiene un /me, podrías llamar aquí para traer datos del usuario
                // const me = await apiMe()
                // setUser(me)

                setSessionSignedIn(true)
            } else {
                setMessage?.('Login failed. No access token received.')
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                'Login failed. Please check your credentials.'
            setMessage?.(msg)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignIn)}>
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className={classNames(
                        passwordHint ? 'mb-0' : '',
                        errors.password?.message ? 'mb-8' : '',
                    )}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                placeholder="Password"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {passwordHint}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
