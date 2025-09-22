// src/views/concepts/news/ManageArticle/components/ArticleListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbChecks } from 'react-icons/tb'
import useManageArticle from '../hooks/useManageArticle'
import { useManageArticleStore } from '../store/manageArticleStore'
import { apiDeleteNews } from '@/services/NewsService'

const ArticleListSelected = () => {
  const { selectedArticle, setSelectAllArticle } = useManageArticleStore()
  const { articleList, articleTotal, tableData, communityId, mutate } = useManageArticle()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const hasSelection = (selectedArticle?.length ?? 0) > 0

  const handleConfirm = async () => {
    if (!communityId) return
    setLoading(true)

    const ids = Array.from(new Set(selectedArticle.map((s) => String(s.id))))
    const newList = articleList.filter((a) => !ids.includes(String(a.id)))
    const newTotal = Math.max(0, (articleTotal ?? 0) - ids.length)

    await mutate({ list: newList, total: newTotal }, false)
    setOpen(false)
    setSelectAllArticle([])

    await Promise.allSettled(ids.map((id) => apiDeleteNews(String(communityId), id)))
    await mutate()

    setLoading(false)
  }

  return hasSelection ? (
    <>
      <StickyFooter
        className="flex items-center justify-between py-4 bg-white dark:bg-gray-800"
        stickyClass="-mx-4 sm:-mx-8 border-t border-gray-200 dark:border-gray-700 px-8"
        defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TbChecks className="text-lg text-primary" />
              <span className="font-semibold heading-text">
                {selectedArticle.length} noticias seleccionadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                type="button"
                customColorClass={() =>
                  'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                }
                onClick={() => setOpen(true)}
                disabled={loading}
              >
                {loading ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      </StickyFooter>

      <ConfirmDialog
        isOpen={open}
        type="danger"
        title={selectedArticle.length === 1 ? 'Eliminar noticia' : 'Eliminar noticias'}
        onClose={() => setOpen(false)}
        onRequestClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      >
        <p className="mb-2">
          {selectedArticle.length === 1
            ? '¿Estás segura de que quieres eliminar esta noticia?'
            : `¿Estás segura de que quieres eliminar estas ${selectedArticle.length} noticias?`}
        </p>
        <p>Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </>
  ) : null
}

export default ArticleListSelected
