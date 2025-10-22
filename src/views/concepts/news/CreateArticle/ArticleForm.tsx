import { useRef } from 'react'
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

  const editorShellRef = useRef<HTMLDivElement | null>(null)

  const focusEditor = () => {
    const root = editorShellRef.current
    if (!root) return
    const editable = root.querySelector('[contenteditable="true"]') as HTMLElement | null
    if (editable) editable.focus()
  }

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
          {/* --- contenedor completo clickeable --- */}
          <div
            ref={editorShellRef}
            className="cursor-text rounded-xl border border-gray-300 dark:border-gray-700 hover:border-sky-400 transition-colors"
            onMouseDown={(e) => {
              const target = e.target as HTMLElement
              if (!target.closest('[contenteditable="true"]')) {
                e.preventDefault()
                focusEditor()
              }
            }}
          >
            <RichTextEditor
              content={defaultValues.content}
              onChange={({ html }) => setValue('content', html)}
              editorContentClass="min-h-[220px] px-3 py-3"
              placeholder="Escribe el contenido aquí..."
            />
          </div>
        </FormItem>

        <div className="flex justify-end gap-4 mt-10">{children}</div>
      </FormContainer>
    </form>
  )
}

export default ArticleForm
