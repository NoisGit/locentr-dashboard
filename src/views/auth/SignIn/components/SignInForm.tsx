import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { apiSignIn } from '@/services/AuthService'
import { useSessionUser, useToken } from '@/store/authStore'
import appConfig from '@/configs/app.config'

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

function normalizeAuthResponse(res: any) {
  const obj = res?.data ?? res ?? {}
  const accessToken =
    obj.access_token ?? obj.accessToken ?? obj.token ?? obj?.tokens?.access_token
  const refreshToken =
    obj.refresh_token ?? obj.refreshToken ?? obj?.tokens?.refresh_token
  const tokenType = (obj.token_type ?? obj.tokenType ?? 'Bearer') as string
  return { accessToken, refreshToken, tokenType }
}

const SignInForm = (props: SignInFormProps) => {
  const [isSubmitting, setSubmitting] = useState(false)
  const { disableSubmit = false, className, setMessage, passwordHint } = props
  const navigate = useNavigate()

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<SignInFormSchema>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(validationSchema),
  })

  const { setToken, setRefreshToken } = useToken()
  const { setSessionSignedIn } = useSessionUser()

  const onSignIn = async (values: SignInFormSchema) => {
    if (disableSubmit) return
    setSubmitting(true)
    setMessage?.('')

    try {
      const res = await apiSignIn({
        email: values.email,
        password: values.password,
      })

      const { accessToken, refreshToken, tokenType } = normalizeAuthResponse(res)

      if (accessToken) {
        const prefix = /^bearer/i.test(tokenType) ? tokenType : 'Bearer'
        setToken(`${prefix} ${accessToken}`)
        if (refreshToken) setRefreshToken(refreshToken)

        setSessionSignedIn(true)

        const target = appConfig.authenticatedEntryPath ?? '/dashboard'
        // navegación SPA
        navigate(target, { replace: true })

        // fallback duro si algún guard te devuelve al login:
        setTimeout(() => {
          if (window.location.pathname.includes('sign-in')) {
            window.location.replace(target)
          }
        }, 150)

        // si tu Form resetea por defecto, lo dejamos explícito para evitar confusión visual
        reset({ email: '', password: '' })
      } else {
        setMessage?.('Login failed. No access token received.')
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials.'
      setMessage?.(msg)
    } finally {
      setSubmitting(false)
    }
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
              <Input type="email" placeholder="Email" autoComplete="off" {...field} />
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

        <Button block loading={isSubmitting} variant="solid" type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>
    </div>
  )
}

export default SignInForm
