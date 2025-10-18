// src/views/concepts/news/ManageArticle/components/ArticleListTable.tsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import { useManageArticleStore } from '../store/manageArticleStore'
import useManageArticle from '../hooks/useManageArticle'
import { HiOutlinePencil } from 'react-icons/hi'
import { useAuth } from '@/auth'
import {
  extractCreatedBy,
  getCurrentUserIdSmart,
  isSuperAdmin,
  canEditNewsStrict,
} from '@/utils/newsPermissions'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Article } from '../types'

function formatDateIsoLike(v: unknown): string {
  if (typeof v !== 'string') return ''
  let s = v.trim()
  s = s.replace('T', ' ')
  s = s.replace(/Z$/, '')
  s = s.replace(/\.\d+$/, '')
  return s
}

const ArticleListTable = () => {
  const tableData = useManageArticleStore((s) => s.tableData)
  const selectedArticle = useManageArticleStore((s) => s.selectedArticle)
  const setSelectedArticle = useManageArticleStore((s) => s.setSelectedArticle)
  const setSelectAllArticle = useManageArticleStore((s) => s.setSelectAllArticle)
  const setTableData = useManageArticleStore((s) => s.setTableData)

  const { articleList, articleTotal, isLoading } = useManageArticle()

  const { user } = useAuth()
  const currentUserId = getCurrentUserIdSmart(user)
  const superAdmin = isSuperAdmin(undefined, user)

  const columns: ColumnDef<Article>[] = useMemo(
    () => [
      {
        header: 'Título',
        accessorKey: 'title',
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <div className="mb-1 leading-snug">
                  <span className="font-bold heading-text break-words">{row.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {(row.tags || []).map((tag) => (
                    <Tag key={tag.id}>{tag.label}</Tag>
                  ))}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Autor',
        accessorKey: 'authors',
        enableSorting: false,
        cell: (props) => {
          const r = props.row.original as Record<string, unknown>
          const a =
            (typeof r['author'] === 'string' && (r['author'] as string)) ||
            (typeof r['created_by'] === 'string' && (r['created_by'] as string)) ||
            (typeof r['author_name'] === 'string' && (r['author_name'] as string)) ||
            ''
          return <span className="truncate">{a || '—'}</span>
        },
      },
      {
        header: 'Última actualización',
        accessorKey: 'updateTimeStamp',
        cell: (props) => {
          const r = props.row.original as Record<string, unknown>
          const u =
            (r['updated_at'] as string | undefined) ||
            (r['updatedAt'] as string | undefined) ||
            (r['updateTime'] as string | undefined)
          const pretty = formatDateIsoLike(u)
          return <div>{pretty || '—'}</div>
        },
      },
      {
        header: '',
        id: 'action',
        enableSorting: false,
        cell: (props) => {
          const row = props.row.original as Article & Record<string, unknown>
          const id = String(row.id ?? '').trim()
          const createdBy = extractCreatedBy(row)
          const canEdit = canEditNewsStrict({
            currentUserId,
            createdByUserId: createdBy,
            isSuperAdmin: superAdmin,
          })
          if (!id || !canEdit) return <div className="text-right pr-2" />
          return (
            <div className="text-right pr-2">
              <Link
                to={`/concepts/news/edit-article/${id}`}
                className="text-xl text-gray-500 hover:text-primary"
                title="Editar noticia"
              >
                <HiOutlinePencil />
              </Link>
            </div>
          )
        },
      },
    ],
    [currentUserId, superAdmin]
  )

  const handleSetTableData = (data: TableQueries) => {
    setTableData(data)
    if (selectedArticle.length > 0) setSelectAllArticle([])
  }

  const handlePaginationChange = (page: number) => {
    const next = structuredClone(tableData)
    next.pageIndex = page
    handleSetTableData(next)
  }

  const handleSelectChange = (value: number) => {
    const next = structuredClone(tableData)
    next.pageSize = Number(value)
    next.pageIndex = 1
    handleSetTableData(next)
  }

  const handleSort = (sort: OnSortParam) => {
    const next = structuredClone(tableData)
    next.sort = sort
    handleSetTableData(next)
  }

  const handleRowSelect = (checked: boolean, row: Article) => setSelectedArticle(checked, row)

  const handleAllRowSelect = (checked: boolean, rows: Row<Article>[]) => {
    if (checked) setSelectAllArticle(rows.map((r) => r.original))
    else setSelectAllArticle([])
  }

  return (
    <DataTable
      selectable
      hoverable={false}
      columns={columns}
      data={articleList}
      noData={!isLoading && articleList.length === 0}
      skeletonAvatarColumns={[]}
      loading={isLoading}
      pagingData={{
        total: articleTotal || 0,
        pageIndex: tableData.pageIndex as number,
        pageSize: tableData.pageSize as number,
      }}
      checkboxChecked={(row) => selectedArticle.some((s) => s.id === row.id)}
      onPaginationChange={handlePaginationChange}
      onSelectChange={handleSelectChange}
      onSort={handleSort}
      onCheckBoxChange={handleRowSelect}
      onIndeterminateCheckBoxChange={handleAllRowSelect}
    />
  )
}

export default ArticleListTable
