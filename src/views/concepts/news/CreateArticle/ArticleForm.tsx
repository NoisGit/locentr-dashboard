// src/views/concepts/news/ManageArticle/components/ArticleForm.tsx
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'

type ArticleCreate = {
  title: string
  content: string
}

type Props = {
  defaultValues: ArticleCreate
  onFormSubmit: (data: ArticleCreate) => void
  children?: React.ReactNode
}

// Quita todas las etiquetas HTML simples (<p>, <strong>, etc.)
function stripHtml(input: string | undefined | null): string {
  if (!input) return ''
  return String(input).replace(/<[^>]*>/g, '').trim()
}

const ArticleForm = ({ defaultValues, onFormSubmit, children }: Props) => {
  // Sanitizamos el contenido inicial por si viene con <p> u otras etiquetas
  const sanitizedDefaults = useMemo(
    () => ({
      ...defaultValues,
      content: stripHtml(defaultValues?.content),
    }),
    [defaultValues],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleCreate>({ defaultValues: sanitizedDefaults })

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
      <FormContainer className="max-w-[1400px] mx-auto px-6 space-y-6">
        <h2 className="text-xl font-semibold">Crear noticia</h2>

        <FormItem label="Título" invalid={!!errors.title} errorMessage={errors.title?.message}>
          <Input
            className="rounded-xl"
            {...register('title', { required: 'El título es obligatorio' })}
          />
        </FormItem>

        <FormItem label="Contenido">
          <textarea
            className="w-full min-h-[220px] rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-3 outline-none focus:border-sky-400 transition-colors resize-y"
            placeholder="Escribe el contenido aquí..."
            {...register('content', {
              setValueAs: (v) => stripHtml(v), // por si pega HTML accidentalmente
            })}
            defaultValue={sanitizedDefaults.content}
          />
        </FormItem>

        <div className="flex justify-end gap-4 mt-10">{children}</div>
      </FormContainer>
    </form>
  )
}

export default ArticleForm
