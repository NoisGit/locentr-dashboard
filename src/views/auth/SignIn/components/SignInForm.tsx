import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z, type ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { useAuth } from '@/auth'

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
  email: z.string().min(1, { message: 'Ingresa tu correo' }),
  password: z.string().min(1, { message: 'Ingresa tu contraseña' }),
})

const SignInForm = (props: SignInFormProps) => {
  const [isSubmitting, setSubmitting] = useState(false)
  const { disableSubmit = false, className, passwordHint, setMessage } = props
  const { signIn } = useAuth()

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignInFormSchema>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(validationSchema),
  })

  const onSignIn = async (values: SignInFormSchema) => {
    if (disableSubmit) return
    setSubmitting(true)
    setMessage?.('')
    try {
      const res = await signIn(values)
      if (res.status === 'failed') {
        setMessage?.(res.message || 'No fue posible iniciar sesión.')
      }
    } catch {
      setMessage?.('No fue posible iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <Form onSubmit={handleSubmit(onSignIn)}>
        <FormItem label="Correo" invalid={Boolean(errors.email)} errorMessage={errors.email?.message}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                type="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
                {...field}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Contraseña"
          invalid={Boolean(errors.password)}
          errorMessage={errors.password?.message}
          className={classNames(errors.password?.message ? 'mb-8' : '')}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                {...field}
              />
            )}
          />
        </FormItem>

        {passwordHint}

        <Button block loading={isSubmitting} variant="solid" type="submit">
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </Form>
    </div>
  )
}

export default SignInForm
