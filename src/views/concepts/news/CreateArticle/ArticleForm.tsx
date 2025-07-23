import { useForm } from 'react-hook-form'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import type { Article } from './types'

type Props = {
  defaultValues: Article
  onFormSubmit: (data: Article) => void
  children?: React.ReactNode
}

const ArticleForm = ({ defaultValues, onFormSubmit, children }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Article>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
      <FormContainer className="max-w-[1400px] mx-auto px-6 space-y-6">
        <h2 className="text-xl font-semibold">Create article</h2>

        <FormItem label="Title" invalid={!!errors.title} errorMessage={errors.title?.message}>
          <Input
            className="rounded-xl"
            placeholder="Article title"
            {...register('title', { required: 'Title is required' })}
          />
        </FormItem>

        <FormItem label="Authors" invalid={!!errors.authors} errorMessage={errors.authors?.message}>
          <Input
            className="rounded-xl"
            placeholder="e.g. John Smith, Ana Diaz"
            {...register('authors')}
          />
        </FormItem>

        <FormItem label="Content">
          <RichTextEditor
            content={defaultValues.content}
            onChange={({ html }) => setValue('content', html)}
            editorContentClass="min-h-[220px]"
          />
        </FormItem>

        <FormItem label="Tags (comma separated)" invalid={!!errors.tags} errorMessage={errors.tags?.message}>
          <Input
            className="rounded-xl"
            placeholder="e.g. security, updates"
            {...register('tags')}
          />
        </FormItem>

        <div className="flex justify-end gap-4 mt-10">{children}</div>
      </FormContainer>
    </form>
  )
}

export default ArticleForm
