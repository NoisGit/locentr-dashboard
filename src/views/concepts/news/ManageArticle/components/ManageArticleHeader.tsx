// src/views/concepts/news/ManageArticle/ManageArticleHeader.tsx
import { useNavigate } from 'react-router-dom'
import ArticleListSearch from './ArticleListSearch'
import ArticleTableFilter from './ArticleTableFilter'
import Button from '@/components/ui/Button'
import { HiPlus } from 'react-icons/hi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { useAuth } from '@/auth'

/* Helpers mínimos para rol */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function readRoleTokens(user: unknown): string[] {
  if (!isRecord(user)) return []
  const u = user as Record<string, unknown>
  const src = (u.roles ?? u.role ?? u.authorities ?? u.authority) as unknown
  if (Array.isArray(src)) return src.map((x) => String(x).toLowerCase())
  if (src != null) return [String(src).toLowerCase()]
  return []
}
function isSuperAdminUser(user: unknown): boolean {
  const tokens = readRoleTokens(user)
  const set = new Set(tokens)
  const hits = ['superadmin', 'super-admin', 'super_admin', 'owner', 'root']
  return hits.some((t) => set.has(t) || tokens.some((x) => x.includes(t)))
}

const ManageArticleHeader = () => {
  const navigate = useNavigate()
  const { selectedId } = useCommunitiesStore()
  const { user } = useAuth()

  const superAdmin = isSuperAdminUser(user)
  const noCommunitySelected = !selectedId || String(selectedId) === ''

  const creationBlocked = superAdmin && noCommunitySelected

  const handleAddNew = () => {
    if (creationBlocked) {
      toast.push(
        <Notification type="warning">
          Selecciona una comunidad para poder crear una noticia.
        </Notification>,
        { placement: 'top-center' }
      )
      return // evita navegación
    }
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
      <div className="mt-4 flex items-center justify-between gap-4">
        <ArticleListSearch />
        <ArticleTableFilter />
      </div>
    </div>
  )
}

export default ManageArticleHeader
