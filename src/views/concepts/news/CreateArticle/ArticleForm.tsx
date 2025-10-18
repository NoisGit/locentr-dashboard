// src/views/concepts/news/CreateArticle/ArticleForm.tsx
import { useForm } from 'react-hook-form'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'

type ArticleCreate = {
  title: string
  content: string
}

type Props = {
  defaultValues: ArticleCreate
  onFormSubmit: (data: ArticleCreate) => void
  children?: React.ReactNode
}

const ArticleForm = ({ defaultValues, onFormSubmit, children }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ArticleCreate>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
      <FormContainer className="max-w-[1400px] mx-auto px-6 space-y-6">
        <h2 className="text-xl font-semibold">Crear noticia</h2>

        <FormItem label="Título" invalid={!!errors.title} errorMessage={errors.title?.message}>
          <Input className="rounded-xl" {...register('title', { required: 'El título es obligatorio' })} />
        </FormItem>

        <FormItem label="Contenido">
          <RichTextEditor
            content={defaultValues.content}
            onChange={({ html }) => setValue('content', html)}
            editorContentClass="min-h-[220px]"
          />
        </FormItem>

        <div className="flex justify-end gap-4 mt-10">{children}</div>
      </FormContainer>
    </form>
  )
}

export default ArticleForm
