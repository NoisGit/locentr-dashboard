import { useNavigate } from 'react-router-dom'
import ArticleListSearch from './ArticleListSearch'
import ArticleTableFilter from './ArticleTableFilter'
import Button from '@/components/ui/Button'
import { HiPlus } from 'react-icons/hi'

const ManageArticleHeader = () => {
  const navigate = useNavigate()

  const handleAddNew = () => {
    navigate('/concepts/news/create-article')
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h3>Noticias</h3>
        <Button
          variant="solid"
          size="sm"
          icon={<HiPlus />}
          onClick={handleAddNew}
        >
          Crear noticia
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4 mt-4">
        <ArticleListSearch />
        <ArticleTableFilter />
      </div>
    </div>
  )
}

export default ManageArticleHeader
